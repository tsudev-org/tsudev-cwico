// Kiểm tra khả năng truy cập (ACCESSIBILITY.md của tsudev) bằng axe-core: mọi trang trong dist/,
// mọi chế độ giao diện (Theo hệ thống ở hệ điều hành sáng và tối, Sáng, Ấm, Tối - khóa tsudev-theme của /js/theme.js)
// và một lượt giả lập tắt JavaScript (chặn /js/theme.js - tắt JS thật thì axe không chạy được); quy tắc WCAG 2.0/2.1/2.2 mức A và AA. Mỗi lượt có JS còn kiểm data-theme đúng chế độ
// và không có lỗi console (vd. CSP chặn script).
// Chạy sau `npm run build`: `npm run check:a11y` (CI: website.yml). Cần Chromium của Playwright:
// `npx playwright install --with-deps chromium`.
import { createServer } from 'node:http';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

function pages(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...pages(p));
    else if (e.isFile() && e.name.endsWith('.html')) out.push('/' + relative(dist, p).split(sep).join('/').replace(/(^|\/)index\.html$/, '$1'));
  }
  return out.sort();
}

// Máy chủ tĩnh tối thiểu cho dist/ (chỉ 127.0.0.1, chặn vượt thư mục)
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(dist, path));
  // Đọc thẳng rồi bắt lỗi (không kiểm tồn tại trước: tránh TOCTOU); chặn vượt ra ngoài dist/
  let body = null;
  if (file.startsWith(dist + sep)) {
    try { body = readFileSync(file); } catch { body = null; }   // không có, hoặc là thư mục (EISDIR)
  }
  if (body === null) {
    res.writeHead(404, { 'content-type': MIME['.html'] });
    res.end(readFileSync(join(dist, '404.html')));
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
let total = 0;
const list = pages(dist);
const CHE_DO = [
  { ten: 'system/light', scheme: 'light', luu: null, mongDoi: 'light' },
  { ten: 'system/dark', scheme: 'dark', luu: null, mongDoi: 'dark' },
  { ten: 'light', scheme: 'dark', luu: 'light', mongDoi: 'light' },
  { ten: 'warm', scheme: 'light', luu: 'warm', mongDoi: 'warm' },
  { ten: 'dark', scheme: 'light', luu: 'dark', mongDoi: 'dark' },
  { ten: 'khong-js/dark', scheme: 'dark', luu: null, mongDoi: 'light', tatJs: true },
];
for (const { ten: scheme, scheme: colorScheme, luu, mongDoi, tatJs } of CHE_DO) {
  const context = await browser.newContext({ colorScheme });
  if (tatJs) await context.route('**/js/theme.js', (r) => r.abort());
  if (luu) await context.addInitScript((v) => { try { localStorage.setItem('tsudev-theme', v); } catch { /* */ } }, luu);
  for (const path of list) {
    const page = await context.newPage();
    const loiConsole = [];
    page.on('console', (m) => { if (m.type() === 'error') loiConsole.push(m.text()); });
    page.on('pageerror', (e) => loiConsole.push(String(e)));
    await page.goto(base + path, { waitUntil: 'load' });
    {
      const thucTe = await page.evaluate(() => document.documentElement.dataset.theme);
      if (thucTe !== mongDoi) { total++; console.error(`[a11y] LỖI ${scheme} ${path}: data-theme=${thucTe}, cần ${mongDoi}`); }
      for (const l of loiConsole.filter((x) => !(tatJs && /theme\.js|ERR_FAILED/.test(x)))) { total++; console.error(`[a11y] LỖI ${scheme} ${path}: console: ${l}`); }
    }
    process.stdout.write('.');
    const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
    for (const v of violations) {
      total++;
      console.error(`[a11y] LỖI ${scheme} ${path}: ${v.id} (${v.impact}) - ${v.help}`);
      for (const n of v.nodes.slice(0, 5)) console.error(`         ${n.target.join(' ')}: ${n.failureSummary?.split('\n').slice(1).join(' ').trim()}`);
    }
    await page.close();
  }
  await context.close();
}
await browser.close();
server.close();
console.log(`[a11y] ${list.length} trang x ${CHE_DO.length} chế độ màu, ${total} lỗi`);
process.exit(total ? 1 : 0);
