/* api.js -- เรียกข้อมูลทั้งหมดที่นี่
 *
 * รองรับ 2 โหมด โดยโค้ดหน้าอื่น (home.js, products.js, ...) ไม่ต้องรู้เลยว่าอยู่โหมดไหน:
 *
 *   1) server mode  -- ตอนรัน `npm start` ในเครื่อง หรือ deploy บน host ที่รัน Node ได้ (เช่น Render)
 *                      ยิง fetch ไปที่ Express API ที่ /api/* ตามปกติ ส่งรีวิว/คำถามได้จริง
 *
 *   2) static mode  -- ตอน deploy บน GitHub Pages ซึ่งรัน Node ไม่ได้ เสิร์ฟได้แต่ไฟล์นิ่ง
 *                      จึงอ่านไฟล์ JSON ที่ scripts/build-static.js สร้างไว้ล่วงหน้าใน api/
 *                      แล้วกรอง/ค้นหาฝั่ง browser แทน (ไม่มี backend ให้ยิง query string)
 *                      โหมดนี้เป็นแบบอ่านอย่างเดียว -- ส่งรีวิว/คำถามไม่ได้
 *
 * static mode เปิดเมื่อ window.STATIC_DATA === true ซึ่ง build-static.js ฝัง <script> ไว้ใน index.html
 */
const STATIC_MODE = window.STATIC_DATA === true;

const STATIC_READONLY_MSG =
  'เว็บนี้เป็นเวอร์ชันสาธิต (แสดงผลอย่างเดียว) จึงยังบันทึกข้อมูลไม่ได้ — รบกวนติดต่อฟาร์มผ่านช่องทางในหน้า "ติดต่อเรา" แทนนะคะ';

// cache ไฟล์ JSON ที่โหลดมาแล้ว (static mode) -- เก็บเป็น Promise กันโหลดซ้ำซ้อนตอนเรียกพร้อมกัน
const staticCache = {};

async function loadStaticFile(name) {
  if (!staticCache[name]) {
    staticCache[name] = fetch(`api/${name}.json`)
      .then(res => {
        if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
        return res.json();
      })
      .catch(err => {
        delete staticCache[name]; // ให้ลองใหม่ได้ ถ้าครั้งนี้เน็ตหลุด
        throw err;
      });
  }
  return staticCache[name];
}

const API = {
  async _get(url) {
    const res = await fetch(url);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'เกิดข้อผิดพลาด');
    return json.data;
  },
  async _post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'เกิดข้อผิดพลาด');
    return json;
  },

  getConfig: () =>
    STATIC_MODE ? loadStaticFile('config') : API._get('/api/config'),

  getHomeSlides: () =>
    STATIC_MODE ? loadStaticFile('home-slides') : API._get('/api/home-slides'),

  getPromotions: () =>
    STATIC_MODE ? loadStaticFile('promotions') : API._get('/api/promotions'),

  getFaq: () =>
    STATIC_MODE ? loadStaticFile('faq') : API._get('/api/faq'),

  getGallery: () =>
    STATIC_MODE ? loadStaticFile('gallery') : API._get('/api/gallery'),

  async getProducts(category) {
    if (STATIC_MODE) {
      const products = await loadStaticFile('products');
      if (!category || category === 'all') return products;
      return products.filter(p => p.category === category);
    }
    return API._get(`/api/products${category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`);
  },

  async getProduct(id) {
    if (STATIC_MODE) {
      const products = await loadStaticFile('products');
      return products.find(p => p.product_id === id) || null;
    }
    return API._get(`/api/products/${id}`);
  },

  async getKnowledge(category) {
    if (STATIC_MODE) {
      const articles = await loadStaticFile('knowledge');
      if (!category || category === 'all') return articles;
      return articles.filter(a => a.category === category);
    }
    return API._get(`/api/knowledge${category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`);
  },

  async getReviews(productId) {
    if (STATIC_MODE) {
      const reviews = await loadStaticFile('reviews');
      if (!productId) return reviews;
      return reviews.filter(r => r.product_ref === productId);
    }
    return API._get(`/api/reviews${productId ? `?product_id=${encodeURIComponent(productId)}` : ''}`);
  },

  postReview(data) {
    if (STATIC_MODE) return Promise.reject(new Error(STATIC_READONLY_MSG));
    return API._post('/api/reviews', data);
  },

  postFaq(data) {
    if (STATIC_MODE) return Promise.reject(new Error(STATIC_READONLY_MSG));
    return API._post('/api/faq', data);
  }
};
