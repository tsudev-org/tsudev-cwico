// Kiểm tra bản build (chạy sau astro build, CI chặn khi lỗi):
// - mọi trang có title đúng khuôn, og:site_name = tsudev, canonical, description 120-160 ký tự (ECOSYSTEM_IDENTITY mục 2.2);
// - không có script/CSS nội tuyến (CSP chặn); script ngoài chỉ được là /js/loc.js; không có on*="...";
// - liên kết ra ngoài mở tab mới có rel="noopener noreferrer";
// - mọi liên kết nội bộ (kể cả #neo) trỏ tới trang và id có thật;
// - đủ bộ tài sản nhận diện bắt buộc (BRAND_ASSETS mục 12).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist');
const loi = [];
const trang = new Map(); // "/duong-dan/" -> Set(id)
const lienKet = [];      // [tep, href]

function duyet(thuMuc) {
  for (const e of readdirSync(thuMuc, { withFileTypes: true })) {
    const p = join(thuMuc, e.name);
    if (e.isDirectory()) duyet(p);
    else if (e.isFile() && e.name.endsWith('.html')) kiemTra(p, readFileSync(p, 'utf8'));
  }
}

function kiemTra(tep, html) {
  const ten = tep.slice(dist.length).replace(/\\/g, '/');
  const duong = ten.replace(/index\.html$/, '');
  trang.set(duong, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  if (!/^(.+ - )?cwico \| tsudev$/.test(title)) loi.push(`${ten}: title sai khuôn: ${title}`);
  if (!html.includes('<meta property="og:site_name" content="tsudev">')) loi.push(`${ten}: thiếu og:site_name tsudev`);
  if (!/<link rel="canonical" href="https:\/\/cwico\.tsudev\.com\//.test(html)) loi.push(`${ten}: thiếu canonical`);
  const mota = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const dai = [...mota.replace(/&[a-z#0-9]+;/g, 'x')].length;
  if (dai < 120 || dai > 160) loi.push(`${ten}: description ${dai} ký tự (cần 120-160)`);

  for (const s of html.matchAll(/<script\b([^>]*)>/g)) {
    const attr = s[1];
    if (attr.includes('type="application/ld+json"')) continue;
    if (!/\ssrc="\/js\/loc\.js"/.test(attr)) loi.push(`${ten}: script không được phép: <script${attr}>`);
  }
  if (/<style[\s>]/.test(html) || / style="/.test(html)) loi.push(`${ten}: có CSS nội tuyến (CSP chặn)`);
  if (/\son[a-z]+="/i.test(html)) loi.push(`${ten}: có trình xử lý sự kiện nội tuyến`);
  for (const a of html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) {
    if (!a[0].includes('rel="noopener noreferrer"')) loi.push(`${ten}: thiếu rel noopener noreferrer: ${a[0]}`);
  }
  for (const a of html.matchAll(/<a [^>]*href="([^"]+)"/g)) lienKet.push([ten, duong, a[1]]);
}

duyet(dist);

for (const [ten, duong, href] of lienKet) {
  if (/^(https?:|mailto:)/.test(href)) continue;
  const [p, neo] = href.split('#', 2);
  const dich = p === '' ? duong : p;
  if (!dich.startsWith('/')) { loi.push(`${ten}: liên kết tương đối: ${href}`); continue; }
  if (trang.has(dich)) {
    if (neo && !trang.get(dich).has(decodeURIComponent(neo))) loi.push(`${ten}: neo không tồn tại: ${href}`);
  } else if (!existsSync(join(dist, decodeURIComponent(dich)))) {
    loi.push(`${ten}: liên kết hỏng: ${href}`);
  }
}

for (const f of ['favicon.ico', 'favicon-96x96.png', 'apple-touch-icon.png', 'og-image.png',
  'android-chrome-192x192.png', 'android-chrome-512x512.png', 'android-chrome-maskable-192x192.png',
  'android-chrome-maskable-512x512.png', 'manifest.webmanifest', 'brand/logo-mark.png', '.well-known/security.txt']) {
  if (!existsSync(join(dist, f))) loi.push(`thiếu tài sản bắt buộc: ${f} (BRAND_ASSETS mục 12)`);
}

for (const l of loi) console.error('[check-dist] LỖI', l);
console.log(`[check-dist] ${trang.size} trang, ${lienKet.length} liên kết, ${loi.length} lỗi`);
process.exit(loi.length ? 1 : 0);
