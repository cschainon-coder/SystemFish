/* review.js -- หน้ารีวิวและคำถาม */

let selectedStars = 5;
let allFaqCache = [];
let reviewsShownCount = 5;

async function renderReviewPage(container) {
  container.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <h1>รีวิว &amp; คำถามที่พบบ่อย</h1>
        <p>เสียงจากลูกค้าจริง และคำตอบสำหรับคำถามยอดฮิต</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="review-layout">
          <!-- LEFT: Write review + FAQ ask -->
          <div>
            <div class="review-form-card">
              <h3>เขียนรีวิวให้เรา</h3>
              <form id="reviewForm">
                <div class="form-group">
                  <label>ให้คะแนน</label>
                  <div class="star-picker" id="starPicker">
                    ${[1,2,3,4,5].map(i => `<button type="button" data-star="${i}">★</button>`).join('')}
                  </div>
                </div>
                <div class="form-group">
                  <label for="reviewerName">ชื่อผู้รีวิว</label>
                  <input type="text" id="reviewerName" placeholder="เช่น คุณสมชาย" required>
                </div>
                <div class="form-group">
                  <label for="reviewText">คำรีวิว</label>
                  <textarea id="reviewText" placeholder="บอกเล่าประสบการณ์ของคุณ..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block" id="reviewSubmitBtn">บันทึกรีวิว</button>
              </form>
            </div>

            <div class="faq-card mt-24">
              <div class="faq-ask-box" style="margin-top:0;padding-top:0;border-top:none;">
                <h4>มีคำถาม? ส่งมาได้เลย</h4>
                <form id="faqForm">
                  <div class="form-group">
                    <label for="faqName">ชื่อ (ไม่บังคับ)</label>
                    <input type="text" id="faqName" placeholder="ชื่อของคุณ">
                  </div>
                  <div class="form-group">
                    <label for="faqQuestion">คำถาม</label>
                    <textarea id="faqQuestion" placeholder="พิมพ์คำถามของคุณที่นี่..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-secondary btn-block">ส่งคำถาม</button>
                </form>
              </div>
            </div>
          </div>

          <!-- RIGHT: Review list + FAQ list -->
          <div>
            <div id="reviewSummaryWrap"></div>
            <div id="reviewListWrap">${skeletonCards(3, 'skeleton-card')}</div>

            <div class="faq-card mt-24">
              <h3>คำถามที่พบบ่อย</h3>
              <div class="faq-search">
                <input type="text" id="faqSearchInput" placeholder="ค้นหาคำถาม...">
              </div>
              <div id="faqListWrap">${skeletonCards(3)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  initStarPicker();
  initReviewForm();
  initFaqForm();
  loadReviews();
  loadFaq();
}

function initStarPicker() {
  const picker = document.getElementById('starPicker');
  updateStarPicker();
  picker.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedStars = parseInt(btn.dataset.star, 10);
      updateStarPicker();
    });
  });
}
function updateStarPicker() {
  document.querySelectorAll('#starPicker button').forEach(btn => {
    btn.classList.toggle('filled', parseInt(btn.dataset.star, 10) <= selectedStars);
  });
}

function initReviewForm() {
  const form = document.getElementById('reviewForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reviewerName').value.trim();
    const text = document.getElementById('reviewText').value.trim();
    if (!name || !text) {
      showToast('กรุณากรอกข้อมูลให้ครบทั้งชื่อและคำรีวิว', 'error');
      return;
    }
    const btn = document.getElementById('reviewSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'กำลังบันทึก...';
    try {
      const res = await API.postReview({ reviewer_name: name, stars: selectedStars, review_text: text });
      showToast(res.message || 'ขอบคุณสำหรับรีวิว', 'success');
      form.reset();
      selectedStars = 5;
      updateStarPicker();
    } catch (err) {
      showToast(err.message || 'ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'บันทึกรีวิว';
    }
  });
}

function initFaqForm() {
  const form = document.getElementById('faqForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('faqName').value.trim();
    const question = document.getElementById('faqQuestion').value.trim();
    if (!question) {
      showToast('กรุณากรอกคำถามของคุณ', 'error');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await API.postFaq({ question, submitted_by: name });
      showToast(res.message || 'ได้รับคำถามของคุณแล้ว', 'success');
      form.reset();
    } catch (err) {
      showToast(err.message || 'ส่งคำถามไม่สำเร็จ กรุณาลองใหม่', 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

async function loadReviews() {
  const summaryWrap = document.getElementById('reviewSummaryWrap');
  const listWrap = document.getElementById('reviewListWrap');
  try {
    const reviews = await API.getReviews();
    if (!reviews.length) {
      summaryWrap.innerHTML = '';
      listWrap.innerHTML = emptyStateHtml('ยังไม่มีรีวิว เป็นคนแรกที่รีวิวเลยสิ!', '⭐');
      return;
    }
    const avg = (reviews.reduce((s, r) => s + Number(r.stars), 0) / reviews.length).toFixed(1);
    summaryWrap.innerHTML = `
      <div class="review-summary">
        <div class="score">${avg}</div>
        <div>
          <div class="stars">${renderStars(Math.round(avg))}</div>
          <div class="count">จาก ${reviews.length} รีวิว</div>
        </div>
      </div>
    `;
    renderReviewList(reviews);
  } catch (err) {
    summaryWrap.innerHTML = '';
    listWrap.innerHTML = errorStateHtml('ไม่สามารถโหลดรีวิวได้', 'loadReviews');
  }
}

function renderReviewList(reviews) {
  const listWrap = document.getElementById('reviewListWrap');
  const visible = reviews.slice(0, reviewsShownCount);
  listWrap.innerHTML = `
    ${visible.map(r => `
      <div class="review-list-item">
        <div class="review-list-head">
          <span class="review-list-name">${escapeHtml(r.reviewer_name)}</span>
          <span class="review-list-stars">${renderStars(r.stars)}</span>
        </div>
        <div class="review-list-date">${formatThaiDate(r.timestamp)}</div>
        <p class="review-list-text mt-24" style="margin-top:6px;">${escapeHtml(r.review_text)}</p>
      </div>
    `).join('')}
    ${reviews.length > visible.length ? `
      <div class="load-more-wrap">
        <button class="btn btn-outline" id="loadMoreReviews">โหลดเพิ่มเติม</button>
      </div>
    ` : ''}
  `;
  const moreBtn = document.getElementById('loadMoreReviews');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      reviewsShownCount += 5;
      renderReviewList(reviews);
    });
  }
}

async function loadFaq() {
  const listWrap = document.getElementById('faqListWrap');
  try {
    allFaqCache = await API.getFaq();
    renderFaqList(allFaqCache);
    document.getElementById('faqSearchInput').addEventListener('input', (e) => {
      const term = e.target.value.trim().toLowerCase();
      const filtered = term
        ? allFaqCache.filter(f => f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term))
        : allFaqCache;
      renderFaqList(filtered);
    });
  } catch (err) {
    listWrap.innerHTML = errorStateHtml('ไม่สามารถโหลดคำถามที่พบบ่อยได้', 'loadFaq');
  }
}

function renderFaqList(faqs) {
  const listWrap = document.getElementById('faqListWrap');
  if (!faqs.length) {
    listWrap.innerHTML = emptyStateHtml('ยังไม่มีคำถามที่ตอบแล้วในขณะนี้', '❓');
    return;
  }
  listWrap.innerHTML = faqs.map((f, i) => `
    <div class="faq-item" data-index="${i}">
      <button class="faq-question">
        <span>${escapeHtml(f.question)}</span>
        <span class="icon">+</span>
      </button>
      <div class="faq-answer">
        <p>${escapeHtml(f.answer)}</p>
      </div>
    </div>
  `).join('');

  listWrap.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      listWrap.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}
