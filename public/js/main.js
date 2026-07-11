/* main.js -- Router หลักของ SPA และจัดการ flag เปิด/ปิดหน้า */

const PAGE_RENDERERS = {
  home: renderHomePage,
  products: renderProductsPage,
  knowledge: renderKnowledgePage,
  review: renderReviewPage,
  contact: renderContactPage
};

const PAGE_LABELS = {
  home: 'หน้าแรก',
  products: 'สินค้า',
  knowledge: 'ความรู้',
  review: 'รีวิว & คำถาม',
  contact: 'ติดต่อเรา'
};

let appConfigCache = null;

async function getAppConfig() {
  if (appConfigCache) return appConfigCache;
  try {
    appConfigCache = await API.getConfig();
  } catch (err) {
    // ถ้าโหลด config ไม่ได้ ให้เปิดทุกหน้าเป็นค่า default เพื่อไม่ให้เว็บใช้งานไม่ได้เลย
    appConfigCache = { page_home: 'Y', page_products: 'Y', page_knowledge: 'Y', page_review: 'Y', page_contact: 'Y', farm_name: 'ฟาร์มปลา', farm_tagline: '' };
  }
  return appConfigCache;
}

function isPageEnabled(config, page) {
  return config[`page_${page}`] !== 'N';
}

async function applyNavbarVisibility() {
  const config = await getAppConfig();

  // ซ่อนเมนูของหน้าที่ flag = N
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    const page = link.dataset.page;
    link.style.display = isPageEnabled(config, page) ? '' : 'none';
  });

  // ใส่ชื่อฟาร์มใน navbar / footer
  const farmName = config.farm_name || 'ฟาร์มปลา';
  document.getElementById('navFarmName').textContent = farmName;
  document.getElementById('footerFarmName').textContent = farmName;
  document.getElementById('footerTagline').textContent = config.farm_tagline || '';

  // social icons in footer
  const socials = [
    { href: config.farm_facebook, icon: '📘' },
    { href: config.farm_instagram, icon: '📷' },
    { href: config.farm_tiktok, icon: '🎵' },
    { href: config.farm_line ? `https://line.me/R/ti/p/${encodeURIComponent(config.farm_line)}` : '', icon: '💬' }
  ].filter(s => s.href);
  document.getElementById('footerSocials').innerHTML = socials
    .map(s => `<a href="${s.href}" target="_blank" rel="noopener" aria-label="social link">${s.icon}</a>`)
    .join('');
}

function setActiveNavLink(page) {
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

async function router() {
  const hash = window.location.hash.replace('#/', '') || 'home';
  const page = PAGE_RENDERERS[hash] ? hash : 'home';
  const app = document.getElementById('app');
  const config = await getAppConfig();

  if (!isPageEnabled(config, page)) {
    app.innerHTML = `
      <section class="section text-center">
        <div class="container">
          <div class="empty-state">
            <span class="empty-icon">🚧</span>
            <p>หน้า "${escapeHtml(PAGE_LABELS[page] || page)}" ยังไม่เปิดให้ใช้งานในขณะนี้</p>
            <a href="#/home" class="btn btn-primary mt-24" data-nav>กลับหน้าแรก</a>
          </div>
        </div>
      </section>
    `;
    setActiveNavLink(page);
    closeMobileMenu();
    window.scrollTo({ top: 0 });
    return;
  }

  app.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'page-fade-in';
  app.appendChild(wrapper);
  await PAGE_RENDERERS[page](wrapper);

  setActiveNavLink(page);
  closeMobileMenu();
  window.scrollTo({ top: 0 });
}

function closeMobileMenu() {
  document.getElementById('navbarMenu').classList.remove('open');
  document.getElementById('navbarToggle').classList.remove('open');
}

function initMobileMenu() {
  const toggle = document.getElementById('navbarToggle');
  const menu = document.getElementById('navbarMenu');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });
}

async function initApp() {
  initMobileMenu();
  await applyNavbarVisibility();
  window.addEventListener('hashchange', router);
  router();
}

document.addEventListener('DOMContentLoaded', initApp);
