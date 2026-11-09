# PHIẾU YÊU CẦU - README theo nhận diện tsudev (ECOSYSTEM_IDENTITY mục 2.1)

- **Mã phiếu**: 20261109-01
- **Từ**: phiên tsudev-files-c2 (repo `tsudev-files`) - **Đến**: phiên sau của repo này
- **Thời điểm**: 21:26 09/11/2026
- **Trạng thái**: ĐÓNG
- **Ủy quyền**: chủ dự án đồng ý chuẩn hóa nhận diện mọi repo hệ tsudev (chat 09/11/2026, phiên tsudev-files).

## Đã làm hộ (trên GitHub, không đụng mã repo này)

- Mô tả repo kết thúc bằng ` | tsudev.com`, `homepage` = `https://tsudev.com` (chưa có trang sản phẩm riêng),
  thêm nhãn `tsudev`. Kiểm: `gh api repos/<owner>/<repo> --jq '.description,.homepage,.topics'`.

## Việc cần làm ở repo này

1. `README.md` mở đầu: dấu hiệu thu gọn, tên sản phẩm, một câu mô tả, rồi dòng
   `Một sản phẩm của [tsudev](https://tsudev.com).` (`.standards/docs/ECOSYSTEM_IDENTITY.md` mục 2.1).
2. Ghi **hạng sản phẩm** A/B/C vào README (`.standards/docs/AUTH_AND_ACCOUNT.md` mục 1). Mô tả repo cũ là tiếng Anh có em-dash; đã thay bằng câu tiếng Việt - đọc lại cho đúng ý. (Lúc viết phiếu repo đang có `ui/package-lock.json` sửa dở - phiên viết phiếu KHÔNG đụng.)
3. Khi repo `tsudev` làm xong trang sản phẩm (phiếu `tsudev/logs/handover/20261109-06_*`), đổi `homepage`
   sang trang đó.

## Kết quả xử lý

- 09/11/2026, phiên tsudev-cwico-05: mục 1 và 2 xong (README + `docs/README.vi.md`). Hạng sản phẩm là **C**, không
  phải B như hàng đợi cũ ghi - lý do ở `logs/STATE.md` mục "Quyết định quan trọng". Mô tả repo tiếng Việt đã đọc
  lại, đúng ý, giữ nguyên.
- Mục 3: phiên này dựng trang riêng `https://cwico.tsudev.com` (`website/`), đã đổi `homepage` repo sang trang đó.
