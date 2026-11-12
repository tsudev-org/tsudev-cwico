# PHIẾU YÊU CẦU - Logo riêng `cwico`: thay icon / logo / favicon, chuyển sang định dạng hiện đại

- **Mã phiếu**: 20261113-01
- **Từ**: phiên `tsudev-06` (repo `tsudev`, phiên 49) - **Đến**: phiên kế tiếp của repo `tsudev-cwico`
- **Thời điểm**: 13/11/2026
- **Ủy quyền**: chủ dự án yêu cầu trong chat 13/11/2026 (giao logo `logo-cwico.png` cho sản phẩm này)
- **Trạng thái**: ĐÓNG (13/11/2026) - phiên tsudev-06 làm hộ theo ủy quyền của chủ dự án (repo không có phiên nào mở)

## 0. Bối cảnh

- Chủ dự án giao logo riêng cho `cwico`. Ảnh gốc (đã chuyển vào repo `tsudev`, KHÔNG sửa ở đó):
  `~/projects/tsudev/packages/brand/source/eco/cwico.png` - 1408x768 RGBA nhưng NỀN TRẮNG đặc, sha256 `f08b4fdc21159eae1abca0dccbb16b12842db417ee6d1e2399b6c5db22fe7d63`.
  Đặc điểm: khiên viền xanh navy + mũi tên chuyển sắc xanh ngọc, nằm nhỏ giữa khung ngang (khoảng 1/4 chiều rộng).
- Hiện sản phẩm dùng CHUNG con cú thương hiệu tsudev làm favicon / icon, nên trên danh bạ `tsudev.com/apps` và trong
  thanh tác vụ không phân biệt được với app khác.
- tsudev.com đã dùng logo này cho thẻ của sản phẩm ở `/apps` (WebP 128px, `public/eco/cwico.webp`, sinh bằng
  `packages/brand/build-eco-icons.js`, chế độ `no-white`). Khi website của sản phẩm đã phục vụ logo mới, báo phiên `tsudev`
  đổi dòng `cwico` trong `SOURCES` của script đó sang URL website (nguồn sự thật chuyển về repo này).
- Mẫu tham chiếu đã chạy thật: `tsudev-org/tsudev-trafficmonitor` - `assets/brand/brand.json` (cấu hình) +
  `tools/brand/build_brand.py` (một lệnh sinh mọi bản, có `--check`). Đề xuất quy ước cho logo riêng từng sản phẩm:
  `~/projects/tsudev-standards/tsudev-standards/logs/handover/20261112-01_de-xuat-logo-rieng-tung-san-pham.md`.

## 1. Việc cần làm

1. **Đặt ảnh gốc đúng chỗ, một nguồn duy nhất**: chép ảnh gốc vào `assets/brand/source/logo-cwico.png` (giữ nguyên
   byte, ghi sha256 vào `assets/brand/README.md`). Mọi bản khác SINH từ đây bằng script - không cắt tay từng cỡ.
   Đổi logo sau này = thay một tệp + chạy một lệnh.
2. **Dây chuyền sinh tài nguyên** (`tools/brand/` + `assets/brand/brand.json`, theo mẫu trafficmonitor), có chế độ
   `--check` chạy trong CI để bắt artifact lệch nguồn.
3. **Xử lý nền**: nguồn có nền TRẮNG đặc. XOÁ nền bằng flood fill từ mép ảnh (chỉ vùng trắng NỐI LIỀN mép - lòng khiên khép kín giữ nguyên), làm mềm biên theo độ lệch khỏi trắng và khử nhân với trắng (không quầng xám trên nền tối), rồi CẮT SÁT và đặt vào khung vuông. Ảnh gốc chỉ khoảng 350px phần logo - nếu bản lớn nhất bị mờ, xin chủ dự án ảnh gốc độ phân giải cao hơn hoặc dựng lại SVG (khiên + mũi tên là hình học đơn giản, vector hoá tay khả thi). Cài sẵn trong tsudev.com: `noWhite()` ở `packages/brand/build-eco-icons.js` (ngưỡng inner=12 / outer=40).
4. **Định dạng hiện đại, sắc nét mọi thiết bị**:
   - Web: `<picture>` AVIF → WebP → PNG (PNG chỉ là đường lui), mỗi cỡ hiển thị có bản 1x/2x/3x qua `srcset`;
     `favicon.ico` nhiều lớp THẬT 16/24/32/48/64/128/256 (không PNG đổi đuôi); `favicon-{16,32,96}.png`;
     `apple-touch-icon.png` 180 nền ĐẶC; `android-chrome-{192,512}` + bản `maskable` riêng (vùng an toàn 80%);
     `site.webmanifest` khai tách `any` / `maskable`; `og-image.png` 1200x630.
   - Thử vector hoá (SVG) cho dấu hiệu nếu ra được bản sạch nét: đo dung lượng và soát bằng mắt ở 16/32/48 px trước
     khi dùng - bản vector tự động xấu thì giữ raster đa cỡ.
   - Ứng dụng Tauri (`app/src-tauri/icons/`): sinh lại toàn bộ bằng `tauri icon <ảnh 1024 vuông nền trong suốt>` (ra `icon.ico`, `icon.icns`, PNG Store/Square*); `ui/public/brand/` (logo trong giao diện app) dùng WebP/AVIF như website. Bộ cài MSI/NSIS: icon + ảnh banner theo logo mới.
5. **Dọn**: gỡ các tệp logo/favicon cũ (con cú dùng chung) không còn ai dùng; quét repo tìm mọi chỗ tham chiếu để
   không còn ảnh vỡ (`grep -rn "tsudev-logo\|logo-mark"`).
6. **Ghi lệch chuẩn** ở `AGENTS.md` mục B.4 (logo sản phẩm riêng khác `BRAND_ASSETS.md` mục 2 hiện hành) cho tới khi
   đề xuất quy ước được nhận.
7. **Phát hành + deploy website**, rồi báo phiên `tsudev` (ListAgents → SendMessage, hoặc phiếu vào
   `~/projects/tsudev/logs/handover/`) URL logo mới trên website để đổi nguồn của `/apps`.

## 2. Tiêu chí hoàn thành

- [ ] `assets/brand/source/logo-cwico.png` là nguồn duy nhất; script + `--check` trong CI.
- [ ] Favicon tab trình duyệt, icon ứng dụng (exe, bộ cài MSI/NSIS, lối tắt Start) đều là logo mới, sắc nét ở 16/32/48 px và màn 2x/3x.
- [ ] Website phục vụ AVIF/WebP qua `<picture>`; cổng kiểm tài sản nhận diện (mục 12.2 BRAND_ASSETS) đạt.
- [ ] Soát bằng mắt trên nền Sáng VÀ Tối, Windows / Android / iOS / macOS (ảnh chụp kèm nhật ký phiên).
- [ ] Đã báo phiên `tsudev` URL logo trên website.

## 3. Cảnh báo

- KHÔNG sửa `.standards/` (chỉ-đọc) và KHÔNG sửa repo `tsudev` từ phiên này - mọi thay đổi bên đó qua phiếu.
- Tên repo cũ dưới `tsudev-tsudev` là bất khả xâm phạm (CLAUDE.md toàn máy).

## 4. Kết quả xử lý (phiên nhận điền)

- 13/11/2026 - phiên tsudev-06 (repo tsudev), chủ dự án ủy quyền làm trực tiếp:
  - Ảnh gốc DUY NHẤT `assets/brand/source/logo-cwico.png` (sha256 như mục 0); cấu hình `assets/brand/brand.json`
    (chế độ `no-white`); dây chuyền `website/scripts/brand-assets.mjs` (Node + sharp có sẵn trong website, `--check` chạy
    trong CI) sinh: `brand/logo-cwico-{48,96,144,192}.{avif,webp}` + PNG 512, favicon.ico 7 lớp, favicon 16/32/96,
    android-chrome 192/512 + maskable riêng, apple-touch nền đặc, og-image 1200x630, `assets/brand/app/` (icon PNG + app.ico).
  - Website: header dùng `<picture>` AVIF → WebP (1x/2x/3x), chân trang dùng logo tsudev mới (dẫn về tsudev.com); gỡ
    `brand/logo-mark.png` và `scripts/brand_assets.py` (script cũ chép `logo-mark.png` từ tsudev.com - tệp đó đã gỡ
    13/11 nên script đã gãy).
  - Ứng dụng: icon Tauri `app/src-tauri/icons/*` (exe, MSI/NSIS, MSIX) qua `tools/gen_icons.py` và ảnh bộ cài `app/src-tauri/installer/*.bmp` qua `tools/gen_installer_images.py` - cả hai nay đọc `assets/brand/app/icon-1024.png`. Khối `Brand` trong giao diện app (`ui/public/brand/`) GIỮ logo tsudev vì đó là dấu nhà làm.
  - Vector SVG: CHƯA - không có công cụ vector hoá trong máy; bản raster đa cỡ đạt ở 16-512 px. Ảnh gốc nhỏ (cạnh
    ngắn < 1024 px) nên bản 512/1024 là phóng to - xin chủ dự án ảnh gốc lớn hơn hoặc SVG khi có.
  - Lệch chuẩn ghi ở `AGENTS.md` B.2. Website deploy sau khi PR merge; tsudev.com `/apps` đã dùng logo này từ PR tsudev#229.
