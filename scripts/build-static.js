/**
 * build-static.js
 * ----------------------------------------------------------------
 * สร้างเว็บเวอร์ชัน "static" ลงโฟลเดอร์ /dist สำหรับ deploy ขึ้น GitHub Pages
 * (GitHub Pages รัน Node/Express ไม่ได้ เสิร์ฟได้แต่ไฟล์นิ่ง)
 *
 * สิ่งที่ทำ:
 *   1. copy ทุกอย่างใน /public -> /dist
 *   2. เรียกฟังก์ชันชุดเดียวกับที่ Express ใช้ (จาก data-source.js) แล้วเซฟผลเป็นไฟล์ JSON ใน /dist/api/
 *      -> การกรอง is_active / การเรียง sort_order จึงเหมือนตอนรันเซิร์ฟเวอร์ทุกประการ
 *   3. ฝัง window.STATIC_DATA = true ลงใน index.html เพื่อให้ api.js สลับไปโหมด static
 *
 * รันด้วย: npm run build
 * ----------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const ds = require('../data-source');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_API_DIR = path.join(DIST_DIR, 'api');

// ชื่อไฟล์ที่จะสร้าง -> ฟังก์ชันที่ให้ข้อมูล (ชื่อไฟล์ต้องตรงกับที่ api.js เรียกใน loadStaticFile)
const ENDPOINTS = {
  'config': ds.getConfig,
  'home-slides': ds.getHomeSlides,
  'promotions': ds.getPromotions,
  'products': ds.getProducts,
  'knowledge': ds.getKnowledge,
  'reviews': ds.getReviews,
  'faq': ds.getFaq,
  'gallery': ds.getGallery
};

async function build() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true });
  fs.mkdirSync(DIST_API_DIR, { recursive: true });

  for (const [name, loader] of Object.entries(ENDPOINTS)) {
    const data = await loader();
    fs.writeFileSync(path.join(DIST_API_DIR, `${name}.json`), JSON.stringify(data), 'utf8');
    const count = Array.isArray(data) ? `${data.length} รายการ` : 'object';
    console.log(`  api/${name}.json  (${count})`);
  }

  // สลับ api.js ไปโหมด static -- ต้องแทรกก่อน <script src="js/api.js">
  const indexPath = path.join(DIST_DIR, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const marker = '<script src="js/api.js"></script>';
  if (!html.includes(marker)) {
    throw new Error(`หา ${marker} ใน index.html ไม่เจอ -- ถ้าย้าย/แก้ script tag นี้ ต้องแก้ build-static.js ด้วย`);
  }
  fs.writeFileSync(
    indexPath,
    html.replace(marker, `<script>window.STATIC_DATA = true;</script>\n  ${marker}`),
    'utf8'
  );

  // GitHub Pages ใช้ Jekyll เป็น default ซึ่งจะข้ามไฟล์/โฟลเดอร์ที่ขึ้นต้นด้วย _ -- ปิดมันซะ
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf8');

  console.log('\nbuild เสร็จแล้ว -> /dist (เปิดทดสอบ: npx serve dist)');
}

build().catch(err => {
  console.error('build ล้มเหลว:', err.message);
  process.exit(1);
});
