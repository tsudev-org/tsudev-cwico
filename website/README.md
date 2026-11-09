# Website cwico.tsudev.com

Trang sản phẩm của cwico: [Astro](https://astro.build) dựng trang tĩnh, host trên Cloudflare Pages (dự án
`tsudev-cwico`, tên miền `cwico.tsudev.com`).

* **Một nguồn chân lý.** Số quy tắc, danh mục quy tắc và tinh chỉnh đọc từ `data/safety-db.json`, `data/tweaks.json`
  lúc build; trang Cơ chế an toàn là mục "Cơ chế an toàn" của `docs/README.vi.md`; Nhật ký và Bảo mật là
  `CHANGELOG.md`, `SECURITY.md`; ảnh lấy từ `docs/screenshots/`. Sửa nội dung ở đó, không sửa trong `website/`.
* Phiên bản, liên kết tải và SHA-256 lấy từ GitHub Releases lúc build (trường `digest` GitHub tự tính).
* JavaScript duy nhất là `public/js/loc.js`: ô tìm và nhóm lọc ở trang Quy tắc, Tinh chỉnh (tìm không dấu, tô sáng đúng
  trên chữ có dấu, theo `SEARCH_AND_FILTER.md`). Tắt JS thì danh mục vẫn hiện đầy đủ.
* Tài sản thương hiệu (`public/favicon*`, `android-chrome-*`, `og-image.png`, `brand/`) sinh bằng
  `scripts/brand_assets.py` từ dây chuyền của repo `tsudev-org/tsudev`; không sửa tay.
* Font Be Vietnam Pro tự host (SIL OFL 1.1); token màu sao nguyên văn từ `.standards/tokens/tokens.css`.
* Header bảo mật (HSTS, CSP `default-src 'none'`, `X-Frame-Options: DENY`...) ở `public/_headers`; `security.txt` ở
  `public/.well-known/`. `scripts/check-dist.mjs` chạy sau mỗi lần build: title, `og:site_name`, canonical, độ dài mô
  tả, chặn script/CSS nội tuyến, kiểm mọi liên kết nội bộ và neo `#`, đủ tài sản nhận diện bắt buộc.

```bash
cd website
npm ci
npm run dev          # xem thử ở http://localhost:4321
npm run build        # dựng vào dist/ và kiểm tra
npm run check:a11y   # axe-core WCAG 2.2 AA mọi trang, sáng + tối (lần đầu: npx playwright install chromium)
npm run deploy       # build rồi đưa lên Cloudflare Pages (cần `npx wrangler login` với tài khoản tsudev)
```

Sau mỗi lần phát hành bản mới hoặc sửa `data/*.json`, chạy lại `npm run deploy` để trang cập nhật.

Sinh lại tài sản thương hiệu (khi thương hiệu đổi):

```bash
python3 -m venv /tmp/v && /tmp/v/bin/pip install pillow
/tmp/v/bin/python website/scripts/brand_assets.py --tsudev ~/projects/tsudev --fonts <thư mục BeVietnamPro-*.ttf>
```
