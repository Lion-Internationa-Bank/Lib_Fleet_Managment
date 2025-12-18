// utils/excelGenerator.js
import ExcelJS from 'exceljs';

export const generateExcelReport = async (data, columns, sheetName = 'Report', options = {}) => {
  const { groupBy, formatRow = (item) => item } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Set columns
  worksheet.columns = columns;

  // Style header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  let rowIndex = 2;

  if (!groupBy) {
    // Flat list
    data.forEach((item) => {
      const row = worksheet.addRow(formatRow(item));
      row.alignment = { wrapText: true, vertical: 'top' };
    });
  } else {
    // Grouped by field
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy] || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    Object.keys(grouped)
      .sort()
      .forEach((groupValue) => {
        const groupData = grouped[groupValue];

        // Group Title Row
        const titleRowNum = rowIndex++;
        const titleCell = worksheet.getCell(`A${titleRowNum}`);
        titleCell.value = `${groupBy.toUpperCase()}: ${groupValue.toUpperCase()}`;
        titleCell.font = { bold: true, size: 16, color: { argb: 'FF003366' } };
        titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F0FA' } };
        worksheet.mergeCells(`A${titleRowNum}:${String.fromCharCode(64 + columns.length)}${titleRowNum}`);
        worksheet.getRow(titleRowNum).height = 35;

        rowIndex++;

        // Add rows for this group
        groupData.forEach((item) => {
          const row = worksheet.addRow(formatRow(item));
          row.alignment = { wrapText: true, vertical: 'top' };
          rowIndex++;
        });

        rowIndex += 2;
      });
  }

  // Auto-adjust row height based on content (especially wrapped text)
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber === 1) {
      row.height = 30; // header taller
      return;
    }

    let maxLines = 1;
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (cell.value && typeof cell.value === 'string') {
        const lines = cell.value.split('\n').length;
        const wrappedLines = Math.ceil(cell.value.length / 60); // approx chars per line
        maxLines = Math.max(maxLines, lines, wrappedLines);
      }
    });

    row.height = Math.max(20, maxLines * 18); // minimum 20, ~18pt per line
  });

  // Enable wrap text on all columns
  worksheet.columns.forEach(col => {
    col.alignment = { ...col.alignment, wrapText: true, vertical: 'top' };
  });

  return await workbook.xlsx.writeBuffer();
};