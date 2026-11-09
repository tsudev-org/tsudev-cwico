// Bộ lọc danh mục cho cwico.tsudev.com (Quy tắc, Tinh chỉnh).
// Tăng cường dần: khi tắt JavaScript, danh mục vẫn hiện đầy đủ; tệp này chỉ thêm ô tìm và nhóm lọc.
// Chuẩn: tsudev-standards SEARCH_AND_FILTER.md - tìm từ 2 ký tự, debounce 350ms, tìm không dấu
// (đ -> d), tô sáng đúng vị trí trên chuỗi GỐC có dấu, trạng thái rỗng có gợi ý.
(() => {
  'use strict';

  const MIN_QUERY_LENGTH = 2;
  const DEBOUNCE_MS = 350;

  /** Chuẩn hóa một chuỗi: NFC, chữ thường, bỏ dấu, đ -> d, gộp khoảng trắng. */
  function chuanHoa(s) {
    return s.normalize('NFC').toLowerCase().normalize('NFD')
      .replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ' ').trim();
  }

  /**
   * Chuẩn hóa từng ký tự của chuỗi gốc và giữ bảng ánh xạ vị trí chuẩn hóa -> vị trí gốc,
   * để tô sáng trên chuỗi gốc (không tô trên chuỗi đã bỏ dấu - SEARCH_AND_FILTER mục 2.3).
   */
  function banDo(goc) {
    const nfc = goc.normalize('NFC');
    let chuoi = '';
    const viTri = [];
    let i = 0;
    for (const kyTu of nfc) {
      const n = kyTu.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s/g, ' ');
      for (let k = 0; k < n.length; k++) viTri.push(i);
      chuoi += n;
      i += kyTu.length;
    }
    viTri.push(i);
    return { nfc, chuoi, viTri };
  }

  /** Thay nội dung chữ của phần tử bằng các nút văn bản + <mark> cho từng chỗ khớp. */
  function toSang(el, tu) {
    if (!el.dataset.goc) el.dataset.goc = el.textContent;
    const goc = el.dataset.goc;
    el.textContent = '';
    if (!tu.length) { el.textContent = goc; return; }
    const { nfc, chuoi, viTri } = banDo(goc);
    const khoang = [];
    for (const t of tu) {
      let tu0 = chuoi.indexOf(t);
      while (tu0 >= 0) {
        khoang.push([viTri[tu0], viTri[tu0 + t.length]]);
        tu0 = chuoi.indexOf(t, tu0 + t.length);
      }
    }
    khoang.sort((a, b) => a[0] - b[0]);
    let con = 0;
    for (const [a, b] of khoang) {
      if (b <= con) continue;
      const dau = Math.max(a, con);
      if (dau > con) el.append(nfc.slice(con, dau));
      const m = document.createElement('mark');
      m.textContent = nfc.slice(dau, b);
      el.append(m);
      con = b;
    }
    if (con < nfc.length) el.append(nfc.slice(con));
  }

  function gan(form) {
    const ten = form.dataset.loc;
    const ds = document.querySelector(`[data-danh-muc="${ten}"]`);
    const rong = document.querySelector(`[data-rong="${ten}"]`);
    if (!ds) return;
    const muc = [...ds.children];
    const o = form.querySelector('input[type="search"]');
    const kq = form.querySelector('.loc__kq');
    const tong = Number(kq.dataset.tong);
    const nhom = [...new Set([...form.querySelectorAll('input[type="radio"]')].map((r) => r.name))];

    // Khôi phục trạng thái từ URL (?q=...&lop=...) để chia sẻ được một kết quả lọc.
    const url = new URL(location.href);
    if (url.searchParams.get('q')) o.value = url.searchParams.get('q');
    for (const n of nhom) {
      const gt = url.searchParams.get(n);
      const r = gt && form.querySelector(`input[name="${n}"][value="${CSS.escape(gt)}"]`);
      if (r) r.checked = true;
    }

    function apDung() {
      const q = chuanHoa(o.value);
      const tu = q.length >= MIN_QUERY_LENGTH ? q.split(' ').filter(Boolean) : [];
      const chon = Object.fromEntries(nhom.map((n) => [n, form.querySelector(`input[name="${n}"]:checked`)?.value ?? '']));
      let hien = 0;
      for (const li of muc) {
        const khop = tu.every((t) => li.dataset.tim.includes(t))
          && nhom.every((n) => !chon[n] || li.dataset[n] === chon[n]);
        li.hidden = !khop;
        if (khop) {
          hien += 1;
          for (const el of li.querySelectorAll('[data-hl]')) toSang(el, tu);
        }
      }
      kq.textContent = hien === tong ? `${tong} mục` : `${hien} / ${tong} mục`;
      if (rong) {
        rong.hidden = hien > 0;
        if (!hien) {
          rong.querySelector('[data-rong-text]').textContent = tu.length
            ? `Không tìm thấy kết quả phù hợp với "${o.value.trim()}"`
            : 'Không có mục nào khớp bộ lọc đang chọn';
        }
      }
      const moi = new URL(location.href);
      moi.searchParams.delete('q');
      if (tu.length) moi.searchParams.set('q', o.value.trim());
      for (const n of nhom) { moi.searchParams.delete(n); if (chon[n]) moi.searchParams.set(n, chon[n]); }
      history.replaceState(null, '', moi);
    }

    let hen;
    o.addEventListener('input', () => { clearTimeout(hen); hen = setTimeout(apDung, DEBOUNCE_MS); });
    o.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && o.value) { o.value = ''; clearTimeout(hen); apDung(); }
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(hen); apDung(); }
    });
    form.addEventListener('change', (e) => { if (e.target.type === 'radio') apDung(); });
    form.addEventListener('submit', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
      const dangGo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '');
      if ((e.key === '/' && !dangGo) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        o.focus();
        o.select();
      }
    });

    form.hidden = false;
    apDung();
    // Liên kết tới một mục cụ thể (#ms.onedrive): mở chi tiết kỹ thuật của mục đó.
    const dich = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (dich && ds.contains(dich)) {
      dich.hidden = false;
      dich.querySelector('details')?.setAttribute('open', '');
    }
  }

  document.querySelectorAll('form[data-loc]').forEach(gan);
})();
