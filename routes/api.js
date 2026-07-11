const express = require('express');
const router = express.Router();
const ds = require('../data-source');

// ---------- HOME ----------
router.get('/config', async (req, res) => {
  try {
    const config = await ds.getConfig();
    res.json({ ok: true, data: config });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/home-slides', async (req, res) => {
  try {
    const slides = await ds.getHomeSlides();
    res.json({ ok: true, data: slides });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/promotions', async (req, res) => {
  try {
    const promos = await ds.getPromotions();
    res.json({ ok: true, data: promos });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------- PRODUCTS ----------
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    const products = await ds.getProducts(category);
    res.json({ ok: true, data: products });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await ds.getProductById(req.params.id);
    if (!product) return res.status(404).json({ ok: false, error: 'ไม่พบสินค้า' });
    res.json({ ok: true, data: product });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------- KNOWLEDGE ----------
router.get('/knowledge', async (req, res) => {
  try {
    const { category } = req.query;
    const articles = await ds.getKnowledge(category);
    res.json({ ok: true, data: articles });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------- REVIEWS ----------
router.get('/reviews', async (req, res) => {
  try {
    const { product_id } = req.query;
    const reviews = await ds.getReviews(product_id);
    res.json({ ok: true, data: reviews });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { reviewer_name, stars, review_text, product_ref } = req.body;
    if (!reviewer_name || !stars || !review_text) {
      return res.status(400).json({ ok: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, ดาว, คำรีวิว)' });
    }
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ ok: false, error: 'คะแนนดาวต้องอยู่ระหว่าง 1-5' });
    }
    const newReview = await ds.addReview({ reviewer_name, stars, review_text, product_ref });
    res.json({ ok: true, data: newReview, message: 'ขอบคุณสำหรับรีวิว รอการอนุมัติก่อนแสดงผลนะคะ' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------- FAQ ----------
router.get('/faq', async (req, res) => {
  try {
    const faqs = await ds.getFaq();
    res.json({ ok: true, data: faqs });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/faq', async (req, res) => {
  try {
    const { question, submitted_by } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ ok: false, error: 'กรุณากรอกคำถาม' });
    }
    const newFaq = await ds.addFaqQuestion({ question, submitted_by });
    res.json({ ok: true, data: newFaq, message: 'ได้รับคำถามของคุณแล้ว เราจะมาตอบให้เร็วๆ นี้นะคะ' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------- GALLERY (contact page) ----------
router.get('/gallery', async (req, res) => {
  try {
    const gallery = await ds.getGallery();
    res.json({ ok: true, data: gallery });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
