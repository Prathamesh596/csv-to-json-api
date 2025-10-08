const fs = require('fs');
const path = require('path');
const express = require('express');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

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

function generateAgeReport(users) {
  const groups = { '<20': 0, '20-40': 0, '40-60': 0, '>60': 0 };
  const total = users.length || 1;

  users.forEach(user => {
    const age = user.age;
    if (age < 20) groups['<20']++;
    else if (age <= 40) groups['20-40']++;
    else if (age <= 60) groups['40-60']++;
    else groups['>60']++;
  });

  console.log('\n Age Distribution Report');
  console.log('--------------------------');
  Object.entries(groups).forEach(([range, count]) => {
    const percent = ((count / total) * 100).toFixed(2);
    console.log(`${range}: ${percent}%`);
  });
}

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
    const users = [];

    for (const record of records) {
      const firstName = record.name?.firstName || '';
      const lastName = record.name?.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      const age = parseInt(record.age, 10);
      if (isNaN(age)) continue;

      const address = record.address || null;

      const additional_info = { ...record };
      delete additional_info.name;
      delete additional_info.age;
      delete additional_info.address;

      // Insert into PostgreSQL
      await pool.query(
        `INSERT INTO users (name, age, address, additional_info)
         VALUES ($1, $2, $3, $4)`,
        [name, age, address, JSON.stringify(additional_info)]
      );

      users.push({ name, age });
    }

    generateAgeReport(users);

    return res.status(200).json({
      message: '✅ CSV uploaded and data inserted successfully',
      totalRecords: users.length,
    });
  } catch (err) {
    console.error(' Conversion or DB operation failed:', err);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
}

app.get('/convert', handleConvert);
app.post('/convert', handleConvert);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Watching folder: ${path.join(__dirname, 'csv_files')}`);
});
