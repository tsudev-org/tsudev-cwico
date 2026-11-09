/**
 * Search normalisation for Vietnamese (tsudev SEARCH_AND_FILTER section 3):
 * NFC, lower case, diacritics removed, `đ` -> `d` (NFD cannot split it),
 * whitespace collapsed. "dich vu" finds "Dịch vụ"; "Đồng bộ" finds "dong bo".
 */
export function fold(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}
