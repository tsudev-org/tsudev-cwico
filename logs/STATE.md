# STATE.md - Trạng thái project

> Agent đọc file này ở đầu mỗi phiên và cập nhật ở cuối mỗi phiên.
> Quy trình: `.standards/docs/AGENT_PROTOCOL.md`.

## Hàng đợi task (làm từ trên xuống)

- [ ] **REL-1** Phát hành bản sửa lỗi (cần chủ dự án duyệt - phát hành = ép cập nhật bắt buộc mọi máy, `docs/RELEASING.md`). Bản 26.8.1901 đang phát hành **trắng cửa sổ ngay sau lần quét đầu** trên máy thật; đã sửa trên `main` (PR #38). Trước khi phát hành: build `tauri build`, cài lên máy Windows, quét thử (xem phiếu `logs/handover/20261110-01_*` mục "Kiểm thử trên Windows").
- [ ] **QA-WIN-1** Chạy thử phần GHI trên Windows thật, có quyền Admin: `cwico plan --safe-only` (không đổi gì), rồi gỡ một mục An toàn trên máy ảo có snapshot - kiểm điểm khôi phục, `.reg`, nhật ký giao dịch. Chưa phiên bản nào làm việc này.
- [ ] **REL-2** Đưa `cwico.exe` (CLI) vào tài sản phát hành: hiện chỉ có trong artifact Actions (hết hạn sau 90 ngày), trang `/dong-lenh/` phải hướng dẫn build từ mã nguồn.
- [ ] **QU-STD-1 (phần còn lại)** Màu đã lấy từ `.standards/tokens/` (PR #42). Còn: chế độ Warm (UI chỉ có sáng/tối) và màu nút chính `--color-tsu-600` -> `primary`; cùng chờ TS-8.
- [ ] **QU-STD-BRAND (phần còn lại)** Màu chữ "dev" ở `ui/src/components/Brand.tsx` (cam, 4,18:1 - hai lỗi axe duy nhất còn lại) lệch website (xanh) - chờ TS-8 ở `tsudev-standards`, chưa tự đổi. Ảnh đại diện tổ chức GitHub là việc cấp tổ chức `tsudev-org`.
- [ ] **WEB-1** Website: danh mục Quy tắc (58) và Tinh chỉnh (36) chưa có bộ chọn số bản ghi (DATA_TABLE mục 1 "nghi ngờ thì thêm") - thêm vào `website/public/js/loc.js`.
- [ ] **DEP-1** PR dependabot đang mở (#17, #19, #21, #22, #27, #32, #33, #34) và #31 (tools/version.py): phiên 05 bị chặn gộp hàng loạt, cần chủ dự án duyệt. #27, #32, #33 còn đỏ cổng quy ước vì chưa rebase.

## Đang thực hiện

| Task | Agent | Bắt đầu |
| --- | --- | --- |

## Đã hoàn thành (mới nhất trên cùng)

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
