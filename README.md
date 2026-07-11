# สุขใจฟาร์ม — เว็บไซต์ (Mock Data Version)

เวอร์ชันนี้ใช้ "ข้อมูลจำลอง" (Mock Data) เก็บในไฟล์ JSON ที่โฟลเดอร์ `/data`
แทนการดึงจาก Google Sheets จริง เพื่อให้รันทดสอบและตรวจสอบ UI/UX ได้ทันทีโดยไม่ต้องตั้งค่า Google API ก่อน

---

## วิธีรัน (ครั้งแรก)

```bash
npm install
npm start
```

จากนั้นเปิดเบราว์เซอร์ไปที่ **http://localhost:3000**

ทุกครั้งที่รันใหม่ ใช้คำสั่ง `npm start` อย่างเดียวพอ (ไม่ต้อง npm install ซ้ำ เว้นแต่ลบ node_modules)

---

## โครงสร้างโปรเจกต์

```
fish-farm-website/
├── server.js              <- จุดเริ่มต้น backend
├── data-source.js         <- ตัวเลือกแหล่งข้อมูล (mock / sheets)
├── routes/api.js          <- API endpoints ทั้งหมด
├── data/                  <- ไฟล์ mock data (.json) ตามโครงสร้าง Google Sheets ที่วางแผนไว้
├── scripts/gen-placeholders.js <- สคริปต์สร้างรูปภาพ SVG จำลอง (รันแล้วครั้งหนึ่ง)
└── public/                <- Frontend (HTML/CSS/JS)
    ├── index.html
    ├── css/style.css
    ├── js/                <- แยกไฟล์ตามหน้า (home.js, products.js, ...)
    └── images/mock/        <- รูปภาพจำลอง (SVG)
```

---

## หน้าทั้งหมดที่ทำไว้

1. **หน้าแรก** — Hero slider, แนะนำฟาร์ม, โปรโมชั่น/สินค้าใหม่
2. **สินค้า** — กรองหมวดหมู่, ค้นหา, การ์ดสินค้า responsive (4/2/1 คอลัมน์), Modal รายละเอียด + รีวิวสินค้า
3. **ความรู้** — บทความแยกหมวด, การ์ด + Modal อ่านเต็ม
4. **รีวิว & FAQ** — ฟอร์มให้ดาว 1-5 (เริ่มที่ 5), รายการรีวิว, FAQ accordion + ค้นหา, ฟอร์มส่งคำถามใหม่
5. **ติดต่อเรา** — ช่องทางติดต่อ (FB/IG/TikTok/Line/โทร), Gallery เลื่อนวนอัตโนมัติ

ทุกหน้าควบคุมการเปิด/ปิดผ่าน flag ใน `data/config.json` (`page_home`, `page_products` ฯลฯ = `"Y"`/`"N"`)
ลองเปลี่ยนเป็น `"N"` แล้ว refresh เพื่อดูผลว่าเมนูและหน้านั้นจะถูกซ่อน

---

## แก้ไขข้อมูลทดสอบ

แก้ไขไฟล์ใน `/data/*.json` ได้โดยตรงตามใจชอบ (เพิ่มสินค้า, เปลี่ยนชื่อฟาร์ม, เพิ่มบทความ ฯลฯ)
แล้ว **restart server** (`Ctrl+C` แล้ว `npm start` ใหม่) เพื่อให้อ่านค่าล่าสุด

> หมายเหตุ: รีวิว/คำถามใหม่ที่ส่งผ่านฟอร์มจะถูกเก็บไว้ใน memory ของ server เท่านั้น (ไม่เขียนกลับไฟล์ json)
> ถ้า restart server ข้อมูลที่เพิ่งส่งจะหายไป — เป็นพฤติกรรมที่ตั้งใจไว้สำหรับโหมดทดสอบ

---

## ขั้นตอนต่อไป: เปลี่ยนเป็น Google Sheets จริง

เมื่อตรวจสอบ UI ผ่านแล้ว ทำตามนี้เพื่อเชื่อมข้อมูลจริง:

1. สร้าง Google Sheet ตามโครงสร้าง 8 sheet ในเอกสาร `fish_farm_website_design.txt` (sheet ชื่อ: config, home_slides, promotions, products, knowledge, reviews, faq, gallery)
2. สร้าง Google Cloud Project → เปิด **Google Sheets API**
3. สร้าง **Service Account** → ดาวน์โหลดไฟล์ JSON key → วางไว้ที่ root โปรเจกต์ชื่อ `credentials.json`
4. แชร์ Google Sheet ให้กับอีเมลของ Service Account (สิทธิ์ Editor)
5. แก้ไขไฟล์ `.env`:
   ```
   DATA_SOURCE=sheets
   GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
   SPREADSHEET_ID=<ใส่ Spreadsheet ID จาก URL ของ Sheet>
   ```
6. ติดตั้งไลบรารีเพิ่ม: `npm install googleapis`
7. เติม logic การอ่าน/เขียนจริงในฟังก์ชัน `loadSheetsXxx()` / `saveSheetsXxx()` ที่ `data-source.js` (มีโครงไว้ให้แล้ว พร้อม TODO comment)
8. Restart server — **ไม่ต้องแก้โค้ด frontend เลย** เพราะ API endpoint หน้าตาเหมือนเดิมทุกอย่าง

---

## หมายเหตุสถานะปัจจุบัน

- เว็บนี้ยังไม่มีระบบขายของจริง (ไม่มีตะกร้า/ชำระเงิน) ตามที่ตั้งใจไว้ในสเปค
- ลูกค้ากดปุ่ม "ติดต่อสั่งซื้อ" จะลิงก์ไปที่ Line ของฟาร์ม
- รองรับ Desktop / iPad / มือถือ ตาม breakpoint: ≥1024px / 768-1023px / <768px
