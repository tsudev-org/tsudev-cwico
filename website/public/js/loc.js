// Bộ lọc danh mục cho cwico.tsudev.com (Quy tắc, Tinh chỉnh).
// Tăng cường dần: khi tắt JavaScript, danh mục vẫn hiện đầy đủ; tệp này chỉ thêm ô tìm và nhóm lọc.
// Chuẩn: tsudev-standards SEARCH_AND_FILTER.md - tìm từ 2 ký tự, debounce 350ms, tìm không dấu
// (đ -> d), tô sáng đúng vị trí trên chuỗi GỐC có dấu, trạng thái rỗng có gợi ý.
(() => {
  'use strict';

  const MIN_QUERY_LENGTH = 2;
  const DEBOUNCE_MS = 350;
  // DATA_TABLE.md: mốc 10/20/50/100/200, mặc định 10, góc dưới bên trái, nhớ theo từng bảng.
  const PAGE_SIZES = [10, 20, 50, 100, 200];
  const nf = new Intl.NumberFormat('vi-VN');

  function docMoc(bang, url) {
    const tuUrl = Number(url.searchParams.get('page_size'));
    if (PAGE_SIZES.includes(tuUrl)) return tuUrl;
    try {
      const nho = Number(localStorage.getItem(`tsudev.pagesize.${bang}`));
      if (PAGE_SIZES.includes(nho)) return nho;
    } catch { /* bộ nhớ bị chặn */ }
    return 10;
  }

  /** Tối đa 7 ô: 1 … 5 6 7 … 13 (null = dấu lửng). */
  function oTrang(hienTai, tong) {
    if (tong <= 7) return Array.from({ length: tong }, (_, i) => i + 1);
    if (hienTai <= 4) return [1, 2, 3, 4, 5, null, tong];
    if (hienTai >= tong - 3) return [1, null, tong - 4, tong - 3, tong - 2, tong - 1, tong];
    return [1, null, hienTai - 1, hienTai, hienTai + 1, null, tong];
  }

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

    // Chân vùng bản ghi: bộ chọn TRÁI - tóm tắt GIỮA - phân trang PHẢI.
    let moc = docMoc(ten, url);
    let trang = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const chan = document.createElement('div');
    chan.className = 'chan-ds';
    chan.innerHTML = `<div class="chan-ds__moc"><select aria-label="Số bản ghi mỗi trang"></select><span aria-hidden="true">/ trang</span></div>
      <p class="chan-ds__tom-tat"></p><span class="chi-doc" aria-live="polite"></span>
      <nav class="chan-ds__trang" aria-label="Phân trang"></nav>`;
    const chonMoc = chan.querySelector('select');
    for (const m of PAGE_SIZES) chonMoc.add(new Option(String(m), String(m), m === moc, m === moc));
    ds.after(chan);
    let dauTien = 0;
    chonMoc.addEventListener('change', () => {
      moc = Number(chonMoc.value);
      try { localStorage.setItem(`tsudev.pagesize.${ten}`, String(moc)); } catch { /* bỏ qua */ }
      trang = Math.floor(dauTien / moc) + 1; // giữ bản ghi đầu đang xem
      apDung(false);
      chonMoc.focus();
    });

    function apDung(veTrangDau = true) {
      if (veTrangDau === true) trang = 1;
      const q = chuanHoa(o.value);
      const tu = q.length >= MIN_QUERY_LENGTH ? q.split(' ').filter(Boolean) : [];
      const chon = Object.fromEntries(nhom.map((n) => [n, form.querySelector(`input[name="${n}"]:checked`)?.value ?? '']));
      const khopDs = muc.filter((li) => tu.every((t) => li.dataset.tim.includes(t))
        && nhom.every((n) => !chon[n] || li.dataset[n] === chon[n]));
      const hien = khopDs.length;
      const soTrang = Math.max(1, Math.ceil(hien / moc));
      trang = Math.min(Math.max(1, trang), soTrang);
      dauTien = (trang - 1) * moc;
      const trenTrang = new Set(khopDs.slice(dauTien, dauTien + moc));
      for (const li of muc) {
        li.hidden = !trenTrang.has(li);
        if (trenTrang.has(li)) for (const el of li.querySelectorAll('[data-hl]')) toSang(el, tu);
      }
      kq.textContent = hien === tong ? `${tong} mục` : `${hien} / ${tong} mục`;
      veChan(hien, soTrang);
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
      moi.searchParams.delete('page'); moi.searchParams.delete('page_size');
      if (trang > 1) moi.searchParams.set('page', String(trang));
      if (moc !== 10) moi.searchParams.set('page_size', String(moc));
      history.replaceState(null, '', moi);
    }

    function veChan(hien, soTrang) {
      const cuoi = Math.min(dauTien + moc, hien);
      let tt = '';
      if (hien && soTrang === 1) tt = `${nf.format(hien)} mục`;
      else if (hien) tt = `${nf.format(dauTien + 1)}-${nf.format(cuoi)} / ${nf.format(hien)}`;
      if (hien && hien !== tong) tt += ` (lọc từ ${nf.format(tong)})`;
      chan.querySelector('.chan-ds__tom-tat').textContent = tt;
      chan.querySelector('.chi-doc').textContent = hien
        ? `Đang hiển thị ${nf.format(dauTien + 1)} đến ${nf.format(cuoi)} trong ${nf.format(hien)} mục` : '';
      const nav = chan.querySelector('nav');
      nav.textContent = '';
      nav.hidden = soTrang <= 1;
      const nut = (nhan, toi, aria, hienTai) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'o-trang'; b.textContent = nhan;
        if (aria) b.setAttribute('aria-label', aria);
        if (hienTai) b.setAttribute('aria-current', 'page');
        b.disabled = toi < 1 || toi > soTrang;
        b.addEventListener('click', () => { trang = toi; apDung(false); ds.scrollIntoView({ block: 'start' }); });
        nav.append(b);
      };
      nut('‹', trang - 1, 'Trang trước');
      for (const n of oTrang(trang, soTrang)) {
        if (n === null) { const g = document.createElement('span'); g.textContent = '…'; g.className = 'o-trang__lung'; nav.append(g); }
        else nut(nf.format(n), n, null, n === trang);
      }
      nut('›', trang + 1, 'Trang sau');
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
    apDung(false);
    // Liên kết tới một mục cụ thể (#ms.onedrive): mở chi tiết kỹ thuật của mục đó.
    const dich = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (dich && ds.contains(dich)) {
      const viTri = muc.indexOf(dich);
      if (viTri >= 0 && dich.hidden) { trang = Math.floor(viTri / moc) + 1; apDung(false); }
      dich.hidden = false;
      dich.querySelector('details')?.setAttribute('open', '');
    }
  }

  document.querySelectorAll('form[data-loc]').forEach(gan);
})();
