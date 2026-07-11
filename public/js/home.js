/* home.js -- หน้าแรก */

let heroSlideIndex = 0;
let heroSlideTimer = null;
let heroSlidesData = [];

async function renderHomePage(container) {
  container.innerHTML = `
    <section id="heroSliderSection"></section>

    <section class="section">
      <div class="container">
        <div class="about-grid" id="aboutSection">
          ${skeletonCards(1, 'skeleton-card')}
        </div>
      </div>
    </section>

    <section class="section section-tight" style="background:var(--color-white);">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">อัปเดตล่าสุด</span>
          <h2 class="section-title">โปรโมชั่น &amp; สินค้าที่กำลังจะมา</h2>
          <p class="section-subtitle">ติดตามดีลพิเศษและสินค้าใหม่จากฟาร์มของเรา</p>
        </div>
        <div id="promotionsSection">
          <div class="promo-tabs-grid">
            <div>${skeletonCards(2)}</div>
            <div>${skeletonCards(2)}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section text-center">
      <div class="container">
        <div class="home-cta">
          <a href="#/products" class="btn btn-primary" data-nav>ดูสินค้าทั้งหมด</a>
          <a href="#/contact" class="btn btn-outline" data-nav>ติดต่อสอบถาม</a>
        </div>
      </div>
    </section>
  `;

  loadHeroSlides();
  loadAboutSection();
  loadPromotions();
}

async function loadHeroSlides() {
  const section = document.getElementById('heroSliderSection');
  try {
    const slides = await API.getHomeSlides();
    heroSlidesData = slides;
    if (!slides.length) {
      section.innerHTML = '';
      return;
    }
    section.innerHTML = `
      <div class="hero-slider" id="heroSlider">
        ${slides.map((s, i) => `
          <div class="hero-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
            <img src="${escapeHtml(s.image_url)}" alt="${escapeHtml(s.title)}" loading="${i === 0 ? 'eager' : 'lazy'}">
            <div class="hero-slide-overlay">
              <h1 class="hero-slide-title">${escapeHtml(s.title)}</h1>
              <p class="hero-slide-caption">${escapeHtml(s.caption)}</p>
            </div>
          </div>
        `).join('')}
        ${slides.length > 1 ? `
          <button class="hero-arrow hero-arrow-left" id="heroPrev" aria-label="ก่อนหน้า">‹</button>
          <button class="hero-arrow hero-arrow-right" id="heroNext" aria-label="ถัดไป">›</button>
          <div class="hero-dots" id="heroDots">
            ${slides.map((_, i) => `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="สไลด์ที่ ${i + 1}"></button>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    if (slides.length > 1) {
      document.getElementById('heroPrev').addEventListener('click', () => goToSlide(heroSlideIndex - 1));
      document.getElementById('heroNext').addEventListener('click', () => goToSlide(heroSlideIndex + 1));
      document.querySelectorAll('#heroDots .hero-dot').forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index, 10)));
      });
      const slider = document.getElementById('heroSlider');
      slider.addEventListener('mouseenter', stopHeroAutoplay);
      slider.addEventListener('mouseleave', startHeroAutoplay);
      startHeroAutoplay();
    }
  } catch (err) {
    section.innerHTML = `<div class="container" style="padding:40px 0;">${errorStateHtml('ไม่สามารถโหลดสไลด์หน้าแรกได้', 'loadHeroSlides')}</div>`;
  }
}

function goToSlide(index) {
  const total = heroSlidesData.length;
  heroSlideIndex = ((index % total) + total) % total;
  document.querySelectorAll('.hero-slide').forEach((el, i) => el.classList.toggle('active', i === heroSlideIndex));
  document.querySelectorAll('#heroDots .hero-dot').forEach((el, i) => el.classList.toggle('active', i === heroSlideIndex));
}
function startHeroAutoplay() {
  stopHeroAutoplay();
  heroSlideTimer = setInterval(() => goToSlide(heroSlideIndex + 1), 5000);
}
function stopHeroAutoplay() {
  if (heroSlideTimer) clearInterval(heroSlideTimer);
}

async function loadAboutSection() {
  const section = document.getElementById('aboutSection');
  try {
    const config = await API.getConfig();
    const highlights = [config.highlight_1, config.highlight_2, config.highlight_3, config.highlight_4].filter(Boolean);
    section.innerHTML = `
      <div class="about-image">
        <img src="images/mock/about-farm.svg" alt="${escapeHtml(config.farm_name)}" loading="lazy">
      </div>
      <div class="about-text">
        <span class="eyebrow">รู้จักเรา</span>
        <h2 class="section-title">${escapeHtml(config.farm_name)}</h2>
        <p>${escapeHtml(config.farm_description)}</p>
        <div class="highlight-list">
          ${highlights.map(h => `
            <div class="highlight-item"><span class="dot"></span>${escapeHtml(h)}</div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    section.innerHTML = errorStateHtml('ไม่สามารถโหลดข้อมูลฟาร์มได้', 'loadAboutSection');
  }
}

async function loadPromotions() {
  const section = document.getElementById('promotionsSection');
  try {
    const promos = await API.getPromotions();
    const promotions = promos.filter(p => p.type === 'promotion').slice(0, 3);
    const comingSoon = promos.filter(p => p.type === 'coming_soon').slice(0, 3);

    section.innerHTML = `
      <div class="promo-tabs-grid">
        <div>
          <div class="promo-col-title">
            <span class="badge-tag badge-promo">HOT</span> โปรโมชั่นตอนนี้
          </div>
          ${promotions.length ? promotions.map(promoCardHtml).join('') : emptyStateHtml('ยังไม่มีโปรโมชั่นในขณะนี้', '🏷️')}
        </div>
        <div>
          <div class="promo-col-title">
            <span class="badge-tag badge-soon">NEW</span> สินค้าที่กำลังจะมา
          </div>
          ${comingSoon.length ? comingSoon.map(promoCardHtml).join('') : emptyStateHtml('ยังไม่มีสินค้าใหม่ที่ประกาศไว้', '🆕')}
        </div>
      </div>
    `;
  } catch (err) {
    section.innerHTML = errorStateHtml('ไม่สามารถโหลดโปรโมชั่นได้', 'loadPromotions');
  }
}

function promoCardHtml(p) {
  const dateText = p.end_date
    ? `ถึงวันที่ ${formatThaiDate(p.end_date)}`
    : (p.start_date ? `เริ่ม ${formatThaiDate(p.start_date)}` : '');
  return `
    <div class="promo-card">
      <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" loading="lazy">
      <div class="promo-card-body">
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.description)}</p>
        ${dateText ? `<span class="promo-card-date">${escapeHtml(dateText)}</span>` : ''}
      </div>
    </div>
  `;
}
