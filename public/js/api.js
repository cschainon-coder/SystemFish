/* api.js -- เรียก backend API ทั้งหมดที่นี่ */
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

  getConfig: () => API._get('/api/config'),
  getHomeSlides: () => API._get('/api/home-slides'),
  getPromotions: () => API._get('/api/promotions'),
  getProducts: (category) => API._get(`/api/products${category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`),
  getProduct: (id) => API._get(`/api/products/${id}`),
  getKnowledge: (category) => API._get(`/api/knowledge${category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`),
  getReviews: (productId) => API._get(`/api/reviews${productId ? `?product_id=${encodeURIComponent(productId)}` : ''}`),
  postReview: (data) => API._post('/api/reviews', data),
  getFaq: () => API._get('/api/faq'),
  postFaq: (data) => API._post('/api/faq', data),
  getGallery: () => API._get('/api/gallery')
};
