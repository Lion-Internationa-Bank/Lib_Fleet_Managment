// utils/reportGenerator.js
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType } from 'docx';
import { generateExcelReport } from './excelGenerator.js';

const PERIODS = {
  monthly: (now) => new Date(now.getFullYear(), now.getMonth(), 1),
  quarterly: (now) => {
    const q = Math.floor(now.getMonth() / 3) * 3;
    return new Date(now.getFullYear(), q, 1);
  },
  halfyear: (now) => now.getMonth() >= 6 
    ? new Date(now.getFullYear(), 6, 1) 
    : new Date(now.getFullYear(), 0, 1),
  '9month': (now) => new Date(now.getFullYear(), now.getMonth() - 8, 1),
  yearly: (now) => new Date(now.getFullYear(), 0, 1),
};

export const generateReport = async ({
  res,
  data,                    // already enriched data array
  config,                  // report config (see below)
  format,
  titleSuffix,
}) => {
  const { title, excelColumns, pdfHeaders, pdfColWidths } = config;
  const filename = `${title.replace(/\s+/g, '_')}_${titleSuffix.replace(/[/]/g, '-')}`;

  if (format === 'excel') {
    const buffer = await generateExcelReport(data, excelColumns, title, { groupBy: null });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(buffer);
    return;
  }

  if (format === 'pdf') {
    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true 
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}.pdf"` });
    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text(title.toUpperCase(), { align: 'center' });
    doc.fontSize(14).text(`Period: ${titleSuffix}`, { align: 'center' });
    doc.moveDown(3);

    const usableWidth = doc.page.width - 100; // left + right margin
    const totalBase = pdfColWidths.reduce((a, b) => a + b, 0);
    const scaledWidths = pdfColWidths.map(w => (w / totalBase) * usableWidth);

    let y = doc.y;
    const left = 50;

    const drawHeader = () => {
      let x = left;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
      pdfHeaders.forEach((h, i) => {
        doc.fillColor('#4F81BD').rect(x, y, scaledWidths[i], 30).fill();
        doc.fillColor('#FFFFFF').text(h, x + 5, y + 10, { width: scaledWidths[i] - 10, align: 'center' });
        x += scaledWidths[i];
      });
      y += 35;
      doc.fillColor('black').font('Helvetica').fontSize(9);
    };

    drawHeader();

    data.forEach(item => {
      const row = pdfHeaders.map(h => {
        const key = h.toLowerCase().replace(/ /g, '_');
        return item[key] ?? 'N/A';
      });

      const lineHeights = row.map((text, i) => {
        const height = doc.heightOfString(String(text), { width: scaledWidths[i] - 10 });
        return Math.ceil(height / doc.currentLineHeight());
      });
      const rowLines = Math.max(...lineHeights, 1);
      const rowHeight = rowLines * 22 + 10;

      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 80;
        drawHeader();
      }

      let x = left;
      row.forEach((text, i) => {
        doc.text(String(text), x + 5, y + 5, {
          width: scaledWidths[i] - 10,
          lineBreak: true,
        });
        x += scaledWidths[i];
      });

      doc.moveTo(left, y + rowHeight).lineTo(doc.page.width - 50, y + rowHeight).stroke('#EEEEEE');
      y += rowHeight;
    });

    // Clean up empty pages
    const pages = doc.bufferedPageRange();
    for (let i = pages.count - 1; i > 0; i--) {
      if (doc.bufferedPageRange().start + i >= pages.start + pages.count) {
        doc.switchToPage(i);
        if (doc.y === 50) doc.deletePage(i + 1);
      }
    }

    doc.end();
    return;
  }

  if (format === 'word') {
    const children = [
      new Paragraph({ text: title.toUpperCase(), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `Period: ${titleSuffix}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
      new Paragraph({ text: "" }),
    ];

    const table = new Table({
      rows: [
        new TableRow({
          children: pdfHeaders.map(h => new TableCell({ children: [new Paragraph({ text: h, bold: true })] })),
        }),
        ...data.map(item => new TableRow({
          children: pdfHeaders.map(h => {
            const key = h.toLowerCase().replace(/ /g, '_');
            return new TableCell({ children: [new Paragraph(String(item[key] ?? 'N/A'))] });
          }),
        })),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    children.push(table);

    const docx = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(docx);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}.docx"`,
    }).send(buffer);
  }
};

export const getDateRange = (period, startDate, endDate) => {
  let query = {};
  let suffix = '';
  const now = new Date();

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = { $gte: start, $lte: end };
    suffix = `${start.toLocaleDateString('en-GB')} - ${end.toLocaleDateString('en-GB')}`;
  } else if (period) {
    const startFn = PERIODS[period.toLowerCase()];
    if (!startFn) throw new Error('Invalid period');
    const start = startFn(now);
    query = { $gte: start, $lte: now };
    suffix = `${start.toLocaleDateString('en-GB')} - ${now.toLocaleDateString('en-GB')}`;
  } else {
    throw new Error('Provide period or startDate/endDate');
  }

  return { query, suffix };
};