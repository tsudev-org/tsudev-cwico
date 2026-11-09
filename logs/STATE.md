# STATE.md - Trạng thái project

> Agent đọc file này ở đầu mỗi phiên và cập nhật ở cuối mỗi phiên.
> Quy trình: `.standards/docs/AGENT_PROTOCOL.md`.

## Hàng đợi task (làm từ trên xuống)

- [ ] **QU-STD-1** Di trú `tokens/` sang `.standards/tokens/` (nguồn chân lý duy nhất). Hiện có **0 file mã nguồn** đọc token cục bộ. Đây là thay đổi PHÁ VỠ: `text-muted` đổi giá trị ở cả ba chế độ và có thêm `border-control`. Làm theo CHANGELOG mục 2.0.0 "Hướng dẫn nâng cấp", chạy lại ảnh chụp giao diện.
- [ ] **QU-STD-3** Rà chỗ dùng `border-strong` cho viền nút phụ hoặc ô nhập, đổi sang `border-control` (`.standards/docs/DESIGN_SYSTEM.md` mục 1).
- [ ] **QU-STD-BRAND (phần còn lại)** Màu chữ "dev" ở `ui/src/components/Brand.tsx` (cam) lệch website (xanh) - chờ TS-8 ở `tsudev-standards`, chưa tự đổi. Ảnh đại diện tổ chức GitHub là việc cấp tổ chức `tsudev-org`.

## Đang thực hiện

| Task | Agent | Bắt đầu |
| --- | --- | --- |

## Đã hoàn thành (mới nhất trên cùng)

- 09/11/2026 - Phiếu 20261109-01: README mở đầu theo `ECOSYSTEM_IDENTITY.md` mục 2.1, ghi hạng C; mọi URL repo trỏ `tsudev-org/tsudev-cwico` (giữ nguyên manifest winget 26.8.1901 đã phát hành và nhật ký phiên cũ).
- 24/08/2026 - Đưa bộ quy ước tsudev v2.1.0 vào repo, bật cổng kiểm CI.

## Quyết định quan trọng

> Quyết định kiến trúc lớn thì viết ADR riêng theo `docs/templates/ADR.md` và chỉ
> ghi một dòng tham chiếu ở đây.

- 09/11/2026 - cwico là **hạng C - ngoại tuyến** (`AUTH_AND_ACCOUNT.md` mục 1), không phải hạng B như hàng đợi cũ ghi: không có tính năng nào cần máy chủ hay tài khoản; kiểm tra cập nhật lúc khởi động là yêu cầu công khai, không gửi dữ liệu máy, mất mạng vẫn chạy. Bỏ QU-STD-AUTH; đăng nhập (nếu có sau này) chỉ là tùy chọn theo mục 14.
- 24/08/2026 - Bộ quy ước đồng bộ từ `tsudev-standards`, bản sao chỉ-đọc ở `.standards/`. Không sửa ngược.

## Sự cố bảo mật

> Ghi theo `.standards/docs/SECURITY_BASELINE.md` mục 9. Để trống nếu chưa có.

- (chưa có)
