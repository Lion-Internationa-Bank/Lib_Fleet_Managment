// controllers/reportController.js
import ForeclosedVehicle from '../models/ForeclosureVehicle.js';
import { generateExcelReport } from '../utils/excelGenerator.js';
import Accident from '../models/Accident.js';
import Vehicle from '../models/Vehicle.js';
import PDFDocument from 'pdfkit';
import { Packer, Document, Table,HeightRule, TableRow, TableCell, Paragraph,PageOrientation, TextRun, WidthType,VerticalAlign, BorderStyle ,HeadingLevel, AlignmentType,TableLayoutType,TextDirection,} from 'docx';
import catchAsync from '../utils/catchAsync.js';

// Helper function to get date range based on period

const getDateRange = (period, startDate, endDate) => {
  let query = {};
  let titleSuffix = '';
  const now = new Date();

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = { $gte: start, $lte: end };
    titleSuffix = `${start.toLocaleDateString('en-GB')} - ${end.toLocaleDateString('en-GB')}`;
  } else if (period) {
    let start;
    switch (period.toLowerCase()) {
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const q = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), q, 1);
        break;
      case 'halfyear':
        start = now.getMonth() >= 6 ? new Date(now.getFullYear(), 6, 1) : new Date(now.getFullYear(), 0, 1);
        break;
      case '9month':
        start = new Date(now.getFullYear(), now.getMonth() - 8, 1);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        throw new Error('Invalid period');
    }
    query = { $gte: start, $lte: now };
    titleSuffix = `${start.toLocaleDateString('en-GB')} - ${now.toLocaleDateString('en-GB')}`;
  } else {
    throw new Error('Provide period or startDate/endDate');
  }

  return { query, titleSuffix };
};

export const generateForeclosedReport = catchAsync(async (req, res) => {
  const { format = 'excel', period, startDate, endDate } = req.query;

  if (!['excel', 'pdf', 'word'].includes(format.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Format must be excel, pdf, or word' });
  }

  // Get date range using helper function
  let dateQuery, titleSuffix;
  try {
    const result = getDateRange(period, startDate, endDate);
    dateQuery = result.query;
    titleSuffix = result.titleSuffix;
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const query = { date_into: dateQuery };
  const vehicles = await ForeclosedVehicle.find(query).sort({ date_into: 1 }).lean();

  if (vehicles.length === 0) {
    return res.status(404).json({ success: false, message: 'No foreclosed vehicles found' });
  }

  const totalHandover = vehicles.length;
  const totalTakeover = vehicles.filter(v => v.date_out).length;
  const stillUnderPFMD = totalHandover - totalTakeover;

  const filename = `Foreclosed_Vehicles_${titleSuffix.replace(/[/]/g, '-')}`;

  // Define columns and format row function inside generateForeclosedReport
  const foreclosedColumns = [
    { header: 'S.N', key: 'sn', width: 10 },
    { header: 'Plate No', key: 'plate_no', width: 18 },
    { header: 'Property Owner', key: 'property_owner', width: 28 },
    { header: 'Lender Branch', key: 'lender_branch', width: 32 },
    { header: 'Parking Place', key: 'parking_place', width: 32 },
    { header: 'Date In', key: 'date_into', width: 20 },
    { header: 'Date Out', key: 'date_out', width: 20 },
  ];

  const foreclosedFormatRow = (v, index) => ({
    sn: index + 1,
    plate_no: v.plate_no,
    property_owner: v.property_owner || 'N/A',
    lender_branch: v.lender_branch || 'N/A',
    parking_place: v.parking_place || 'N/A',
    date_into: v.date_into ? new Date(v.date_into).toLocaleDateString('en-GB') : 'N/A',
    date_out: v.date_out ? new Date(v.date_out).toLocaleDateString('en-GB') : 'N/A',
  });

  if (format.toLowerCase() === 'excel') {
    const fullData = [
      ...vehicles.map((v, index) => foreclosedFormatRow(v, index)),
      {}, {},
      { sn: 'SUMMARY', plate_no: '' },
      { sn: 'Total Handover', plate_no: '', property_owner: totalHandover },
      { sn: 'Total Takeover', plate_no: '', property_owner: totalTakeover },
      { sn: 'Still Under PFMD', plate_no: '', property_owner: stillUnderPFMD },
    ];

    const buffer = await generateExcelReport(fullData, foreclosedColumns, 'Foreclosed Vehicles', { groupBy: null });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(buffer);
  }

  if (format.toLowerCase() === 'pdf') {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' }); // RESTORED LANDSCAPE
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
    });
    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('FORECLOSURE VEHICLE REPORT', { align: 'center' });
    doc.fontSize(14).text(`Period: ${titleSuffix}`, { align: 'center' });
    doc.moveDown(2);

    // Table Setup - RESTORED ORIGINAL WIDTHS + S.N
    const tableTop = doc.y;
    const colWidths = [50, 80, 140, 140, 140, 90, 90]; // Added S.N, adjusted slightly
    const headers = ['S.N', 'Plate No', 'Property Owner', 'Lender Branch', 'Parking Place', 'Date In', 'Date Out'];

    // Draw Header
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF');
    let xPos = 30;
    headers.forEach((h, i) => {
      doc.fillColor('#4F81BD').rect(xPos, tableTop, colWidths[i], 25).fill();
      doc.fillColor('#FFFFFF').text(h, xPos + 5, tableTop + 7, { width: colWidths[i] - 10, align: 'center' });
      xPos += colWidths[i];
    });

    let yPos = tableTop + 30;
    doc.font('Helvetica').fontSize(10).fillColor('black');

    vehicles.forEach((v, index) => {
      xPos = 30;
      const row = [
        index + 1,
        v.plate_no,
        v.property_owner || 'N/A',
        v.lender_branch || 'N/A',
        v.parking_place || 'N/A',
        v.date_into ? new Date(v.date_into).toLocaleDateString('en-GB') : 'N/A',
        v.date_out ? new Date(v.date_out).toLocaleDateString('en-GB') : 'N/A',
      ];

      row.forEach((cell, i) => {
        doc.text(cell.toString(), xPos + 5, yPos, { width: colWidths[i] - 10, align: 'left' });
        xPos += colWidths[i];
      });

      doc.moveTo(30, yPos + 15).lineTo(810, yPos + 15).stroke('#CCCCCC');
      yPos += 25;

      if (yPos > 520) {
        doc.addPage();
        yPos = 100;
      }
    });

    // Summary Table
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').text('SUMMARY', { align: 'center' });
    doc.moveDown(3);

    const summaryY = doc.y;
    doc.fontSize(16);

    doc.text('Total Handover', 100, summaryY).text(totalHandover.toString(), 400, summaryY);
    doc.text('Total Takeover', 100, summaryY + 50).text(totalTakeover.toString(), 400, summaryY + 50);
    doc.text('Still Under PFMD', 100, summaryY + 100).text(stillUnderPFMD.toString(), 400, summaryY + 100);

    doc.rect(80, summaryY - 20, 500, 160).stroke('#4F81BD');

    doc.end();
  }

  if (format.toLowerCase() === 'word') {
    // FIXED: No require() - use existing imports from accident report
    const children = [];

    // Title and Period
    children.push(
      new Paragraph({
        text: "FORECLOSURE VEHICLE REPORT",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `Period: ${titleSuffix}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({ text: "" })
    );

    // Format data with S.N
    const formattedVehicles = vehicles.map((v, index) => ({
      sn: index + 1,
      plate_no: v.plate_no || 'N/A',
      property_owner: v.property_owner || 'N/A',
      lender_branch: v.lender_branch || 'N/A',
      parking_place: v.parking_place || 'N/A',
      date_into: v.date_into ? new Date(v.date_into).toLocaleDateString('en-GB') : 'N/A',
      date_out: v.date_out ? new Date(v.date_out).toLocaleDateString('en-GB') : 'N/A',
    }));

    const tableRows = [];

    // Header row
    const headers = ["S.N", "Plate No", "Property Owner", "Lender Branch", "Parking Place", "Date In", "Date Out"];
    const headerRow = new TableRow({
      children: headers.map(headerText => 
        new TableCell({
          children: [
            new Paragraph({
              text: headerText,
              bold: true,
              alignment: AlignmentType.CENTER
            })
          ],
          shading: { fill: "D9E8F7" },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        })
      ),
      tableHeader: true
    });
    tableRows.push(headerRow);

    // Data rows
    formattedVehicles.forEach((v, index) => {
      const cells = [
        new TableCell({
          children: [new Paragraph({ text: v.sn.toString(), alignment: AlignmentType.CENTER })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        }),
        new TableCell({
          children: [new Paragraph({ text: v.plate_no, alignment: AlignmentType.CENTER })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        }),
        new TableCell({
          children: [new Paragraph({ text: v.property_owner, alignment: AlignmentType.LEFT })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        }),
        new TableCell({
          children: [new Paragraph({ text: v.lender_branch, alignment: AlignmentType.LEFT })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        }),
        new TableCell({
          children: [new Paragraph({ text: v.parking_place, alignment: AlignmentType.LEFT })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        }),
        new TableCell({
          children: [new Paragraph({ text: v.date_into, alignment: AlignmentType.CENTER })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        }),
        new TableCell({
          children: [new Paragraph({ text: v.date_out, alignment: AlignmentType.CENTER })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 }
        })
      ];

      const row = new TableRow({ children: cells });

      if (index % 2 !== 0) {
        cells.forEach(cell => cell.shading = { fill: "F2F2F2" });
      }

      tableRows.push(row);
    });

    // Portrait column widths
    const columnWidths = [500, 1200, 2200, 2500, 2500, 1400, 1200];

    const mainTable = new Table({
      rows: tableRows,
      width: { size: 11900, type: WidthType.DXA },
      columnWidths: columnWidths,
      margins: { top: 300, bottom: 300, left: 400, right: 400 }
    });

    children.push(mainTable);

    // Spacer
    children.push(new Paragraph({ text: "", spacing: { before: 800, after: 800 } }));

    // Summary section
    children.push(
      new Paragraph({
        text: "SUMMARY",
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
      })
    );

    // Summary table
    const summaryTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph("Total Handover")],
              shading: { fill: "D9E8F7" }
            }),
            new TableCell({ 
              children: [new Paragraph(totalHandover.toString())],
              shading: { fill: "D9E8F7" }
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Total Takeover")] }),
            new TableCell({ children: [new Paragraph(totalTakeover.toString())] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Still Under PFMD")] }),
            new TableCell({ children: [new Paragraph(stillUnderPFMD.toString())] }),
          ],
        }),
      ],
      width: { size: 4000, type: WidthType.DXA },
    });

    children.push(summaryTable);

    // Portrait document
    const doc = new Document({
      sections: [{
        children,
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1200,
              bottom: 1200,
              left: 1200
            },
            size: {
              width: 11906,  // A4 Portrait
              height: 16838,
            }
          }
        }
      }]
    });

    const buffer = await Packer.toBuffer(doc);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}.docx"`,
    }).send(buffer);
  }
});




// accident report
export const generateAccidentReport = catchAsync(async (req, res) => {
  const { format = 'excel', period, startDate, endDate } = req.query;

  if (!['excel', 'pdf', 'word'].includes(format.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Format must be excel, pdf, or word' });
  }

  // Get date range using helper function
  let dateQuery, titleSuffix;
  try {
    const result = getDateRange(period, startDate, endDate);
    dateQuery = result.query;
    titleSuffix = result.titleSuffix;
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  // Fetch accidents and populate vehicle_allocation as location
  const query = { accident_date: dateQuery };
  const accidents = await Accident.find(query)
    .sort({ accident_date: -1 })
    .lean();

  if (accidents.length === 0) {
    return res.status(404).json({ success: false, message: 'No accidents found in the period' });
  }

  // Populate vehicle_allocation (location) from Vehicle
  const plateNos = accidents.map(a => a.plate_no);
  const vehicles = await Vehicle.find({ plate_no: { $in: plateNos } })
    .select('plate_no vehicle_allocation')
    .lean();

  const vehicleMap = vehicles.reduce((map, v) => {
    map[v.plate_no] = v.vehicle_allocation;
    return map;
  }, {});

  // Enrich accident data
  const enrichedAccidents = accidents.map((acc, index) => ({
    sn: index + 1,
    plate_no: acc.plate_no,
    accident_date: acc.accident_date ? new Date(acc.accident_date).toLocaleDateString('en-GB') : 'N/A',
    driver_name: acc.driver_name || 'N/A',
    location: vehicleMap[acc.plate_no] || 'Unknown',
    damaged_part: acc.damaged_part || 'N/A',
    accident_intensity: acc.accident_intensity,
    responsible_for_accident: acc.responsible_for_accident || 'N/A',
    action_taken: acc.action_taken || 'N/A',
  }));

  const filename = `Accident_Report_${titleSuffix.replace(/[/]/g, '-')}`;

  const excelColumns = [
    { header: 'S.N', key: 'sn', width: 8 },
    { header: 'Plate No', key: 'plate_no', width: 15 },
    { header: 'Accident Date', key: 'accident_date', width: 18 },
    { header: 'Driver Name', key: 'driver_name', width: 25 },
    { header: 'Location', key: 'location', width: 25 },
    { header: 'Damaged Parts', key: 'damaged_part', width: 35 },     // Wider
    { header: 'Intensity', key: 'accident_intensity', width: 15 },
    { header: 'Responsible', key: 'responsible_for_accident', width: 18 },
    { header: 'Action Taken', key: 'action_taken', width: 40 },     // Widest
  ];

  if (format.toLowerCase() === 'excel') {
    const buffer = await generateExcelReport(enrichedAccidents, excelColumns, 'Accident Report', { groupBy: null });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(buffer);
  }

if (format.toLowerCase() === 'pdf') {
  const MARGINS = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: MARGINS,
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}.pdf"`,
  });

  doc.pipe(res);

  // ---------- Title ----------
  doc.font('Helvetica-Bold')
     .fontSize(20)
     .text('ACCIDENT REPORT', { align: 'center' });

  doc.font('Helvetica')
     .fontSize(12)
     .text(`Period: ${titleSuffix}`, { align: 'center' });

  doc.moveDown(2);

  // ---------- Table setup ----------
  const usableWidth =
    doc.page.width - MARGINS.left - MARGINS.right;

  const baseColWidths = [40, 70, 80, 100, 100, 140, 70, 80, 140];
  const totalBaseWidth = baseColWidths.reduce((a, b) => a + b, 0);

  const colWidths = baseColWidths.map(w =>
    (w / totalBaseWidth) * usableWidth
  );

  const headers = [
    'S.N',
    'Plate No',
    'Accident Date',
    'Driver Name',
    'Location',
    'Damaged Parts',
    'Intensity',
    'Responsible',
    'Action Taken',
  ];

  const startX = MARGINS.left;
  let y = doc.y;

  // ---------- Header ----------
  const drawHeader = () => {
    let x = startX;
    doc.font('Helvetica-Bold').fontSize(10);

    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], 28).fill('#4F81BD');

      doc.fillColor('#FFFFFF').text(h, x + 5, y + 8, {
        width: colWidths[i] - 10,
        align: 'center',
      });

      x += colWidths[i];
    });

    doc.fillColor('black');
    y += 35;
    doc.font('Helvetica').fontSize(9);
  };

  drawHeader();

  // ---------- Rows ----------
  enrichedAccidents.forEach(acc => {
    const row = [
      acc.sn,
      acc.plate_no,
      acc.accident_date,
      acc.driver_name,
      acc.location,
      acc.damaged_part,
      acc.accident_intensity,
      acc.responsible_for_accident,
      acc.action_taken,
    ];

    // height of a single line (baseline)
    const singleLineHeight = doc.heightOfString('Ag', {
      width: 100,
    });

    // find tallest wrapped cell
    let maxCellHeight = 0;

    row.forEach((cell, i) => {
      const h = doc.heightOfString(String(cell ?? ''), {
        width: colWidths[i] - 10,
      });
      maxCellHeight = Math.max(maxCellHeight, h);
    });

    // compact default height for one-line rows
    const DEFAULT_ROW_HEIGHT = singleLineHeight + 8;

    // grow only if wrapping happens
    const rowHeight =
      maxCellHeight <= singleLineHeight + 1
        ? DEFAULT_ROW_HEIGHT
        : maxCellHeight + 10;

    // page break before drawing row
    if (y + rowHeight > doc.page.height - MARGINS.bottom) {
      doc.addPage();
      y = MARGINS.top;
      drawHeader();
    }

    // draw row
    let x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), x + 5, y + 5, {
        width: colWidths[i] - 10,
      });
      x += colWidths[i];
    });

    // row separator
    doc
      .moveTo(startX, y + rowHeight)
      .lineTo(
        doc.page.width - MARGINS.right,
        y + rowHeight
      )
      .stroke('#EEEEEE');

    y += rowHeight;
  });

  doc.end();
}

if (format.toLowerCase() === 'word') {
  if (!enrichedAccidents || !Array.isArray(enrichedAccidents)) {
    throw new Error('enrichedAccidents is not defined or not an array');
  }

  const headers = [
    "SN",
    "Plate Number",
    "Accident Date",
    "Driver Name",
    "Location",
    "Damaged Part",
    "Accident Intensity",
    "Responsible",
    "Action Taken"
  ];

  const children = [
    new Paragraph({
      text: "ACCIDENT REPORT",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: `Period: ${titleSuffix || 'Not specified'}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 }
    }),
    new Paragraph({ text: "" })
  ];

  const tableRows = [];

  // Header row
  const headerRow = new TableRow({
    children: headers.map(headerText => 
      new TableCell({
        children: [
          new Paragraph({
            text: headerText,
            bold: true,
            alignment: AlignmentType.CENTER
          })
        ],
        shading: { fill: "D9E8F7" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      })
    ),
    tableHeader: true
  });
  tableRows.push(headerRow);

  // Data rows
  enrichedAccidents.forEach((acc, index) => {
    if (!acc) return;

    const cleanText = (text) => {
      if (text === null || text === undefined) return "";
      return text.toString().replace(/\s+/g, ' ').trim();
    };

    const cells = [
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.sn || ''), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.plate_no || ''), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.accident_date || ''), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.driver_name || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.location || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.damaged_part || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.accident_intensity || ''), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ 
          text: cleanText(acc.responsible || acc.responsible_for_accident || ''), 
          alignment: AlignmentType.LEFT 
        })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ 
          text: cleanText(acc.action || acc.action_taken || ''), 
          alignment: AlignmentType.LEFT 
        })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      })
    ];

    const row = new TableRow({ children: cells });

    if (index % 2 !== 0) {
      cells.forEach(cell => cell.shading = { fill: "F2F2F2" });
    }

    tableRows.push(row);
  });

  // FIXED: Reduced column widths + ADDED table right margin
  const columnWidths = [450, 1000, 1100, 1500, 1500, 2000, 1000, 1800, 3000]; // Total: 14350

  const table = new Table({
    rows: tableRows,
    width: { 
      size: 15200,  // Reduced table width to fit margins
      type: WidthType.DXA 
    },
    columnWidths: columnWidths,
    margins: { 
      top: 300, 
      bottom: 300, 
      left: 400,    // Increased left table margin
      right: 600    // ADDED: Specific right table margin
    }
  });

  children.push(table);

  const docx = new Document({
    sections: [{
      children,
      properties: {
        page: {
          margin: {
            top: 1200,
            right: 1200,      // Page right margin
            bottom: 1200,
            left: 1200        // Page left margin
          },
          size: {
            width: 16838,
            height: 11906,
            orientation: PageOrientation.LANDSCAPE
          }
        }
      }
    }]
  });

  const buffer = await Packer.toBuffer(docx);
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `attachment; filename="${filename}.docx"`,
  }).send(buffer);
}







});


