require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');
const { DATA_SOURCE } = require('./data-source');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

// SPA fallback - ทุก route ที่ไม่ใช่ /api ให้ส่ง index.html (router ฝั่ง client จัดการเอง)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('  สุขใจฟาร์ม เว็บไซต์ - เริ่มทำงานแล้ว');
  console.log('========================================');
  console.log(`  โหมดข้อมูล: ${DATA_SOURCE.toUpperCase()}`);
  console.log(`  เปิดเว็บที่: http://localhost:${PORT}`);
  console.log('========================================');
});
