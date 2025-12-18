// utils/pdfGenerator.js
import PDFDocument from 'pdfkit';

/**
 * Generate PDF report with optional grouping
 * @param {Object} res - Express response object
 * @param {Array<Object>} data
 * @param {Array<string>} headers - Table headers
 * @param {Array<number>} colWidths - Column widths in points
 * @param {Object} options
 *   - title: string
 *   - groupBy: string (field to group by)
 *   - formatCell: function (optional formatter per cell)
 */
export const generatePdfReport = (res, data, headers, colWidths, options = {}) => {
  const {
    title = 'Report',
    groupBy,
    formatCell = (value) => (value == null ? 'N/A' : String(value)),
  } = options;

  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  const reportDate = new Date().toLocaleDateString('en-GB');

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}_${reportDate}.pdf"`,
  });

  doc.pipe(res);

  // Main Title
  doc.fontSize(20).font('Helvetica-Bold').text(title.toUpperCase(), { align: 'center' });
  doc.fontSize(12).text(`Generated on: ${reportDate}`, { align: 'center' });
  doc.moveDown(3);

  let y = doc.y;

  if (!groupBy) {
    drawTable(doc, data, headers, colWidths, y, formatCell);
  } else {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy] || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    Object.keys(grouped).sort().forEach((groupValue) => {
      const groupData = grouped[groupValue];

      // Group Title
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#003366')
        .text(`${groupBy.toUpperCase()}: ${groupValue.toUpperCase()}`, 30, y);

      doc
        .moveTo(30, y + 20)
        .lineTo(810, y + 20)
        .strokeColor('#4F81BD')
        .lineWidth(2)
        .stroke();

      y += 50;

      // Table for this group
      drawTable(doc, groupData, headers, colWidths, y, formatCell);

      y = doc.y + 40; // space before next group
      if (y > 550) {
        doc.addPage();
        y = 100;
      }
    });
  }

  doc.end();
};

// Helper to draw table
function drawTable(doc, data, headers, colWidths, startY, formatCell) {
  let y = startY;

  // Header
  let x = 30;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
  headers.forEach((h, i) => {
    doc.text(h, x, y, { width: colWidths[i], align: 'center' });
    x += colWidths[i];
  });
  doc.moveTo(30, y + 15).lineTo(810, y + 15).stroke();

  y += 30;
  doc.font('Helvetica').fontSize(9);

  data.forEach((item) => {
    x = 30;
    headers.forEach((_, i) => {
      const key = Object.keys(item)[i]; // assumes order matches headers
      const value = formatCell(item[key]);
      doc.text(value, x, y, { width: colWidths[i], align: 'center' });
      x += colWidths[i];
    });

    y += 20;
    if (y > 550) {
      doc.addPage();
      y = 100;
    }
  });

  doc.y = y;
}