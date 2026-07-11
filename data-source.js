/**
 * data-source.js
 * ----------------------------------------------------------------
 * Data Access Layer (DAL) ของระบบ
 * ตอนนี้ DATA_SOURCE=mock -> อ่านจากไฟล์ JSON ใน /data
 * เมื่อพร้อมต่อ Google Sheets จริง ให้เปลี่ยน DATA_SOURCE=sheets ใน .env
 * แล้วเติม logic ในฟังก์ชัน loadSheetsXxx() ด้านล่าง (โครงไว้ให้แล้ว)
 * โดยที่ routes/api.js ไม่ต้องแก้อะไรเลย เพราะเรียกผ่านฟังก์ชันชุดเดียวกัน
 * ----------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const DATA_SOURCE = process.env.DATA_SOURCE || 'mock';
const DATA_DIR = path.join(__dirname, 'data');

function readMockFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

// in-memory store เฉพาะ session สำหรับ mock mode (เขียนรีวิว/คำถามใหม่)
// (ไม่ persist หลัง restart server -- ถ้าต้องการให้ persist ค่อยเปลี่ยนเป็นเขียนกลับไฟล์ json)
let mockReviewsRuntime = null;
let mockFaqRuntime = null;

function getMockReviews() {
  if (!mockReviewsRuntime) mockReviewsRuntime = readMockFile('reviews.json');
  return mockReviewsRuntime;
}
function getMockFaq() {
  if (!mockFaqRuntime) mockFaqRuntime = readMockFile('faq.json');
  return mockFaqRuntime;
}

// ===================================================================
// PUBLIC API ของ DAL -- routes/api.js เรียกใช้ฟังก์ชันพวกนี้เท่านั้น
// ===================================================================

async function getConfig() {
  if (DATA_SOURCE === 'mock') return readMockFile('config.json');
  return loadSheetsConfig();
}

async function getHomeSlides() {
  if (DATA_SOURCE === 'mock') {
    return readMockFile('home_slides.json').filter(s => s.is_active === 'Y');
  }
  return loadSheetsHomeSlides();
}

async function getPromotions() {
  if (DATA_SOURCE === 'mock') {
    return readMockFile('promotions.json').filter(p => p.is_active === 'Y');
  }
  return loadSheetsPromotions();
}

async function getProducts(category) {
  if (DATA_SOURCE === 'mock') {
    let products = readMockFile('products.json').filter(p => p.is_active === 'Y');
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    return products.sort((a, b) => a.sort_order - b.sort_order);
  }
  return loadSheetsProducts(category);
}

async function getProductById(id) {
  const products = await getProducts();
  return products.find(p => p.product_id === id) || null;
}

async function getKnowledge(category) {
  if (DATA_SOURCE === 'mock') {
    let articles = readMockFile('knowledge.json').filter(a => a.is_active === 'Y');
    if (category && category !== 'all') {
      articles = articles.filter(a => a.category === category);
    }
    return articles.sort((a, b) => a.sort_order - b.sort_order);
  }
  return loadSheetsKnowledge(category);
}

async function getReviews(productId) {
  let reviews;
  if (DATA_SOURCE === 'mock') {
    reviews = getMockReviews().filter(r => r.is_approved === 'Y');
  } else {
    reviews = await loadSheetsReviews();
  }
  if (productId) {
    reviews = reviews.filter(r => r.product_ref === productId);
  }
  return reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

async function addReview({ reviewer_name, stars, review_text, product_ref }) {
  const newReview = {
    review_id: 'R' + Date.now(),
    reviewer_name,
    stars,
    review_text,
    timestamp: new Date().toISOString(),
    is_approved: 'N', // ต้องรอ admin อนุมัติก่อนแสดง
    product_ref: product_ref || ''
  };
  if (DATA_SOURCE === 'mock') {
    const reviews = getMockReviews();
    reviews.unshift(newReview);
    return newReview;
  }
  return saveSheetsReview(newReview);
}

async function getFaq() {
  if (DATA_SOURCE === 'mock') {
    return getMockFaq().filter(f => f.is_active === 'Y' && f.answer);
  }
  return loadSheetsFaq();
}

async function addFaqQuestion({ question, submitted_by }) {
  const newFaq = {
    faq_id: 'F' + Date.now(),
    question,
    answer: '',
    submitted_by: submitted_by || 'ไม่ระบุชื่อ',
    timestamp: new Date().toISOString(),
    is_active: 'N'
  };
  if (DATA_SOURCE === 'mock') {
    const faqs = getMockFaq();
    faqs.unshift(newFaq);
    return newFaq;
  }
  return saveSheetsFaq(newFaq);
}

async function getGallery() {
  if (DATA_SOURCE === 'mock') {
    return readMockFile('gallery.json')
      .filter(g => g.is_active === 'Y')
      .sort((a, b) => a.sort_order - b.sort_order);
  }
  return loadSheetsGallery();
}

// ===================================================================
// GOOGLE SHEETS LOADERS (โครงไว้ให้ -- เติม logic ตอนเชื่อมจริง)
// ใช้ไลบรารี "googleapis" -> npm install googleapis
// ===================================================================

async function getSheetsClient() {
  const { google } = require('googleapis');
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

async function loadSheetsConfig() {
  // TODO: implement -- read sheet "config", map column A:key -> B:value as object
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า (DATA_SOURCE=sheets) — ดู SETUP.md');
}
async function loadSheetsHomeSlides() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function loadSheetsPromotions() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function loadSheetsProducts() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function loadSheetsKnowledge() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function loadSheetsReviews() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function saveSheetsReview() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function loadSheetsFaq() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function saveSheetsFaq() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}
async function loadSheetsGallery() {
  throw new Error('Google Sheets mode ยังไม่ได้ตั้งค่า — ดู SETUP.md');
}

module.exports = {
  DATA_SOURCE,
  getConfig,
  getHomeSlides,
  getPromotions,
  getProducts,
  getProductById,
  getKnowledge,
  getReviews,
  addReview,
  getFaq,
  addFaqQuestion,
  getGallery
};
