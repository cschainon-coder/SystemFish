/* knowledge.js -- หน้าให้ความรู้ */

let allKnowledgeCache = [];
let currentKnowledgeCategory = 'all';

async function renderKnowledgePage(container) {
  container.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <h1>คลังความรู้เลี้ยงปลา</h1>
        <p>เทคนิคและความรู้จากประสบการณ์จริงของฟาร์มเรา</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="filter-bar" id="knowledgeFilterBar"></div>
        <div class="know-grid" id="knowledgeGrid">
          ${skeletonCards(6)}
        </div>
      </div>
    </section>
  `;
  await loadKnowledge();
}

async function loadKnowledge() {
  const grid = document.getElementById('knowledgeGrid');
  const filterBar = document.getElementById('knowledgeFilterBar');
  try {
    if (!allKnowledgeCache.length) {
      allKnowledgeCache = await API.getKnowledge();
    }
    const categories = ['all', ...new Set(allKnowledgeCache.map(a => a.category))];
    filterBar.innerHTML = categories.map(cat => `
      <button class="filter-chip ${cat === currentKnowledgeCategory ? 'active' : ''}" data-category="${escapeHtml(cat)}">
        ${cat === 'all' ? 'ทั้งหมด' : escapeHtml(cat)}
      </button>
    `).join('');

    filterBar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentKnowledgeCategory = chip.dataset.category;
        filterBar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderFilteredKnowledge();
      });
    });

    renderFilteredKnowledge();
  } catch (err) {
    grid.innerHTML = errorStateHtml('ไม่สามารถโหลดบทความได้', 'loadKnowledge');
  }
}

function renderFilteredKnowledge() {
  const grid = document.getElementById('knowledgeGrid');
  let articles = allKnowledgeCache;
  if (currentKnowledgeCategory !== 'all') {
    articles = articles.filter(a => a.category === currentKnowledgeCategory);
  }
  if (!articles.length) {
    grid.innerHTML = emptyStateHtml('ยังไม่มีบทความในหมวดนี้', '📚');
    return;
  }
  grid.innerHTML = articles.map(articleCardHtml).join('');
  grid.querySelectorAll('.know-card').forEach(card => {
    card.addEventListener('click', () => openArticleModal(card.dataset.id));
  });
}

function articleCardHtml(a) {
  const tags = (a.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  return `
    <div class="know-card" data-id="${escapeHtml(a.article_id)}">
      <div class="know-card-image">
        <img src="${escapeHtml(a.cover_image)}" alt="${escapeHtml(a.title)}" loading="lazy">
      </div>
      <div class="know-card-body">
        <div class="know-card-cat">${escapeHtml(a.category)}</div>
        <h3 class="know-card-title">${escapeHtml(a.title)}</h3>
        <p class="know-card-preview">${escapeHtml((a.content || '').split('\n')[0])}</p>
        <div class="know-card-tags">
          ${tags.map(t => `<span class="know-tag">#${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function openArticleModal(articleId) {
  const article = allKnowledgeCache.find(a => a.article_id === articleId);
  const box = document.getElementById('articleModalBox');
  if (!article) {
    box.innerHTML = `<button class="modal-close" onclick="closeModal('articleModal')">✕</button><div style="padding:40px;">${errorStateHtml('ไม่พบบทความนี้')}</div>`;
    openModal('articleModal');
    return;
  }
  const tags = (article.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const paragraphs = (article.content || '').split('\n').filter(p => p.trim());

  box.innerHTML = `
    <button class="modal-close" id="closeArticleModal">✕</button>
    <div class="article-modal-image">
      <img src="${escapeHtml(article.cover_image)}" alt="${escapeHtml(article.title)}">
    </div>
    <div class="article-modal-body">
      <span class="product-category-badge">${escapeHtml(article.category)}</span>
      <h2>${escapeHtml(article.title)}</h2>
      <div class="article-tags">
        ${tags.map(t => `<span class="article-tag">#${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="article-content">
        ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      </div>
    </div>
  `;
  document.getElementById('closeArticleModal').addEventListener('click', () => closeModal('articleModal'));
  openModal('articleModal');
}
