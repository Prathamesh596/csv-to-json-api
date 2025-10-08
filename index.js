const fs = require('fs');
const path = require('path');
const express = require('express');
const csv = require('csv-parser');
require('dotenv').config();


// app.get('/convert', handleConvert);
// app.post('/convert', handleConvert);

const app = express();
app.use(express.json());

/**
 * Helper: create nested objects from dot notation keys.
 * Example: "user.name.first" → { user: { name: { first: value } } }
 */
function setNested(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = current[key] || {};
      current = current[key];
    }
  });
}

/**
 * Parse a CSV file into an array of nested JSON objects.
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ value }) =>
            typeof value === 'string' ? value.trim() : value,
        })
      )
      .on('data', row => {
        const record = {};
        Object.entries(row).forEach(([key, value]) => {
          setNested(record, key, value);
        });
        records.push(record);
      })
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

/**
 * Shared function for both GET and POST routes
 */
async function handleConvert(req, res) {
  try {
    const fileName = process.env.CSV_FILE_NAME || 'users.csv';
    const filePath = path.join(__dirname, 'csv_files', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        error: `CSV file not found at path: ${filePath}`,
      });
    }

    const records = await parseCSV(filePath);

    return res.status(200).json({
      message: '✅ CSV successfully converted to JSON',
      totalRecords: records.length,
      data: records,
    });
  } catch (err) {
    console.error('❌ Conversion failed:', err);
    res.status(500).json({ error: 'Failed to convert CSV to JSON' });
  }
}

/**
 * Routes
 */
app.get('/convert', handleConvert);
app.post('/convert', handleConvert);

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Watching folder: ${path.join(__dirname, 'csv_files')}`);
});
