// Nội dung trang lấy trực tiếp từ repo (một nguồn chân lý): data/*.json, docs/*.md, CHANGELOG.md.
// Không chép tay số liệu vào trang - số quy tắc, số tinh chỉnh, phiên bản đều đọc lúc build.
import { readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { Marked } from 'marked';

export const REPO = 'tsudev-org/tsudev-cwico';
export const REPO_URL = `https://github.com/${REPO}`;
export const SITE = 'https://cwico.tsudev.com';
export const SAN_PHAM = 'cwico';

// Gốc repo: build chạy trong website/ (npm run build), nên gốc là thư mục cha.
const GOC = normalize(join(process.cwd(), '..'));

export function docTep(duongDan: string): string {
  return readFileSync(join(GOC, duongDan), 'utf8').replace(/^﻿/, '');
}

// ---------------------------------------------------------------------------
// Cơ sở dữ liệu an toàn và danh mục tinh chỉnh
// ---------------------------------------------------------------------------

export type LopAnToan = 'safe' | 'caution' | 'critical';
type SongNgu = { en: string; vi: string };

export interface QuyTac {
  id: string;
  class: LopAnToan;
  label?: SongNgu;
  match: { exact?: string[]; contains?: string[]; regex?: string[]; kinds?: string[] };
  reason: SongNgu;
  description?: SongNgu;
  tags?: string[];
  processes?: string[];
  services?: string[];
  tasks?: string[];
  leftovers?: { paths?: string[]; registry?: string[] };
}

export interface TinhChinh {
  id: string;
  category: string;
  title: SongNgu;
  description: SongNgu;
  safety: 'safe' | 'caution';
  recommended?: boolean;
  requiresRestart?: boolean;
  tags?: string[];
  apply: { op: string; key?: string; name?: string; value?: string }[];
  revert: { op: string }[];
}

export const CSDL = JSON.parse(docTep('data/safety-db.json')) as {
  version: string;
  updated: string;
  rules: QuyTac[];
};
export const TINH_CHINH = JSON.parse(docTep('data/tweaks.json')) as { version: string; tweaks: TinhChinh[] };

export const TEN_LOP: Record<LopAnToan | 'unknown', { ten: string; y: string }> = {
  safe: { ten: 'An toàn', y: 'Không ảnh hưởng chức năng của Windows' },
  caution: { ten: 'Cẩn trọng', y: 'Gỡ được nhưng mất một tính năng phụ; phải xác nhận từng mục' },
  critical: { ten: 'Trọng yếu', y: 'Gỡ sẽ hỏng khởi động, đăng nhập, bảo mật hoặc shell; bị chặn cứng' },
  unknown: { ten: 'Chưa rõ', y: 'Không khớp quy tắc nào; không bao giờ được coi là An toàn' },
};

export const TEN_NHOM: Record<string, string> = {
  privacy: 'Quyền riêng tư',
  explorer: 'File Explorer',
  performance: 'Hiệu năng',
  developer: 'Nhà phát triển',
  gaming: 'Chơi game',
  interface: 'Giao diện',
  network: 'Mạng',
  cleanup: 'Dọn dẹp',
};

/**
 * Tên hiển thị của quy tắc. `label` là tùy chọn trong schema (cwico-core: Option<LocalizedText>);
 * không có thì lấy mẫu khớp đúng tên đầu tiên dạng chữ thường (không phải tên gói có dấu chấm), viết hoa chữ đầu.
 */
export function tenQuyTac(r: QuyTac): { vi: string; en: string } {
  if (r.label) return r.label;
  const mau = r.match.exact?.find((x) => !x.includes('.')) ?? r.match.exact?.[0] ?? r.id;
  const ten = mau.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return { vi: ten, en: ten };
}

export function demLop(): Record<LopAnToan, number> {
  const dem: Record<LopAnToan, number> = { safe: 0, caution: 0, critical: 0 };
  for (const r of CSDL.rules) dem[r.class] += 1;
  return dem;
}

/** Chuỗi tìm kiếm đã chuẩn hóa (NFC, chữ thường, bỏ dấu, đ -> d) - SEARCH_AND_FILTER.md mục 3. */
export function chuanHoa(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Markdown của repo -> HTML
// ---------------------------------------------------------------------------

/** Tệp của repo có trang riêng trên website. Tệp khác trỏ về GitHub. */
const TRANG_MD: Record<string, string> = {
  'CHANGELOG.md': '/nhat-ky/',
  'SECURITY.md': '/bao-mat/',
  'docs/README.vi.md': '/',
  'README.md': '/',
  'data/safety-db.json': '/co-so-du-lieu/',
  'data/tweaks.json': '/tinh-chinh/',
};

/** Slug kiểu GitHub: chữ thường, bỏ dấu câu, khoảng trắng -> "-" (giữ chữ có dấu tiếng Việt). */
export function slug(text: string): string {
  // Bỏ thẻ HTML lặp tới khi hết (một lượt có thể để lại thẻ ghép lồng như "<scr<b>ipt>")
  let s = text.toLowerCase().trim();
  for (let truoc = ''; truoc !== s; ) {
    truoc = s;
    s = s.replace(/<[^<>]*>/g, '');
  }
  return s.replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

function viTriLienKet(href: string, tepMd: string): string {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [duong, neo] = href.split('#', 2);
  const tuyetDoi = normalize(join(dirname(tepMd), decodeURI(duong))).replace(/\\/g, '/').replace(/\/$/, '');
  if (tuyetDoi.startsWith('docs/screenshots/')) return '/anh/' + tuyetDoi.slice('docs/screenshots/'.length);
  const trang = TRANG_MD[tuyetDoi];
  if (trang) return neo ? `${trang}#${neo}` : trang;
  const loai = /\.[A-Za-z0-9_-]+$/.test(tuyetDoi) ? 'blob' : 'tree';
  return `${REPO_URL}/${loai}/main/${encodeURI(tuyetDoi)}${neo ? '#' + neo : ''}`;
}

/** Liên kết ngoài = http(s) tới host khác trang này (so hostname, không so chuỗi đầu). */
export function laNgoai(href: string): boolean {
  if (!/^https?:/i.test(href)) return false;
  try {
    return new URL(href).hostname.toLowerCase() !== new URL(SITE).hostname;
  } catch {
    return true;
  }
}

/**
 * Markdown của repo -> HTML: sửa liên kết tương đối, id cho tiêu đề, rel cho liên kết ngoài.
 * Bỏ khối căn giữa đầu tệp (logo + wordmark của README trên GitHub) - website đã có đầu trang riêng.
 */
export function renderMd(md: string, tepMd: string): string {
  const sach = md.replace(/^<div align="center">[\s\S]*?<\/div>\s*/m, '').replace(/^#\s+.+\n/m, '');
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        return `<h${depth} id="${slug(text)}">${text}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const dich = viTriLienKet(href, tepMd);
        const ngoai = laNgoai(dich) ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${dich}"${title ? ` title="${title}"` : ''}${ngoai}>${text}</a>`;
      },
      image({ href, title, text }) {
        return `<img src="${viTriLienKet(href, tepMd)}" alt="${text}"${title ? ` title="${title}"` : ''} loading="lazy">`;
      },
      // HTML thô trong Markdown (thẻ <div>, <picture> của README GitHub) không đưa lên website.
      html() {
        return '';
      },
    },
  });
  return (marked.parse(sach, { async: false }) as string)
    .replace(/<table>/g, '<div class="bang" tabindex="0"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<pre>/g, '<pre tabindex="0">');
}

/** Một mục `## ...` của tệp Markdown (tới mục `##` kế tiếp), dùng để ghép nội dung README tiếng Việt. */
export function mucMd(tepMd: string, tieuDe: string): string {
  const md = docTep(tepMd);
  const dau = md.indexOf(`\n## ${tieuDe}\n`);
  if (dau < 0) throw new Error(`Không thấy mục "## ${tieuDe}" trong ${tepMd}`);
  const sau = md.indexOf('\n## ', dau + 4);
  return md.slice(dau + 1, sau < 0 ? undefined : sau).replace(/^## .+\n/, '').replace(/\n---\s*$/, '');
}

// ---------------------------------------------------------------------------
// Bản phát hành (GitHub Releases, đọc lúc build)
// ---------------------------------------------------------------------------

export interface GoiTai { loai: 'exe' | 'msi' | 'cli'; ten: string; url: string; sha256: string; kichThuoc: number }
export interface BanPhatHanh { tag: string; phienBan: string; ngay: string; url: string; goi: GoiTai[] }

let boNho: Promise<BanPhatHanh> | undefined;

/** Bản phát hành mới nhất. SHA-256 lấy từ trường `digest` mà GitHub tự tính cho mỗi tệp. */
export function banMoiNhat(): Promise<BanPhatHanh> {
  boNho ??= (async () => {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tsudev-cwico-website',
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const r = (await res.json()) as {
      tag_name: string;
      published_at: string;
      html_url: string;
      assets: { name: string; browser_download_url: string; size: number; digest?: string | null }[];
    };
    const goi = r.assets
      .filter((a) => /\.(exe|msi)$/.test(a.name))
      .map((a) => ({
        // Tệp CLI (`..._x64-cli.exe`, từ bản sau 26.8.1901) không phải bộ cài.
        loai: (a.name.endsWith('-cli.exe') ? 'cli' : a.name.endsWith('.exe') ? 'exe' : 'msi') as GoiTai['loai'],
        ten: a.name,
        url: a.browser_download_url,
        sha256: a.digest?.startsWith('sha256:') ? a.digest.slice(7) : '',
        kichThuoc: a.size,
      }))
      .sort((a, b) => ['exe', 'msi', 'cli'].indexOf(a.loai) - ['exe', 'msi', 'cli'].indexOf(b.loai));
    const [, y, m, d] = r.published_at.match(/^(\d{4})-(\d{2})-(\d{2})/) ?? [];
    return {
      tag: r.tag_name,
      phienBan: r.tag_name.replace(/^tsudev-cwico-v/, ''),
      ngay: `${d}/${m}/${y}`,
      url: r.html_url,
      goi,
    };
  })();
  return boNho;
}

export const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
