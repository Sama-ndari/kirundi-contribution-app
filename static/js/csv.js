/* CSV reading for the public metadata.csv (quoted fields may hold commas, quotes and line breaks). */
/* exported parseCsv, columnIndex */
"use strict";

/** CSV text → array of rows (arrays of raw cell strings). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes && char === '"' && text[i + 1] === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && char === ",") {
      row.push(field);
      field = "";
    } else if (!inQuotes && char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (inQuotes || char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) rows.push([...row, field]);
  return rows;
}

/** Index of the first header containing every word (case-insensitive), or -1. */
function columnIndex(headers, ...words) {
  return headers.findIndex((header) => {
    const name = header.trim().toLowerCase();
    return words.every((word) => name.includes(word));
  });
}
