/* products.js -- หน้าสินค้า */

let allProductsCache = [];
let currentCategoryFilter = 'all';
let currentSearchTerm = '';

async function renderProductsPage(container) {
  container.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <h1>สินค้าของเรา</h1>
        <p>ลูกปลา ปลาโต และอาหารปลาคุณภาพ พร้อมส่งถึงมือคุณ</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="filter-bar" id="productFilterBar"></div>
        <div class="product-grid" id="productGrid">
          ${skeletonCards(8)}
        </div>
      </div>
    </section>
  `;
  await loadProducts();
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  const filterBar = document.getElementById('productFilterBar');
  try {
    if (!allProductsCache.length) {
      allProductsCache = await API.getProducts();
    }
    const categories = ['all', ...new Set(allProductsCache.map(p => p.category))];
    filterBar.innerHTML = `
      ${categories.map(cat => `
        <button class="filter-chip ${cat === currentCategoryFilter ? 'active' : ''}" data-category="${escapeHtml(cat)}">
          ${cat === 'all' ? 'ทั้งหมด' : escapeHtml(cat)}
        </button>
      `).join('')}
      <div class="search-box">
        <input type="text" id="productSearchInput" placeholder="ค้นหาสินค้า..." value="${escapeHtml(currentSearchTerm)}">
      </div>
    `;
    filterBar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentCategoryFilter = chip.dataset.category;
        filterBar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderFilteredProducts();
      });
    });
    document.getElementById('productSearchInput').addEventListener('input', (e) => {
      currentSearchTerm = e.target.value;
      renderFilteredProducts();
    });

    renderFilteredProducts();
  } catch (err) {
    grid.innerHTML = errorStateHtml('ไม่สามารถโหลดสินค้าได้', 'loadProducts');
  }
}

function renderFilteredProducts() {
  const grid = document.getElementById('productGrid');
  let products = allProductsCache;
  if (currentCategoryFilter !== 'all') {
    products = products.filter(p => p.category === currentCategoryFilter);
  }
  if (currentSearchTerm.trim()) {
    const term = currentSearchTerm.trim().toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }

  if (!products.length) {
    grid.innerHTML = emptyStateHtml('ไม่พบสินค้าที่ค้นหา', '🐟');
    return;
  }

  grid.innerHTML = products.map(productCardHtml).join('');
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openProductModal(card.dataset.id));
  });
}

function productCardHtml(p) {
  return `
    <div class="product-card" data-id="${escapeHtml(p.product_id)}">
      <div class="product-card-image">
        <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy">
        ${stockBadge(p.stock_qty, p.stock_unit)}
      </div>
      <div class="product-card-body">
        <span class="product-category-badge">${escapeHtml(p.category)}</span>
        <h3 class="product-card-title">${escapeHtml(p.name)}</h3>
        <p class="product-card-desc">${escapeHtml(p.description)}</p>
        <div class="product-card-stock">คงเหลือ: ${p.stock_qty > 0 ? `${p.stock_qty.toLocaleString('th-TH')} ${escapeHtml(p.stock_unit)}` : 'หมดชั่วคราว'}</div>
        <div class="product-card-footer">
          ${priceBlock(p)}
          <button class="btn btn-primary">ดูรายละเอียด</button>
        </div>
      </div>
    </div>
  `;
}

async function openProductModal(productId) {
  const box = document.getElementById('productModalBox');
  box.innerHTML = `<div class="skeleton" style="height:420px;border-radius:22px;"></div>`;
  openModal('productModal');

  try {
    const [product, reviews, config] = await Promise.all([
      API.getProduct(productId),
      API.getReviews(productId).catch(() => []),
      API.getConfig().catch(() => ({}))
    ]);

    const images = [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean);
    const avgStars = reviews.length
      ? (reviews.reduce((sum, r) => sum + Number(r.stars), 0) / reviews.length).toFixed(1)
      : null;

    box.innerHTML = `
      <button class="modal-close" id="closeProductModal">✕</button>
      <div class="modal-product-image">
        <img src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" id="modalMainImage">
      </div>
      ${images.length > 1 ? `
        <div class="modal-thumbs">
          ${images.map((img, i) => `
            <div class="modal-thumb ${i === 0 ? 'active' : ''}" data-src="${escapeHtml(img)}">
              <img src="${escapeHtml(img)}" alt="">
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div class="modal-body">
        <span class="product-category-badge">${escapeHtml(product.category)}</span>
        <h2>${escapeHtml(product.name)}</h2>
        <p class="modal-desc">${escapeHtml(product.description)}</p>
        <div class="modal-meta-row">
          ${priceBlock(product)}
          ${stockBadge(product.stock_qty, product.stock_unit)}
          <span style="color:var(--color-text-muted);font-size:0.88rem;">คงเหลือ ${product.stock_qty.toLocaleString('th-TH')} ${escapeHtml(product.stock_unit)}</span>
        </div>
        ${avgStars ? `
          <div class="modal-rating">⭐ ${avgStars} จาก ${reviews.length} รีวิว</div>
        ` : ''}
        <a class="btn btn-green btn-block mt-24" href="${config.farm_line ? `https://line.me/R/ti/p/${encodeURIComponent(config.farm_line)}` : '#/contact'}" target="_blank" rel="noopener">
          ติดต่อสั่งซื้อทาง Line
        </a>

        <div class="modal-reviews">
          <h4>รีวิวสินค้านี้</h4>
          ${reviews.length
            ? reviews.slice(0, 5).map(r => `
              <div class="mini-review">
                <div class="mini-review-head">
                  <span class="mini-review-name">${escapeHtml(r.reviewer_name)}</span>
                  <span style="color:#f5a623;">${renderStars(r.stars)}</span>
                </div>
                <p class="mini-review-text">${escapeHtml(r.review_text)}</p>
              </div>
            `).join('')
            : `<p style="color:var(--color-text-muted);font-size:0.9rem;">ยังไม่มีรีวิวสำหรับสินค้านี้</p>`
          }
        </div>
      </div>
    `;

    document.getElementById('closeProductModal').addEventListener('click', () => closeModal('productModal'));
    box.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.getElementById('modalMainImage').src = thumb.dataset.src;
        box.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  } catch (err) {
    box.innerHTML = `<button class="modal-close" onclick="closeModal('productModal')">✕</button><div style="padding:40px;">${errorStateHtml('ไม่สามารถโหลดข้อมูลสินค้าได้')}</div>`;
  }
}
