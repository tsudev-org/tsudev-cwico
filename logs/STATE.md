# STATE.md - Trạng thái project

> Agent đọc file này ở đầu mỗi phiên và cập nhật ở cuối mỗi phiên.
> Quy trình: `.standards/docs/AGENT_PROTOCOL.md`.

## Hàng đợi task (làm từ trên xuống)

- [ ] **WINGET-2** Manifest 26.11.1002 đã nộp: [microsoft/winget-pkgs#476024](https://github.com/microsoft/winget-pkgs/pull/476024) (10/11/2026, fork `tsudev-tsudev/winget-pkgs`). Theo dõi kiểm định tự động và CLA; gộp xong thì `winget install tsudev.cwico` ra bản mới. 10/11 phiên 06: bước 01-07 + CLA xanh, 08-10 (cài thử, metadata) đang chạy, chờ người duyệt của Microsoft.
- [ ] **QA-WIN-1** Chạy thử phần GHI trên Windows thật, có quyền Admin: `cwico plan --safe-only` (không đổi gì), rồi gỡ một mục An toàn trên máy ảo có snapshot - kiểm điểm khôi phục, `.reg`, nhật ký giao dịch. Chưa phiên bản nào làm việc này. Phiên 06 (10/11/2026) đã làm phần CHỈ ĐỌC trên Windows 11 25H2 của chủ dự án, không Admin, bằng CLI tải từ bản phát hành 26.11.1002 (SHA-256 khớp): `info`, `plan --safe-only` -> 30 mục / 63 bước trong 2,8 giây, không bị từ chối mục nào. Phát hiện `plan` giấu bước điểm khôi phục + sao lưu registry - sửa ở PR #55. Còn lại: phần GHI trên máy ảo có Admin.
- [ ] **QU-STD-1 (phần còn lại)** Màu đã lấy từ `.standards/tokens/` (PR #42). Còn: chế độ Warm (UI chỉ có sáng/tối) và màu nút chính `--color-tsu-600` -> `primary`; cùng chờ TS-8.
- [ ] **QU-STD-BRAND (phần còn lại)** Màu chữ "dev" ở `ui/src/components/Brand.tsx` (cam, 4,18:1 - hai lỗi axe duy nhất còn lại) lệch website (xanh) - chờ TS-8 ở `tsudev-standards`, chưa tự đổi. Ảnh đại diện tổ chức GitHub là việc cấp tổ chức `tsudev-org`.
- [ ] **DEP-1 (phần còn lại)** Đã gộp mọi PR dependabot trừ #22 (nhóm tauri) - #59 đã thay nó; chủ dự án đóng #22. Cảnh báo bảo mật `glib < 0.20` (dependabot "cargo for glib" trượt mỗi lần) là phụ thuộc gtk3 của tauri trên Linux, chưa có bản vá, không vào bản Windows - đóng cảnh báo dạng "tolerable risk" hoặc chờ tauri lên gtk4.
- [ ] **WEB-DEPLOY** Website có nút đổi giao diện (#58) nhưng chưa deploy: chủ dự án `cd website && npm ci && npm run deploy`, rồi kiểm theo phiếu `logs/handover/20261110-03_*.md` mục Nghiệm thu.

## Đang thực hiện

| Task | Agent | Bắt đầu |
| --- | --- | --- |

## Đã hoàn thành (mới nhất trên cùng)

- 10/11/2026 - Phiên 06 (tiếp): nút đổi giao diện Sáng/Ấm/Tối/Theo hệ thống cho website (#58, phiếu 20261110-03 từ phiên tsudev-c8); nâng nhóm tauri thay #22 (#59); chủ dự án gộp các PR dependabot còn lại.
- 10/11/2026 - Phiên 06: `cwico plan` hiện bước điểm khôi phục + sao lưu registry (#55); phần chỉ đọc của QA-WIN-1 trên máy thật. Phiếu `logs/handover/20261110-02_ket-phien-06.md`.
- 10/11/2026 - **Phát hành `tsudev-cwico-v26.11.10.2`** (chủ dự án công bố). Kiểm đầu cuối trên máy thật: bản 26.8.19 đã cài hiện màn cập nhật bắt buộc, bấm Cập nhật -> tải, kiểm chữ ký, cài, khởi động lại thành 26.11.1002. Website triển khai lại; manifest winget 26.11.1002 (#51).
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
