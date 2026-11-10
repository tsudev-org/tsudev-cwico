# STATE.md - Trạng thái project

> Agent đọc file này ở đầu mỗi phiên và cập nhật ở cuối mỗi phiên.
> Quy trình: `.standards/docs/AGENT_PROTOCOL.md`.

## Hàng đợi task (làm từ trên xuống)

- [ ] **REL-1 (bước cuối)** Bản nháp `tsudev-cwico-v26.11.10.2` đã build, ký, kiểm đủ RELEASING.md mục 5 (chữ ký khớp, có `latest.json` + MSI + NSIS + CLI, app giải nén quét được 631 mục trên Windows 11). Chỉ còn **công bố**: `gh release edit tsudev-cwico-v26.11.10.2 --draft=false --latest` - phiên 05 bị chặn ở bước này. Sau khi công bố: `cd website && npm run deploy`; rồi winget (RELEASING mục 7). Tag `tsudev-cwico-v26.11.10` không có bản phát hành (build hỏng ở bước ghi chú, đã sửa #48); phiên 05 bị chặn xóa tag trên remote - để nguyên hoặc chủ dự án xóa.
- [ ] **QA-WIN-1** Chạy thử phần GHI trên Windows thật, có quyền Admin: `cwico plan --safe-only` (không đổi gì), rồi gỡ một mục An toàn trên máy ảo có snapshot - kiểm điểm khôi phục, `.reg`, nhật ký giao dịch. Chưa phiên bản nào làm việc này.
- [ ] **QU-STD-1 (phần còn lại)** Màu đã lấy từ `.standards/tokens/` (PR #42). Còn: chế độ Warm (UI chỉ có sáng/tối) và màu nút chính `--color-tsu-600` -> `primary`; cùng chờ TS-8.
- [ ] **QU-STD-BRAND (phần còn lại)** Màu chữ "dev" ở `ui/src/components/Brand.tsx` (cam, 4,18:1 - hai lỗi axe duy nhất còn lại) lệch website (xanh) - chờ TS-8 ở `tsudev-standards`, chưa tự đổi. Ảnh đại diện tổ chức GitHub là việc cấp tổ chức `tsudev-org`.
- [ ] **DEP-1** PR dependabot đang mở (#17, #19, #21, #22, #27, #32, #33, #34, #39) và #31 (tools/version.py, đã có thay thế: lockfile UI giờ đồng bộ bằng `npm install --package-lock-only` khi phát hành): bộ phân loại tự động chặn phiên 05 gộp PR không do phiên tạo, kể cả từng cái. Cần chủ dự án gộp hoặc mở quyền.

## Đang thực hiện

| Task | Agent | Bắt đầu |
| --- | --- | --- |

## Đã hoàn thành (mới nhất trên cùng)

- 10/11/2026 - Phiên 05 (tiếp): CLI vào tài sản phát hành (REL-2, #45); sửa quy trình phát hành gọi sai `-Version` (#45) và đọc CHANGELOG bằng cp1252 (#48); phân trang danh mục website (WEB-1, #46); CSDL an toàn 1.0.2 thêm tên cho 17 quy tắc (#46); ảnh chụp app thật vào README (#47); bản nháp `tsudev-cwico-v26.11.10.2` (#49).
- 10/11/2026 - Phiên 05: website `https://cwico.tsudev.com` (PR #37, Workers Static Assets); chạy thật trên Windows 11 lần đầu, sửa UI trắng cửa sổ + hợp đồng IPC (PR #38); phân trang mọi danh sách (QU-STD-TABLE, PR #40); ảnh bản cài + cổng CI tài sản (PR #41); token chuẩn + border-control (QU-STD-3, phần lớn QU-STD-1, PR #42). Chi tiết: `logs/handover/20261110-01_ket-phien-05.md`.
- 09/11/2026 - Phiếu 20261109-01: README mở đầu theo `ECOSYSTEM_IDENTITY.md` mục 2.1, ghi hạng C; mọi URL repo trỏ `tsudev-org/tsudev-cwico` (giữ nguyên manifest winget 26.8.1901 đã phát hành và nhật ký phiên cũ).
- 24/08/2026 - Đưa bộ quy ước tsudev v2.1.0 vào repo, bật cổng kiểm CI.

## Quyết định quan trọng

> Quyết định kiến trúc lớn thì viết ADR riêng theo `docs/templates/ADR.md` và chỉ
> ghi một dòng tham chiếu ở đây.

- 10/11/2026 - Website `cwico.tsudev.com` chạy trên **Cloudflare Workers Static Assets** (Worker `tsudev-cwico-website`, không có mã phía máy chủ), không phải Pages: wrangler 4.158 chuyển lệnh tạo dự án Pages mới sang Workers và tự cài adapter SSR. Lý do trong `website/wrangler.jsonc`.
- 10/11/2026 - Hợp đồng JSON engine -> UI: trường tập hợp (`executables`, `extra`, `registryBackups`, `warnings`) luôn được tuần tự hóa; `crates/cwico-core/tests/ipc_contract.rs` canh.
- 09/11/2026 - cwico là **hạng C - ngoại tuyến** (`AUTH_AND_ACCOUNT.md` mục 1), không phải hạng B như hàng đợi cũ ghi: không có tính năng nào cần máy chủ hay tài khoản; kiểm tra cập nhật lúc khởi động là yêu cầu công khai, không gửi dữ liệu máy, mất mạng vẫn chạy. Bỏ QU-STD-AUTH; đăng nhập (nếu có sau này) chỉ là tùy chọn theo mục 14.
- 24/08/2026 - Bộ quy ước đồng bộ từ `tsudev-standards`, bản sao chỉ-đọc ở `.standards/`. Không sửa ngược.

## Sự cố bảo mật

> Ghi theo `.standards/docs/SECURITY_BASELINE.md` mục 9. Để trống nếu chưa có.

- (chưa có)
