// controllers/reportController.js
import ForeclosedVehicle from '../models/ForeclosureVehicle.js';
import { generateExcelReport } from '../utils/excelGenerator.js';
import VehicleMaintenance from '../models/VehicleMaintenance.js';
import GeneratorService from '../models/GeneratorService.js';
import Vehicle from '../models/Vehicle.js';
import FuelExpense from '../models/FuelExpense.js';
import Accident from '../models/Accident.js';
import PDFDocument from 'pdfkit';
import { Packer, Document, Table,HeightRule, TableRow, TableCell, Paragraph,PageOrientation, TextRun, WidthType,VerticalAlign, BorderStyle ,HeadingLevel, AlignmentType,TableLayoutType,TextDirection,} from 'docx';
import catchAsync from '../utils/catchAsync.js';
import ExcelJS from 'exceljs';

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









// Format Row Helper
const formatMaintenanceRow = (item) => ({
  sn: item.sn,
  vehicle_model: item.vehicle_model || 'N/A',
  plate_no: item.plate_no,
  allocation: item.allocation || 'N/A',
  maintenance_type: item.maintenance_type || 'N/A',
  km_driven: item.km_driven || 0,
  service_provider: item.service_provider || 'N/A',
  service_day: item.service_day || 'N/A',
  cost: item.cost || 0,
  remark: item.remark || 'N/A',
});

export const generateMaintenanceReport = catchAsync(async (req, res) => {
  console.log("req.query", req.query)

  const { format, period, startDate, endDate } = req.query;

  const now = new Date('2025-12-20'); // As per prompt
  let dateQuery, titleSuffix;
  try {
    ({ query: dateQuery, titleSuffix } = getDateRange(period, startDate, endDate, now));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Aggregate maintenance by plate_no
  const aggregatedMaintenance = await VehicleMaintenance.aggregate([
    { $match: { date_out: dateQuery } },
    {
      $group: {
        _id: '$plate_no',
        maintenance_type: { $push: '$maintenance_type' },
        km_diff: { $sum: '$km_diff' },
        workshop_name: { $addToSet: '$workshop_name' },
        date_out: { $push: { $dateToString: { format: '%Y-%m-%d', date: '$date_out' } } },
        total_cost: { $sum: '$total_cost' },
        remark: { $push: '$remark' },
      },
    },
    {
      $project: {
        plate_no: '$_id',
        maintenance_type: { $reduce: { input: '$maintenance_type', initialValue: '', in: { $concat: [ '$$value', { $cond: [ { $eq: [ '$$value', '' ] }, '', ', ' ] }, '$$this' ] } } },
        km_driven: '$km_diff',
        service_provider: { $reduce: { input: '$workshop_name', initialValue: '', in: { $concat: [ '$$value', { $cond: [ { $eq: [ '$$value', '' ] }, '', ', ' ] }, '$$this' ] } } },
        service_day: { $reduce: { input: '$date_out', initialValue: '', in: { $concat: [ '$$value', { $cond: [ { $eq: [ '$$value', '' ] }, '', ', ' ] }, '$$this' ] } } },
        cost: '$total_cost',
        remark: { $reduce: { input: '$remark', initialValue: '', in: { $concat: [ '$$value', { $cond: [ { $eq: [ '$$value', '' ] }, '', ', ' ] }, '$$this' ] } } },
      },
    },
    { $sort: { plate_no: 1 } },
  ]);

  if (aggregatedMaintenance.length === 0) {
    return res.status(404).json({ success: false, message: 'No maintenance records found' });
  }

  // Fetch vehicle_model and allocation
  const plateNos = aggregatedMaintenance.map(m => m.plate_no);
  const vehicles = await Vehicle.find({ plate_no: { $in: plateNos } })
    .select('plate_no vehicle_model vehicle_allocation')
    .lean();

  const vehicleMap = vehicles.reduce((map, v) => {
    map[v.plate_no] = { vehicle_model: v.vehicle_model, allocation: v.vehicle_allocation };
    return map;
  }, {});

  // Enrich with vehicle data and SN
  const enrichedData = aggregatedMaintenance.map((m, index) => ({
    sn: index + 1,
    vehicle_model: vehicleMap[m.plate_no]?.vehicle_model || 'N/A',
    plate_no: m.plate_no,
    allocation: vehicleMap[m.plate_no]?.allocation || 'N/A',
    maintenance_type: m.maintenance_type || 'N/A',
    km_driven: m.km_driven || 0,
    service_provider: m.service_provider || 'N/A',
    service_day: m.service_day || 'N/A',
    cost: m.cost || 0,
    remark: m.remark || 'N/A',
  }));

  const filename = `Maintenance_Report_${titleSuffix.replace(/[/]/g, '-')}`;

  const excelColumns = [
    { header: 'SN', key: 'sn', width: 8 },
    { header: 'Vehicle Model', key: 'vehicle_model', width: 25 },
    { header: 'Plate No', key: 'plate_no', width: 15 },
    { header: 'Allocation', key: 'allocation', width: 25 },
    { header: 'Type of Maintenance', key: 'maintenance_type', width: 40 },
    { header: 'KM Driven', key: 'km_driven', width: 15 },
    { header: 'Service Provider', key: 'service_provider', width: 30 },
    { header: 'Service Day', key: 'service_day', width: 40 },
    { header: 'Cost', key: 'cost', width: 15 },
    { header: 'Remark', key: 'remark', width: 50 },
  ];

  // Define headers array for Word document
  const headers = ['SN', 'Vehicle Model', 'Plate No', 'Allocation', 'Type of Maintenance', 'KM Driven', 'Service Provider', 'Service Day', 'Cost', 'Remark'];

  if (format.toLowerCase() === 'excel') {
    const buffer = await generateExcelReport(enrichedData, excelColumns, 'Maintenance Report', { groupBy: null });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(buffer);
    return;
  }

  if (format.toLowerCase() === 'pdf') {
    // A4 Landscape: 842pt width total. 50pt left + 50pt right margins = 742pt available for table
    const LEFT_MARGIN = 30;
    const RIGHT_MARGIN = 30;
    const TOTAL_AVAILABLE_WIDTH = 842 - LEFT_MARGIN - RIGHT_MARGIN; // 742pt
    
    const doc = new PDFDocument({ 
        margin: 0, // Disable PDFDocument auto-margin
        size: 'A4', 
        layout: 'landscape' 
    });
    
    res.set({ 
        'Content-Type': 'application/pdf', 
        'Content-Disposition': `attachment; filename="${filename}.pdf"` 
    });
    doc.pipe(res);

    // Title with proper margins
    doc.fontSize(22).font('Helvetica-Bold').text('MAINTENANCE REPORT', LEFT_MARGIN, 40, { width: TOTAL_AVAILABLE_WIDTH, align: 'center' });
    doc.fontSize(14).text(`Period: ${titleSuffix}`, LEFT_MARGIN, 80, { width: TOTAL_AVAILABLE_WIDTH, align: 'center' });
    
    let y = 120; // Start table position
    let x = LEFT_MARGIN;

    // FIXED column widths that SUM to 742pt exactly
    const colWidths = [30, 75, 55, 75, 110, 55, 75, 110, 50, 107]; // Total: 742pt ✓
    
    // Header row
    doc.save()
       .font('Helvetica-Bold').fontSize(9.5)
       .fillColor('#FFFFFF');
    
    headers.forEach((h, i) => {
        // Blue background
        doc.fillColor('#4F81BD').rect(x, y, colWidths[i], 25).fill();
        // White text
        doc.fillColor('#FFFFFF').text(h, x + 3, y + 6, { 
            width: colWidths[i] - 6, 
            align: 'center' 
        });
        x += colWidths[i];
    });
    
    y += 28; // Header height + spacing
    x = LEFT_MARGIN;
    
    doc.restore()
       .font('Helvetica').fontSize(8).fillColor('black');

    enrichedData.forEach(acc => {
        x = LEFT_MARGIN;
        const row = [
            acc.sn,
            acc.vehicle_model,
            acc.plate_no,
            acc.allocation,
            acc.maintenance_type,
            acc.km_driven,
            acc.service_provider,
            acc.service_day,
            acc.cost,
            acc.remark,
        ];

        // Calculate row height based on tallest cell
        const maxCellHeight = row.reduce((max, cell, i) => {
            const height = doc.heightOfString(String(cell), { width: colWidths[i] - 6 });
            return Math.max(max, height);
        }, 16);

        const rowHeight = maxCellHeight + 6;

        // Draw row cells
        row.forEach((cell, i) => {
            doc.text(String(cell), x + 3, y, { 
                width: colWidths[i] - 6, 
                align: 'left' 
            });
            x += colWidths[i];
        });

        // Row separator line (left to right margin)
        doc.moveTo(LEFT_MARGIN, y + rowHeight)
           .lineTo(842 - RIGHT_MARGIN, y + rowHeight)
           .stroke('#E0E0E0');
           
        y += rowHeight + 2;

        // New page check (A4 landscape height ~595pt - top/bottom space)
        if (y > 560) {
            doc.addPage();
            y = 100;
        }
    });

    doc.end();
    return;
}


 if (format.toLowerCase() === 'word') {
  // Define headers (moved from PDF section to be available here)
  const headers = ['SN', 'Vehicle Model', 'Plate No', 'Allocation', 'Type of Maintenance', 'KM Driven', 'Service Provider', 'Service Day', 'Cost', 'Remark'];

  const children = [
    new Paragraph({
      text: "MAINTENANCE REPORT",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: `Period: ${titleSuffix}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 }
    }),
    new Paragraph({ text: "" })
  ];

  const tableRows = [];

  // Header row with styling
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
  enrichedData.forEach((acc, index) => {
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
        children: [new Paragraph({ text: cleanText(acc.vehicle_model || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.plate_no || ''), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.allocation || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.maintenance_type || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.km_driven || ''), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.service_provider || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.service_day || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.cost || ''), alignment: AlignmentType.RIGHT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(acc.remark || ''), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 }
      })
    ];

    const row = new TableRow({ children: cells });

    // Alternate row shading
    if (index % 2 !== 0) {
      cells.forEach(cell => cell.shading = { fill: "F2F2F2" });
    }

    tableRows.push(row);
  });

  // Column widths optimized for 10 columns (total ~15200 DXA)
  const columnWidths = [500, 1400, 900, 1400, 2000, 900, 1400, 2000, 800, 2300];

  const table = new Table({
    rows: tableRows,
    width: { 
      size: 15200, 
      type: WidthType.DXA 
    },
    columnWidths: columnWidths,
    margins: { 
      top: 300, 
      bottom: 300, 
      left: 500,   // Left table margin
      right: 700   // Right table margin
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
            right: 1400,    // Page right margin
            bottom: 1200,
            left: 1400      // Page left margin
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


export const generateMaintenanceTypeReport = catchAsync(async (req, res) => {
  const { format = 'excel', period, startDate, endDate } = req.query;

  if (!['excel', 'pdf', 'word'].includes(format.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Format must be excel, pdf, or word' });
  }

  let dateQuery, titleSuffix;
  try {
    ({ query: dateQuery, titleSuffix } = getDateRange(period, startDate, endDate));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const filename = `Maintenance_Type_Report_${titleSuffix.replace(/[/]/g, '-')}`;

  // Fetch all maintenance records in the period
  const allMaintenance = await VehicleMaintenance.find({
    $or: [
      { date_out: dateQuery },                    // Completed
      { date_out: null, date_in: dateQuery }      // Under repair (started in period, no date_out)
    ]
  }).lean();

  if (allMaintenance.length === 0) {
    return res.status(404).json({ success: false, message: 'No maintenance records found' });
  }

  // Get unique plate numbers
  const plateNos = [...new Set(allMaintenance.map(m => m.plate_no))];
  const vehicles = await Vehicle.find({ plate_no: { $in: plateNos } })
    .select('plate_no vehicle_allocation')
    .lean();

  const locationMap = vehicles.reduce((map, v) => {
    map[v.plate_no] = v.vehicle_allocation || 'N/A';
    return map;
  }, {});

  // Group by maintenance_type
  const types = ['Preventive', 'Corrective', 'Breakdown', 'Body & Paint'];
  const summary = {};

  types.forEach(type => {
    summary[type] = {
      count: 0,
      locations: new Set(),
      providers: new Set(),
      cost: 0
    };
  });

  // Under Repair: records with date_out null and date_in in period
  summary['Under Repair'] = {
    count: 0,
    locations: new Set(),
    providers: new Set(),
    cost: 0
  };

  allMaintenance.forEach(m => {
    const type = m.date_out ? m.maintenance_type : 'Under Repair';
    const entry = summary[type];

    entry.count += 1;
    entry.locations.add(locationMap[m.plate_no] || 'N/A');
    if (m.workshop_name) entry.providers.add(m.workshop_name);
    entry.cost += m.total_cost || 0;
  });

  // Convert Sets to comma-separated strings
  const reportData = Object.keys(summary).map((type, index) => ({
    sn: index + 1,
    maintenance_type: type === 'Breakdown' ? 'Break Down' : type, // Match sample
    no_of_vehicles: summary[type].count,
    location: [...summary[type].locations].sort().join(', '),
    service_provider: [...summary[type].providers].sort().join(', '),
    maintenance_cost: summary[type].cost.toFixed(2),
  }));

  // Add Total row
  const totalVehicles = reportData.reduce((sum, r) => sum + r.no_of_vehicles, 0);
  const totalCost = reportData.reduce((sum, r) => sum + parseFloat(r.maintenance_cost), 0);
  reportData.push({
    sn: '',
    maintenance_type: 'Total',
    no_of_vehicles: totalVehicles,
    location: '',
    service_provider: '',
    maintenance_cost: totalCost.toFixed(2),
  });

  const excelColumns = [
    { header: 'S.N', key: 'sn', width: 10 },
    { header: 'Maintenance Type', key: 'maintenance_type', width: 25 },
    { header: 'No of Vehicles', key: 'no_of_vehicles', width: 18 },
    { header: 'Location (Branch)', key: 'location', width: 50 },
    { header: 'Service Provider', key: 'service_provider', width: 40 },
    { header: 'Maintenance Cost', key: 'maintenance_cost', width: 20 },
  ];

  if (format.toLowerCase() === 'excel') {
    const buffer = await generateExcelReport(reportData, excelColumns, 'Maintenance Type Report', { groupBy: null });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(buffer);
    return;
  }

  if (format.toLowerCase() === 'pdf') {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}.pdf"` });
    doc.pipe(res);

    doc.fontSize(22).font('Helvetica-Bold').text('MAINTENANCE TYPE SERVICE REPORT', { align: 'center' });
    doc.fontSize(14).text(`Period: ${titleSuffix}`, { align: 'center' });
    doc.moveDown(3);

    const colWidths = [40, 120, 80, 200, 180, 100]; // Total ~720pt
    const headers = ['S.N', 'Maintenance Type', 'No of Vehicles', 'Location (Branch)', 'Service Provider', 'Maintenance Cost'];

    let y = doc.y;
    let x = 50;

    // Header with increased height (40pt instead of 30pt)
    const headerHeight = 40;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF');
    headers.forEach((h, i) => {
      doc.fillColor('#4F81BD').rect(x, y, colWidths[i], headerHeight).fill();
      // Center text vertically in header cell (y + headerHeight/2 - font height/2)
      doc.fillColor('#FFFFFF').text(h, x + 5, y + 12, { width: colWidths[i] - 10, align: 'center' });
      x += colWidths[i];
    });
    y += headerHeight + 5; // Add spacing after header

    doc.font('Helvetica').fontSize(10).fillColor('black');

    reportData.forEach(row => {
      x = 50;
      const values = [
        row.sn,
        row.maintenance_type,
        row.no_of_vehicles,
        row.location,
        row.service_provider,
        row.maintenance_cost,
      ];

      const maxHeight = values.reduce((max, text, i) => {
        const h = doc.heightOfString(String(text), { width: colWidths[i] - 10 });
        return Math.max(max, h);
      }, 20);

      const rowHeight = maxHeight + 10;

      values.forEach((text, i) => {
        doc.text(String(text), x + 5, y + 5, { width: colWidths[i] - 10, align: i === 5 ? 'right' : 'left' });
        x += colWidths[i];
      });

      doc.moveTo(50, y + rowHeight).lineTo(792, y + rowHeight).stroke('#EEEEEE');
      y += rowHeight;

      if (y > 520) {
        doc.addPage();
        y = 100;
      }
    });

    doc.end();
    return;
}


if (format.toLowerCase() === "word") {
  const headers = [
    "S.N",
    "Maintenance Type",
    "No of Vehicles",
    "Location (Branch)",
    "Service Provider",
    "Maintenance Cost",
  ];

  const children = [
    new Paragraph({
      text: "MAINTENANCE TYPE SERVICE REPORT",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Period: ${titleSuffix || "Not specified"}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
    }),
    new Paragraph({ text: "" }),
  ];

  const tableRows = [];

  // Header row
  const headerRow = new TableRow({
    children: headers.map((h) =>
      new TableCell({
        children: [
          new Paragraph({
            text: h,
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: "D9E8F7" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      })
    ),
    tableHeader: true,
  });
  tableRows.push(headerRow);

  // Helper
  const cleanText = (val) =>
    val === null || val === undefined
      ? ""
      : val.toString().replace(/\s+/g, " ").trim();

  // Data rows
  reportData.forEach((row, index) => {
    const cells = [
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(row.sn),
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(row.maintenance_type),
            alignment: AlignmentType.LEFT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(row.no_of_vehicles),
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(row.location),
            alignment: AlignmentType.LEFT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(row.service_provider),
            alignment: AlignmentType.LEFT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(row.maintenance_cost),
            alignment: AlignmentType.RIGHT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
    ];

    // Alternate row shading
    if (index % 2 !== 0) {
      cells.forEach((cell) => {
        cell.shading = { fill: "F2F2F2" };
      });
    }

    tableRows.push(new TableRow({ children: cells }));
  });

  const columnWidths = [800, 3500, 1500, 3000, 3000, 2500];

  const table = new Table({
    rows: tableRows,
    width: {
      size: 15000,
      type: WidthType.DXA,
    },
    columnWidths,
    margins: {
      top: 300,
      bottom: 300,
      left: 500,
      right: 700,
    },
  });

  children.push(table);

  const docx = new Document({
    sections: [
      {
        children,
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1400,
              bottom: 1200,
              left: 1400,
            },
            size: {
              width: 16838,
              height: 11906,
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
      },
    ],
  });

  const buffer = await Packer.toBuffer(docx);
  res
    .set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}.docx"`,
    })
    .send(buffer);
}


});







export const generateSingleVehicleMaintenanceReport = catchAsync(async (req, res) => {
  const { plateNo } = req.params;
  const { format = 'excel' } = req.query;

  if (!['excel', 'pdf', 'word'].includes(format.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Format must be excel, pdf, or word' });
  }

  if (!plateNo) {
    return res.status(400).json({ success: false, message: 'Plate number is required' });
  }

  const normalizedPlateNo = plateNo.toUpperCase().trim();

  const maintenanceRecords = await VehicleMaintenance.find({ plate_no: normalizedPlateNo })
    .sort({ date_out: 1 })
    .lean();

  if (maintenanceRecords.length === 0) {
    return res.status(404).json({ success: false, message: 'No maintenance records found for this vehicle' });
  }

  const vehicle = await Vehicle.findOne({ plate_no: normalizedPlateNo })
    .select('vehicle_type')
    .lean();

  const vehicleType = vehicle?.vehicle_type || 'N/A';

  // Get location from first record (it's the same for the vehicle)
  const location = maintenanceRecords[0]?.location || 'N/A';

  const enrichedRecords = maintenanceRecords.map((record, index) => ({
    sn: index + 1,
    km_at_service: record.km_at_service || 'N/A',
    serviced_date: record.date_out ? new Date(record.date_out).toLocaleDateString('en-GB') : 'N/A',
    amount_of_payment: record.total_cost || 0,
    km_difference: record.km_diff || 0,
    cost_per_km: record.cost_per_km || 0,
    type_of_maintenance: record.maintenance_type || 'N/A',
    service_provider: record.workshop_name || 'N/A',
    invoice_no: record.invoice_no || 'N/A',
    remark: record.remark || 'N/A',
  }));

  const totalPayment = enrichedRecords.reduce((sum, r) => sum + r.amount_of_payment, 0);
  const totalKmDiff = enrichedRecords.reduce((sum, r) => sum + r.km_difference, 0);
  const overallCostPerKm = totalKmDiff > 0 ? (totalPayment / totalKmDiff).toFixed(2) : 0;

  const filename = `Maintenance_Jacket_${normalizedPlateNo}`;

  // Removed 'Location' from table
  const excelColumns = [
    { header: 'S.N', key: 'sn', width: 8 },
    { header: 'KM at Service', key: 'km_at_service', width: 18 },
    { header: 'Serviced Date', key: 'serviced_date', width: 20 },
    { header: 'Amount of Payment', key: 'amount_of_payment', width: 22 },
    { header: 'KM Difference', key: 'km_difference', width: 18 },
    { header: 'Cost per KM', key: 'cost_per_km', width: 15 },
    { header: 'Type of Maintenance', key: 'type_of_maintenance', width: 30 },
    { header: 'Service Provider', key: 'service_provider', width: 30 },
    { header: 'Invoice No', key: 'invoice_no', width: 18 },
    { header: 'Remark', key: 'remark', width: 50 },
  ];

  const excelData = [
    ...enrichedRecords.map(r => ({
      sn: r.sn,
      km_at_service: r.km_at_service,
      serviced_date: r.serviced_date,
      amount_of_payment: Number(r.amount_of_payment).toFixed(2),
      km_difference: r.km_difference,
      cost_per_km: Number(r.cost_per_km).toFixed(2),
      type_of_maintenance: r.type_of_maintenance,
      service_provider: r.service_provider,
      invoice_no: r.invoice_no,
      remark: r.remark,
    })),
    {
      sn: '',
      km_at_service: 'TOTAL',
      serviced_date: '',
      amount_of_payment: totalPayment.toFixed(2),
      km_difference: totalKmDiff,
      cost_per_km: overallCostPerKm,
      type_of_maintenance: '',
      service_provider: '',
      invoice_no: '',
      remark: '',
    },
  ];

  if (format.toLowerCase() === 'excel') {
    const buffer = await generateExcelReport(excelData, excelColumns, 'Maintenance Jacket', { groupBy: null });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Maintenance Jacket');

    // Insert 3 rows at top
    worksheet.spliceRows(1, 0, [], [], []);

    // Row 1: Title
    worksheet.mergeCells('A1:J1');
    worksheet.getCell('A1').value = 'VEHICLE MAINTENANCE HISTORY JACKET';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 40;

    // Row 2: Plate No, Vehicle Type, Location in ONE row
    worksheet.mergeCells('A2:J2');
    worksheet.getCell('A2').value = `Plate No: ${normalizedPlateNo} | Vehicle Type: ${vehicleType} | Location: ${location}`;
    worksheet.getCell('A2').font = { size: 14, bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 35;

    // Row 3: spacing
    worksheet.getRow(3).height = 20;

    const newBuffer = await workbook.xlsx.writeBuffer();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(newBuffer);
    return;
  }

  if (format.toLowerCase() === 'pdf') {
  // A4 landscape: 842 x 595 points [web:34][web:37]
  const LEFT_MARGIN = 50;
  const RIGHT_MARGIN = 50;
  const TOTAL_WIDTH = 842;
  const TABLE_WIDTH = TOTAL_WIDTH - LEFT_MARGIN - RIGHT_MARGIN; // 742

  const doc = new PDFDocument({ margin: 0, size: 'A4', layout: 'landscape' });
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}.pdf"`,
  });
  doc.pipe(res);

  // Title
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('VEHICLE MAINTENANCE HISTORY JACKET', LEFT_MARGIN, 40, {
      width: TABLE_WIDTH,
      align: 'center',
    });
  doc
    .fontSize(16)
    .text(
      `Plate No: ${normalizedPlateNo} | Vehicle Type: ${vehicleType} | Location: ${location}`,
      LEFT_MARGIN,
      80,
      { width: TABLE_WIDTH, align: 'center' }
    );
  doc.moveDown(2);

  const headers = [
    'S.N',
    'KM at Service',
    'Serviced Date',
    'Amount',
    'KM Diff',
    'Cost/KM',
    'Type',
    'Provider',
    'Invoice No',
    'Remark',
  ];

  // Column widths sum exactly to TABLE_WIDTH (742)
  const colWidths = [40, 80, 80, 80, 60, 60, 110, 90, 70, 72]; // 742 total

  let y = doc.y;
  let x = LEFT_MARGIN;

  // Header row
  const headerHeight = 32;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');

  headers.forEach((h, i) => {
    doc.fillColor('#4F81BD').rect(x, y, colWidths[i], headerHeight).fill();
    doc.fillColor('#FFFFFF').text(h, x + 4, y + 10, {
      width: colWidths[i] - 8,
      align: 'center',
    });
    x += colWidths[i];
  });
  y += headerHeight + 4;

  doc.font('Helvetica').fontSize(9).fillColor('black');

  enrichedRecords.forEach((r) => {
    x = LEFT_MARGIN;
    const row = [
      r.sn,
      r.km_at_service,
      r.serviced_date,
      Number(r.amount_of_payment).toFixed(2),
      r.km_difference,
      Number(r.cost_per_km).toFixed(2),
      r.type_of_maintenance,
      r.service_provider,
      r.invoice_no,
      r.remark,
    ];

    const maxHeight = row.reduce((max, cell, i) => {
      const h = doc.heightOfString(String(cell), {
        width: colWidths[i] - 8,
      });
      return Math.max(max, h);
    }, 18);
    const rowHeight = maxHeight + 8;

    row.forEach((cell, i) => {
      doc.text(String(cell), x + 4, y + 4, {
        width: colWidths[i] - 8,
        align: i >= 3 && i <= 5 ? 'right' : 'left',
      });
      x += colWidths[i];
    });

    // Row separator line from left to right margin
    doc
      .moveTo(LEFT_MARGIN, y + rowHeight)
      .lineTo(TOTAL_WIDTH - RIGHT_MARGIN, y + rowHeight)
      .stroke('#EEEEEE');
    y += rowHeight + 2;

    if (y > 540) {
      doc.addPage();
      y = 100;
    }
  });

  doc.fontSize(14).font('Helvetica-Bold');
  doc.text(`Total Payment: ${totalPayment.toFixed(2)}`, LEFT_MARGIN, y + 20);
  doc.text(`Total KM Driven: ${totalKmDiff}`, LEFT_MARGIN + 220, y + 20);
  doc.text(
    `Overall Cost per KM: ${overallCostPerKm}`,
    LEFT_MARGIN + 440,
    y + 20
  );

  doc.end();
  return;
}


  if (format.toLowerCase() === 'word') {
  const headers = [
    'S.N',
    'KM at Service',
    'Serviced Date',
    'Amount',
    'KM Diff',
    'Cost/KM',
    'Type',
    'Provider',
    'Invoice No',
    'Remark',
  ];

  const children = [
    new Paragraph({
      text: 'VEHICLE MAINTENANCE HISTORY JACKET',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Plate No: ${normalizedPlateNo} | Vehicle Type: ${vehicleType} | Location: ${location}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
    }),
    new Paragraph({ text: '' }),
  ];

  const tableRows = [];

  // Header row
  const headerRow = new TableRow({
    children: headers.map((h) =>
      new TableCell({
        children: [
          new Paragraph({
            text: h,
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: 'D9E8F7' },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      })
    ),
    tableHeader: true,
  });
  tableRows.push(headerRow);

  const cleanText = (v) =>
    v === null || v === undefined
      ? ''
      : v.toString().replace(/\s+/g, ' ').trim();

  // Data rows
  enrichedRecords.forEach((r, index) => {
    const cells = [
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.sn),
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.km_at_service),
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.serviced_date),
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(Number(r.amount_of_payment).toFixed(2)),
            alignment: AlignmentType.RIGHT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.km_difference),
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(Number(r.cost_per_km).toFixed(2)),
            alignment: AlignmentType.RIGHT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.type_of_maintenance),
            alignment: AlignmentType.LEFT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.service_provider),
            alignment: AlignmentType.LEFT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.invoice_no),
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(r.remark),
            alignment: AlignmentType.LEFT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
    ];

    if (index % 2 !== 0) {
      cells.forEach((cell) => {
        cell.shading = { fill: 'F2F2F2' };
      });
    }

    tableRows.push(new TableRow({ children: cells }));
  });

  // TOTAL row
  const totalRowCells = [
    new TableCell({
      children: [
        new Paragraph({
          text: 'TOTAL',
          bold: true,
          alignment: AlignmentType.CENTER,
        }),
      ],
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({ children: [new Paragraph('')] }),
    new TableCell({ children: [new Paragraph('')] }),
    new TableCell({
      children: [
        new Paragraph({
          text: totalPayment.toFixed(2),
          bold: true,
          alignment: AlignmentType.RIGHT,
        }),
      ],
    }),
    new TableCell({
      children: [
        new Paragraph({
          text: totalKmDiff.toString(),
          bold: true,
          alignment: AlignmentType.CENTER,
        }),
      ],
    }),
    new TableCell({
      children: [
        new Paragraph({
          text: overallCostPerKm.toString(),
          bold: true,
          alignment: AlignmentType.RIGHT,
        }),
      ],
    }),
    new TableCell({ children: [new Paragraph('')] }),
    new TableCell({ children: [new Paragraph('')] }),
    new TableCell({ children: [new Paragraph('')] }),
    new TableCell({ children: [new Paragraph('')] }),
  ];
  tableRows.push(new TableRow({ children: totalRowCells }));

  // Column widths (DXA); sum ≈ 15000 so it fits in landscape with margins [web:26]
  const columnWidths = [700, 1300, 1300, 1800, 1200, 1200, 2200, 2200, 1500, 2800];

  const table = new Table({
    rows: tableRows,
    width: { size: 15000, type: WidthType.DXA },
    columnWidths,
    margins: {
      top: 300,
      bottom: 300,
      left: 500,
      right: 700,
    },
  });

  children.push(table);

  const docx = new Document({
    sections: [
      {
        children,
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1400,
              bottom: 1200,
              left: 1400,
            },
            size: {
              width: 16838,
              height: 11906,
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
      },
    ],
  });

  const buffer = await Packer.toBuffer(docx);
  res
    .set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}.docx"`,
    })
    .send(buffer);
}

});





export const generateFuelExpenseReport = catchAsync(async (req, res) => {
  const { format = 'excel', period, startDate, endDate } = req.query;

  if (!['excel', 'pdf', 'word'].includes(format.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Format must be excel, pdf, or word' });
  }

  let dateQuery, titleSuffix;
  try {
    ({ query: dateQuery, titleSuffix } = getDateRange(period, startDate, endDate));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const filename = `Fuel_Expense_Report_${titleSuffix.replace(/[/]/g, '-')}`;

  // Fetch fuel expenses in the period
  const fuelExpenses = await FuelExpense.find({ starting_date: dateQuery })
    .sort({ fuel_type: 1, plate_no: 1, starting_date: 1 })
    .lean();

  if (fuelExpenses.length === 0) {
    return res.status(404).json({ success: false, message: 'No fuel expenses found in the period' });
  }

  // Group by fuel_type → plate_no
  const grouped = fuelExpenses.reduce((acc, exp) => {
    const type = exp.fuel_type;
    const plate = exp.plate_no;
    if (!acc[type]) acc[type] = {};
    if (!acc[type][plate]) acc[type][plate] = [];
    acc[type][plate].push(exp);
    return acc;
  }, {});

  const reportData = [];
  const fuelTypes = ['Regular', 'Diesel', 'Octane'];
  let grandTotalBirr = 0;

  fuelTypes.forEach(type => {
    if (!grouped[type]) return;

    const vehicles = Object.keys(grouped[type]).map(plate => {
      const records = grouped[type][plate].sort((a, b) => new Date(a.starting_date) - new Date(b.starting_date));
      const first = records[0];
      const last = records[records.length - 1];

      // Sum of fuel_in_birr and liter_used
      const totalBirr = records.reduce((sum, r) => sum + (r.fuel_in_birr || 0), 0);
      const totalLiter = records.reduce((sum, r) => sum + (r.liter_used || 0), 0);

      // **KM Difference = summation of available km_diff**
      const totalKmDiff = records.reduce((sum, r) => sum + (r.km_diff || 0), 0);

      // KM/Lit = total km diff / total liter
      const kmPerLit = totalLiter > 0 ? (totalKmDiff / totalLiter).toFixed(2) : '0.00';

      return {
        plate_no: plate,
        starting_date: first.starting_date ? new Date(first.starting_date).toLocaleDateString('en-GB') : 'N/A',
        starting_km: first.starting_km?.toLocaleString() || 'N/A',
        ending_date: last.ending_date ? new Date(last.ending_date).toLocaleDateString('en-GB') : 'N/A',
        ending_km: last.ending_km?.toLocaleString() || 'N/A',
        fuel_in_birr: totalBirr.toFixed(2),
        liter: totalLiter.toFixed(2),
        km_diff: totalKmDiff.toLocaleString(),
        km_per_lit: kmPerLit,
      };
    });

    const typeTotalBirr = vehicles.reduce((sum, v) => sum + parseFloat(v.fuel_in_birr), 0);
    const typeTotalLiter = vehicles.reduce((sum, v) => sum + parseFloat(v.liter), 0);
    grandTotalBirr += typeTotalBirr;

    reportData.push({
      fuel_type: type,
      vehicles,
      total_birr: typeTotalBirr.toFixed(2),
      total_liter: typeTotalLiter.toFixed(2),
    });
  });

  const columns = [
    { header: 'Plate No', key: 'plate_no', width: 15 },
    { header: 'Starting Date', key: 'starting_date', width: 18 },
    { header: 'Starting KM', key: 'starting_km', width: 18 },
    { header: 'Ending Date', key: 'ending_date', width: 18 },
    { header: 'Ending KM', key: 'ending_km', width: 18 },
    { header: 'Fuel in Birr', key: 'fuel_in_birr', width: 18 },
    { header: 'Liter', key: 'liter', width: 15 },
    { header: 'KM Diff', key: 'km_diff', width: 18 },
    { header: 'KM/Lit', key: 'km_per_lit', width: 15 },
  ];

  if (format.toLowerCase() === 'excel') {
    let buffer = await generateExcelReport([], columns, 'Fuel Expense Report', { groupBy: null });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Fuel Expense Report');

    let rowIndex = 1;

    worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'FUEL EXPENSE REPORT';
    worksheet.getCell(`A${rowIndex}`).font = { size: 18, bold: true };
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
    rowIndex++;

    worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = `Period: ${titleSuffix}`;
    worksheet.getCell(`A${rowIndex}`).font = { size: 14 };
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
    rowIndex += 2;

    reportData.forEach(group => {
      worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
      worksheet.getCell(`A${rowIndex}`).value = `${group.fuel_type} Fuel Type`;
      worksheet.getCell(`A${rowIndex}`).font = { size: 14, bold: true };
      rowIndex += 2;

      const headerRow = worksheet.getRow(rowIndex);
      headerRow.values = columns.map(col => col.header);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
      headerRow.alignment = { horizontal: 'center' };
      rowIndex++;

      group.vehicles.forEach(v => {
        worksheet.addRow([
          v.plate_no,
          v.starting_date,
          v.starting_km,
          v.ending_date,
          v.ending_km,
          v.fuel_in_birr,
          v.liter,
          v.km_diff,
          v.km_per_lit,
        ]);
        rowIndex++;
      });

      worksheet.addRow([
        'Total',
        '',
        '',
        '',
        '',
        group.total_birr,
        group.total_liter,
        '',
        '',
      ]).font = { bold: true };
      rowIndex += 2;
    });

    worksheet.addRow([
      'Grand Total Fuel in Birr',
      '',
      '',
      '',
      '',
      grandTotalBirr.toFixed(2),
      '',
      '',
      '',
    ]).font = { bold: true, color: { argb: 'FF0000' } };

    buffer = await workbook.xlsx.writeBuffer();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(buffer);
    return;
  }



 if (format.toLowerCase() === 'pdf') {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}.pdf"` });
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('FUEL EXPENSE REPORT', { align: 'center' });
    doc.fontSize(16).text(`Period: ${titleSuffix}`, { align: 'center' });
    doc.moveDown(2);

    const headers = ['Plate No', 'Starting Date', 'Starting KM', 'Ending Date', 'Ending KM', 'Fuel in Birr', 'Liter', 'KM Diff', 'KM/Lit'];
    const colWidths = [80, 80, 80, 80, 80, 80, 80, 80, 80];

    let pageNum = 0;
    let isFirstPage = true;

    reportData.forEach((group, groupIndex) => {
      // Add new page for each fuel type (except first)
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      let y = 80;

      doc.fontSize(18).font('Helvetica-Bold').text(`${group.fuel_type} Fuel Type Vehicles`, { align: 'left' });
      y = doc.y + 10;

      let x = 50;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
      headers.forEach((h, i) => {
        doc.fillColor('#4F81BD').rect(x, y, colWidths[i], 30).fill();
        doc.fillColor('#FFFFFF').text(h, x + 5, y + 10, { width: colWidths[i] - 10, align: 'center' });
        x += colWidths[i];
      });
      y += 35;

      doc.font('Helvetica').fontSize(9).fillColor('black');

      group.vehicles.forEach(v => {
        x = 50;
        const row = [
          v.plate_no,
          v.starting_date,
          v.starting_km,
          v.ending_date,
          v.ending_km,
          v.fuel_in_birr,
          v.liter,
          v.km_diff,
          v.km_per_lit,
        ];

        const maxHeight = row.reduce((max, cell, i) => {
          const h = doc.heightOfString(String(cell), { width: colWidths[i] - 10 });
          return Math.max(max, h);
        }, 20);
        const rowHeight = maxHeight + 10;

        row.forEach((cell, i) => {
          doc.text(String(cell), x + 5, y + 5, { width: colWidths[i] - 10, align: 'left' });
          x += colWidths[i];
        });

        doc.moveTo(50, y + rowHeight).lineTo(792, y + rowHeight).stroke('#EEEEEE');
        y += rowHeight;

        if (y > 520) {
          doc.addPage();
          y = 100;
        }
      });

      doc.fontSize(14).font('Helvetica-Bold').text(`Total Fuel in Birr: ${group.total_birr} | Total Liter: ${group.total_liter}`, 50, y + 20);
      y += 40;
    });

    // Add final summary page
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').text('SUMMARY', { align: 'center' });
    doc.moveDown(2);

    let summaryY = doc.y;
    doc.fontSize(14).font('Helvetica');
    reportData.forEach(group => {
      doc.text(`${group.fuel_type} - Total Birr: ${group.total_birr} | Total Liter: ${group.total_liter}`, 100, summaryY);
      summaryY += 30;
    });

    doc.fontSize(16).font('Helvetica-Bold').text(`Grand Total Fuel in Birr: ${grandTotalBirr.toFixed(2)}`, 100, summaryY + 30);

    doc.end();
    return;
  }

if (format.toLowerCase() === 'word') {
  const headers = [
    'Plate No',
    'Starting Date',
    'Starting KM',
    'Ending Date',
    'Ending KM',
    'Fuel in Birr',
    'Liter',
    'KM Diff',
    'KM/Lit',
  ];

  const children = [
    new Paragraph({
      text: 'FUEL EXPENSE REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Period: ${titleSuffix}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
    }),
    new Paragraph({ text: '' }),
  ];

  const cleanText = (v) =>
    v === null || v === undefined
      ? ''
      : v.toString().replace(/\s+/g, ' ').trim();

  reportData.forEach((group, groupIndex) => {
    // Heading per fuel type – page break before every group after the first
    children.push(
      new Paragraph({
        text: `${group.fuel_type} Fuel Type Vehicles`,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 200, after: 200 },
        pageBreakBefore: groupIndex > 0, // Diesel and others start on new page
      })
    );

    const tableRows = [];

    // Header row
    const headerRow = new TableRow({
      children: headers.map((h) =>
        new TableCell({
          children: [
            new Paragraph({
              text: h,
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { fill: 'D9E8F7' },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        })
      ),
      tableHeader: true,
    });
    tableRows.push(headerRow);

    // Data rows
    group.vehicles.forEach((v, index) => {
      const cells = [
        // Plate No
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(v.plate_no),
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // Starting Date
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(v.starting_date),
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // Starting KM
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(v.starting_km),
              alignment: AlignmentType.RIGHT,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // Ending Date
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(v.ending_date),
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // Ending KM
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(v.ending_km),
              alignment: AlignmentType.RIGHT,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // Fuel in Birr
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(Number(v.fuel_in_birr).toFixed(2)),
              alignment: AlignmentType.RIGHT,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // Liter
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(Number(v.liter).toFixed(2)),
              alignment: AlignmentType.RIGHT,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // KM Diff
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(v.km_diff),
              alignment: AlignmentType.RIGHT,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
        // KM/Lit
        new TableCell({
          children: [
            new Paragraph({
              text: cleanText(v.km_per_lit),
              alignment: AlignmentType.RIGHT,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
        }),
      ];

      if (index % 2 !== 0) {
        cells.forEach((cell) => {
          cell.shading = { fill: 'F2F2F2' };
        });
      }

      tableRows.push(new TableRow({ children: cells }));
    });

    // Total row for this fuel type
    const totalRowCells = [
      // Label cell spanning first 5 logical columns
      new TableCell({
        children: [
          new Paragraph({
            text: 'TOTAL',
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({ children: [new Paragraph('')] }),
      new TableCell({ children: [new Paragraph('')] }),
      new TableCell({ children: [new Paragraph('')] }),
      new TableCell({ children: [new Paragraph('')] }),
      // Fuel in Birr total
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(Number(group.total_birr).toFixed(2)),
            bold: true,
            alignment: AlignmentType.RIGHT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      // Liter total
      new TableCell({
        children: [
          new Paragraph({
            text: cleanText(Number(group.total_liter).toFixed(2)),
            bold: true,
            alignment: AlignmentType.RIGHT,
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({ children: [new Paragraph('')] }),
      new TableCell({ children: [new Paragraph('')] }),
    ];
    tableRows.push(new TableRow({ children: totalRowCells }));

    // Column widths tuned for A4 landscape (similar style to maintenance)
    const columnWidths = [1400, 1400, 1400, 1400, 1400, 1600, 1400, 1400, 1600];

    const table = new Table({
      rows: tableRows,
      width: { size: 15000, type: WidthType.DXA },
      columnWidths,
      margins: {
        top: 300,
        bottom: 300,
        left: 500,
        right: 700,
      },
    });

    children.push(table);
    children.push(new Paragraph({ text: '', spacing: { after: 500 } }));
  });

  // Grand total summary (last page, after all groups)
  children.push(
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'Grand Total Fuel in Birr: ' + grandTotalBirr.toFixed(2),
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.LEFT,
      spacing: { before: 400 },
    })
  );

  const docx = new Document({
    sections: [
      {
        children,
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1400,
              bottom: 1200,
              left: 1400,
            },
            size: {
              width: 16838,
              height: 11906,
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
      },
    ],
  });

  const buffer = await Packer.toBuffer(docx);
  res
    .set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}.docx"`,
    })
    .send(buffer);
}



});



export const generateGeneratorMaintenanceReport = catchAsync(async (req, res) => {
  const { format = 'excel', period, startDate, endDate } = req.query;

  if (!['excel', 'pdf', 'word'].includes(format.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Format must be excel, pdf, or word' });
  }

  let dateQuery, titleSuffix;
  try {
    ({ query: dateQuery, titleSuffix } = getDateRange(period, startDate, endDate));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const filename = `Generator_Maintenance_Report_${titleSuffix.replace(/[/]/g, '-')}`;

  const services = await GeneratorService.find({ service_date: dateQuery })
    .populate('generatorId', 'capacity')
    .sort({ allocation: 1, service_date: -1 })
    .lean();

  if (services.length === 0) {
    return res.status(404).json({ success: false, message: 'No generator maintenance records found' });
  }

  const enrichedServices = services.map((service, index) => ({
    sn: index + 1,
    branch: service.allocation || 'N/A',
    hour_meter_reading: service.hour_meter_reading || 'N/A',
    next_service_hour: service.next_service_hour || 'N/A',
    capacity: service.generatorId?.capacity || 'N/A',
    maintenance_type: service.maintenance_type || 'N/A', // Now before description
    description: service.description || 'N/A',
    work_done_by: service.service_provider || 'N/A',
    service_date: service.service_date ? new Date(service.service_date).toLocaleDateString('en-GB') : 'N/A',
    cost: service.cost || 0,
    status: service.status || 'N/A',
  }));

  const totalCost = enrichedServices.reduce((sum, s) => sum + s.cost, 0);

  // Updated column order: Maintenance Type before Description
  const columns = [
    { header: 'S.N', key: 'sn', width: 8 },
    { header: 'Branch', key: 'branch', width: 25 },
    { header: 'Hour Meter Reading', key: 'hour_meter_reading', width: 20 },
    { header: 'Next Service Hour', key: 'next_service_hour', width: 20 },
    { header: 'Capacity', key: 'capacity', width: 15 },
    { header: 'Maintenance Type', key: 'maintenance_type', width: 25 }, // Moved here
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Work Done By', key: 'work_done_by', width: 25 },
    { header: 'Service Date', key: 'service_date', width: 18 },
    { header: 'Cost', key: 'cost', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  if (format.toLowerCase() === 'excel') {
    let buffer = await generateExcelReport([], columns, 'Generator Maintenance Report', { groupBy: null });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Generator Maintenance Report');

    let rowIndex = 1;

    worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'GENERATOR MAINTENANCE REPORT';
    worksheet.getCell(`A${rowIndex}`).font = { size: 18, bold: true };
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
    rowIndex++;

    worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = `Period: ${titleSuffix}`;
    worksheet.getCell(`A${rowIndex}`).font = { size: 14 };
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
    rowIndex += 2;

    const headerRow = worksheet.getRow(rowIndex);
    headerRow.values = columns.map(col => col.header);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
    headerRow.alignment = { horizontal: 'center', wrapText: true };
    rowIndex++;

    enrichedServices.forEach(s => {
      worksheet.addRow([
        s.sn,
        s.branch,
        s.hour_meter_reading,
        s.next_service_hour,
        s.capacity,
        s.maintenance_type,
        s.description,
        s.work_done_by,
        s.service_date,
        s.cost.toFixed(2),
        s.status,
      ]);
      rowIndex++;
    });

    worksheet.addRow([
      'TOTAL COST',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      totalCost.toFixed(2),
      '',
      '',
    ]).font = { bold: true, color: { argb: 'FF0000' } };

    buffer = await workbook.xlsx.writeBuffer();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    }).send(buffer);
    return;
  }

if (format.toLowerCase() === 'pdf') {
  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  res.set({ 
    'Content-Type': 'application/pdf', 
    'Content-Disposition': `attachment; filename="${filename}.pdf"` 
  });
  doc.pipe(res);

  doc.fontSize(24).font('Helvetica-Bold').text('GENERATOR MAINTENANCE REPORT', { align: 'center' });
  doc.fontSize(16).text(`Period: ${titleSuffix}`, { align: 'center' });
  doc.moveDown(2);

  const headers = ['S.N', 'Branch', 'Hour Meter', 'Next Service', 'Capacity', 'Maint. Type', 'Description', 'Done By', 'Service Date', 'Cost', 'Status'];
  // Optimized for A4 landscape (usable width ~730 pixels from x=30 to x=760)
  const colWidths = [40, 70, 65, 65, 60, 75, 130, 75, 70, 60, 60];

  let y = doc.y;
  let x = 30;

  // Header row
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
  headers.forEach((h, i) => {
    doc.fillColor('#4F81BD').rect(x, y, colWidths[i], 30).fill();
    doc.fillColor('#FFFFFF').text(h, x + 3, y + 8, { width: colWidths[i] - 6, align: 'center', fontSize: 8 });
    x += colWidths[i];
  });
  y += 35;

  doc.font('Helvetica').fontSize(8).fillColor('black');

  // Data rows
  enrichedServices.forEach(s => {
    x = 30;
    const row = [
      String(s.sn),
      String(s.branch),
      String(s.hour_meter_reading),
      String(s.next_service_hour),
      String(s.capacity),
      String(s.maintenance_type),
      String(s.description),
      String(s.work_done_by),
      String(s.service_date),
      Number(s.cost).toFixed(2),
      String(s.status),
    ];

    const maxHeight = row.reduce((max, cell, i) => {
      const h = doc.heightOfString(cell, { width: colWidths[i] - 6 });
      return Math.max(max, h);
    }, 18);
    const rowHeight = maxHeight + 8;

    row.forEach((cell, i) => {
      doc.text(cell, x + 3, y + 3, { 
        width: colWidths[i] - 6, 
        align: (i === 9) ? 'right' : 'left',
        fontSize: 8
      });
      x += colWidths[i];
    });

    // Row border
    doc.moveTo(30, y + rowHeight).lineTo(760, y + rowHeight).stroke('#EEEEEE');
    y += rowHeight;

    // Page break
    if (y > 520) {
      doc.addPage();
      y = 50;
    }
  });

  // Total cost with proper positioning
  y += 15;
  doc.fontSize(11).font('Helvetica-Bold').text(`Total Cost: ${Number(totalCost).toFixed(2)}`, 30, y);

  doc.end();
  return;
}


if (format.toLowerCase() === 'word') {
  const headers = ['S.N', 'Branch', 'Hour Meter Reading', 'Next Service Hour', 'Capacity', 'Maintenance Type', 'Description', 'Work Done By', 'Service Date', 'Cost', 'Status'];

  const cleanText = (v) =>
    v === null || v === undefined
      ? ''
      : v.toString().replace(/\s+/g, ' ').trim();

  const children = [
    new Paragraph({
      text: 'GENERATOR MAINTENANCE REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Period: ${titleSuffix}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
    }),
    new Paragraph({ text: '' }),
  ];

  const tableRows = [];

  // Header row
  const headerRow = new TableRow({
    children: headers.map((h) =>
      new TableCell({
        children: [
          new Paragraph({
            text: h,
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: 'D9E8F7' },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      })
    ),
    tableHeader: true,
  });
  tableRows.push(headerRow);

  // Data rows
  enrichedServices.forEach((s, index) => {
    const cells = [
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.sn), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.branch), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.hour_meter_reading), alignment: AlignmentType.RIGHT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.next_service_hour), alignment: AlignmentType.RIGHT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.capacity), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.maintenance_type), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.description), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.work_done_by), alignment: AlignmentType.LEFT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.service_date), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(Number(s.cost).toFixed(2)), alignment: AlignmentType.RIGHT })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
      new TableCell({
        children: [new Paragraph({ text: cleanText(s.status), alignment: AlignmentType.CENTER })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
      }),
    ];

    if (index % 2 !== 0) {
      cells.forEach((cell) => {
        cell.shading = { fill: 'F2F2F2' };
      });
    }

    tableRows.push(new TableRow({ children: cells }));
  });

  // Total row
  const totalRowCells = [
    new TableCell({
      children: [new Paragraph({ text: 'TOTAL COST', bold: true, alignment: AlignmentType.CENTER })],
      shading: { fill: 'D9E8F7' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: cleanText(Number(totalCost).toFixed(2)), bold: true, alignment: AlignmentType.RIGHT })],
      shading: { fill: 'D9E8F7' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
    new TableCell({
      children: [new Paragraph({ text: '' })],
      shading: { fill: 'D9E8F7' },
      margins: { top: 150, bottom: 150, left: 150, right: 150 },
    }),
  ];
  tableRows.push(new TableRow({ children: totalRowCells }));

  // Column widths for A4 landscape (11 columns)
  const columnWidths = [700, 1300, 1300, 1300, 1000, 1400, 1800, 1400, 1300, 1200, 1200];

  const table = new Table({
    rows: tableRows,
    width: { size: 15000, type: WidthType.DXA },
    columnWidths,
    margins: {
      top: 300,
      bottom: 300,
      left: 500,
      right: 700,
    },
  });

  children.push(table);

  const docx = new Document({
    sections: [
      {
        children,
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1400,
              bottom: 1200,
              left: 1400,
            },
            size: {
              width: 16838,
              height: 11906,
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
      },
    ],
  });

  const buffer = await Packer.toBuffer(docx);
  res
    .set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}.docx"`,
    })
    .send(buffer);
}

});