/**
 * Utilities for exporting document and VIN data to CSV and JSON
 */

export function exportToCSV(files, filename = 'IntelliExtract_Fleet_Report.csv') {
  if (!files || files.length === 0) return;

  const headers = [
    'Document Name',
    'Document Class',
    'Status',
    'Accuracy %',
    'Total VINs',
    'Found VINs',
    'Manual Required',
    'Pages',
    'FileNet Status',
    'FileNet ID',
    'Fleet Account',
    'Fleet Location',
    'Extracted VINs'
  ];

  const rows = files.map(f => {
    const vinList = (f.extractedVins || []).map(v => v.vin).join('; ');
    return [
      `"${f.name}"`,
      `"${f.docClass}"`,
      `"${f.status}"`,
      `"${f.accuracy}%"`,
      f.totalVin,
      f.found,
      f.needManual,
      f.pages,
      `"${f.fileNetStatus || 'Pending'}"`,
      `"${f.fileNetId || '-'}"`,
      `"${f.account || 'HERTZ VEHICLES LLC'}"`,
      `"${f.location || '-'}"`,
      `"${vinList}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(files, filename = 'IntelliExtract_Export.json') {
  if (!files || files.length === 0) return;

  const jsonStr = JSON.stringify(files, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
