/* contact.js -- หน้าติดต่อเรา */

async function renderContactPage(container) {
  container.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <h1>ติดต่อเรา</h1>
        <p>สอบถามหรือสั่งซื้อสินค้าผ่านช่องทางด้านล่างได้เลย</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="contact-grid">
          <div id="contactInfoWrap">
            <div class="skeleton" style="height:380px;border-radius:22px;"></div>
          </div>
          <div>
            <div class="section-header">
              <span class="eyebrow">ผลงานของเรา</span>
              <h2 class="section-title">บรรยากาศฟาร์ม</h2>
            </div>
            <div id="galleryWrap">
              <div class="skeleton" style="height:220px;border-radius:22px;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  loadContactInfo();
  loadGallery();
}

async function loadContactInfo() {
  const wrap = document.getElementById('contactInfoWrap');
  try {
    const config = await API.getConfig();
    const channels = [
      { key: 'farm_facebook', label: 'Facebook', icon: '📘', href: config.farm_facebook },
      { key: 'farm_instagram', label: 'Instagram', icon: '📷', href: config.farm_instagram },
      { key: 'farm_tiktok', label: 'TikTok', icon: '🎵', href: config.farm_tiktok },
      { key: 'farm_line', label: 'Line', icon: '💬', href: config.farm_line ? `https://line.me/R/ti/p/${encodeURIComponent(config.farm_line)}` : '', display: config.farm_line },
      { key: 'farm_phone', label: 'โทรศัพท์', icon: '📞', href: config.farm_phone ? `tel:${config.farm_phone.replace(/-/g, '')}` : '', display: config.farm_phone }
    ].filter(c => c.href);

    wrap.innerHTML = `
      <div class="contact-info-card">
        <span class="eyebrow">ช่องทางติดต่อ</span>
        <h2 class="section-title">${escapeHtml(config.farm_name)}</h2>
        <p style="color:var(--color-text-muted);">${escapeHtml(config.farm_tagline || '')}</p>
        <div class="contact-channels">
          ${channels.map(c => `
            <a class="contact-channel" href="${escapeHtml(c.href)}" target="_blank" rel="noopener">
              <span class="ch-icon">${c.icon}</span>
              <span>
                <span class="ch-label">${c.label}</span><br>
                <span class="ch-value">${escapeHtml(c.display || c.href)}</span>
              </span>
            </a>
          `).join('')}
        </div>
        ${config.farm_address ? `
          <div class="contact-address">
            📍 ${escapeHtml(config.farm_address)}
          </div>
        ` : ''}
      </div>
    `;
  } catch (err) {
    wrap.innerHTML = errorStateHtml('ไม่สามารถโหลดข้อมูลติดต่อได้', 'loadContactInfo');
  }
}

async function loadGallery() {
  const wrap = document.getElementById('galleryWrap');
  try {
    const gallery = await API.getGallery();
    if (!gallery.length) {
      wrap.innerHTML = emptyStateHtml('ยังไม่มีรูปผลงาน', '🖼️');
      return;
    }
    // duplicate list for seamless infinite scroll loop
    const items = [...gallery, ...gallery];
    wrap.innerHTML = `
      <div class="gallery-carousel-wrap">
        <div class="gallery-track">
          ${items.map(g => `
            <div class="gallery-item">
              <img src="${escapeHtml(g.image_url)}" alt="${escapeHtml(g.caption || '')}" loading="lazy">
              ${g.caption ? `<div class="gallery-caption">${escapeHtml(g.caption)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    wrap.innerHTML = errorStateHtml('ไม่สามารถโหลดรูปผลงานได้', 'loadGallery');
  }
}
