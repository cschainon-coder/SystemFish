// generates simple branded SVG placeholder images into public/images/mock
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'images', 'mock');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const palette = {
  primary: '#0b3c5d',
  secondary: '#328cc1',
  green: '#2e8b57',
  bg: '#F5F7FA',
  white: '#ffffff'
};

function fishIcon(cx, cy, scale, color) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${color}" opacity="0.9">
    <path d="M -40 0 C -40 -22 -10 -35 25 -35 C 55 -35 80 -18 95 0 C 80 18 55 35 25 35 C -10 35 -40 22 -40 0 Z"/>
    <polygon points="95,0 120,-18 120,18"/>
    <circle cx="-15" cy="-6" r="5" fill="${palette.bg}"/>
    <path d="M -40 0 C -55 -10 -65 -5 -75 0 C -65 5 -55 10 -40 0 Z" opacity="0.7"/>
  </g>`;
}

function waveBg(seed) {
  const c1 = [palette.primary, palette.secondary, palette.green][seed % 3];
  const c2 = [palette.secondary, palette.green, palette.primary][seed % 3];
  return `<defs>
    <linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g${seed})"/>
  <path d="M0 250 Q 150 200 300 250 T 600 250 V400 H0 Z" fill="${palette.bg}" opacity="0.08"/>
  <path d="M0 300 Q 150 260 300 300 T 600 300 V400 H0 Z" fill="${palette.bg}" opacity="0.12"/>`;
}

function makeSvg({ w = 600, h = 400, seed = 0, icons = 1, label = '' }) {
  let iconsSvg = '';
  for (let i = 0; i < icons; i++) {
    const cx = (w / (icons + 1)) * (i + 1);
    const cy = h / 2 + (i % 2 === 0 ? -10 : 10);
    iconsSvg += fishIcon(cx, cy, 1.1 - i * 0.15, palette.white);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    ${waveBg(seed)}
    ${iconsSvg}
    ${label ? `<text x="${w/2}" y="${h-24}" text-anchor="middle" font-family="Sarabun, sans-serif" font-size="20" fill="${palette.white}" opacity="0.85">${label}</text>` : ''}
  </svg>`;
}

const images = [
  // home slides
  { name: 'slide-1.svg', icons: 3, seed: 0, label: 'บ่อเลี้ยงปลาช่อนธรรมชาติ' },
  { name: 'slide-2.svg', icons: 2, seed: 1, label: 'คัดลูกปลาคุณภาพทุกตัว' },
  { name: 'slide-3.svg', icons: 4, seed: 2, label: 'ฟาร์มได้มาตรฐาน สะอาด ปลอดภัย' },
  { name: 'slide-4.svg', icons: 1, seed: 0, label: 'ส่งตรงถึงมือลูกค้าทั่วไทย' },
  // about
  { name: 'about-farm.svg', icons: 5, seed: 1, label: 'สุขใจฟาร์ม' },
  // promotions
  { name: 'promo-1.svg', icons: 2, seed: 2, label: 'โปรลูกปลาช่อน 7 บาท/ตัว' },
  { name: 'promo-2.svg', icons: 1, seed: 0, label: 'อาหารปลาซื้อ 5 แถม 1' },
  { name: 'coming-1.svg', icons: 3, seed: 1, label: 'ปลาดุกบิ๊กอุย กำลังจะมา' },
  // products
  { name: 'product-fry-1.svg', icons: 6, seed: 0, label: 'ลูกปลาช่อนไซส์ 2-3 ซม.' },
  { name: 'product-fry-2.svg', icons: 6, seed: 1, label: 'ลูกปลาดุกไซส์ 3-4 ซม.' },
  { name: 'product-fry-3.svg', icons: 5, seed: 2, label: 'ลูกปลานิลแดงไซส์เล็ก' },
  { name: 'product-adult-1.svg', icons: 2, seed: 0, label: 'ปลาช่อนโตเต็มวัย' },
  { name: 'product-adult-2.svg', icons: 2, seed: 1, label: 'ปลาดุกบิ๊กอุยโตเต็มวัย' },
  { name: 'product-adult-3.svg', icons: 1, seed: 2, label: 'ปลานิลแดงโตเต็มวัย' },
  { name: 'product-food-1.svg', icons: 1, seed: 0, label: 'อาหารเม็ดลอยน้ำสูตรเร่งโต' },
  { name: 'product-food-2.svg', icons: 1, seed: 1, label: 'อาหารปลาดุกสูตรโปรตีนสูง' },
  { name: 'product-food-3.svg', icons: 1, seed: 2, label: 'อาหารลูกปลาสูตรผง' },
  { name: 'product-equip-1.svg', icons: 1, seed: 0, label: 'เครื่องให้อากาศบ่อปลา' },
  // knowledge
  { name: 'know-1.svg', icons: 2, seed: 0, label: 'เทคนิคเลี้ยงปลาช่อนให้โตไว' },
  { name: 'know-2.svg', icons: 2, seed: 1, label: 'ป้องกันโรคในบ่อปลา' },
  { name: 'know-3.svg', icons: 1, seed: 2, label: 'เลือกอาหารปลาให้เหมาะกับวัย' },
  { name: 'know-4.svg', icons: 3, seed: 0, label: 'การจัดการคุณภาพน้ำในบ่อ' },
  { name: 'know-5.svg', icons: 1, seed: 1, label: 'สูตรอาหารปลาทำเองประหยัดต้นทุน' },
  // gallery (contact page)
  { name: 'gallery-1.svg', icons: 3, seed: 0, label: '' },
  { name: 'gallery-2.svg', icons: 2, seed: 1, label: '' },
  { name: 'gallery-3.svg', icons: 4, seed: 2, label: '' },
  { name: 'gallery-4.svg', icons: 1, seed: 0, label: '' },
  { name: 'gallery-5.svg', icons: 2, seed: 1, label: '' },
  { name: 'gallery-6.svg', icons: 3, seed: 2, label: '' },
  { name: 'gallery-7.svg', icons: 1, seed: 0, label: '' },
  { name: 'gallery-8.svg', icons: 2, seed: 1, label: '' },
];

images.forEach(img => {
  const svg = makeSvg(img);
  fs.writeFileSync(path.join(outDir, img.name), svg, 'utf8');
});

console.log(`Generated ${images.length} placeholder images in ${outDir}`);
