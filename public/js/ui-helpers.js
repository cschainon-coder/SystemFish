/* ui-helpers.js -- ฟังก์ชันช่วยเหลือที่ใช้ร่วมกันทุกหน้า */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function skeletonCards(count, extraClass = '') {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton skeleton-card ${extraClass}"></div>`;
  }
  return html;
}

function errorStateHtml(message, retryFnName) {
  return `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>${escapeHtml(message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')}</p>
      ${retryFnName ? `<button class="btn btn-outline" onclick="${retryFnName}()">ลองใหม่</button>` : ''}
    </div>
  `;
}

function emptyStateHtml(message, icon = '📭') {
  return `
    <div class="empty-state">
      <span class="empty-icon">${icon}</span>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function renderStars(count, max = 5) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += i <= count ? '★' : '☆';
  }
  return html;
}

function formatThaiDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function stockBadge(qty, unit) {
  if (qty <= 0) {
    return `<span class="stock-badge stock-out">สินค้าหมด</span>`;
  }
  if (qty <= 5) {
    return `<span class="stock-badge stock-low">ใกล้หมด</span>`;
  }
  return `<span class="stock-badge stock-ok">มีสินค้า</span>`;
}

function priceBlock(product) {
  if (product.show_price === 'Y') {
    return `<div class="product-price">${Number(product.price).toLocaleString('th-TH')} <small>บาท ${escapeHtml(product.price_unit || '')}</small></div>`;
  }
  return `<div class="product-price-hidden">${escapeHtml(product.price_hidden_text || 'ตามที่เซทไว้')}</div>`;
}

// Back to top button
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// Generic modal close handlers
function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  overlay.hidden = true;
  document.body.style.overflow = '';
}
['productModal', 'articleModal'].forEach(id => {
  const overlay = document.getElementById(id);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(id);
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal('productModal');
    closeModal('articleModal');
  }
});
