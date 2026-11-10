// Chế độ giao diện cho cwico.tsudev.com: Sáng / Ấm / Tối / Theo hệ thống - cùng hành vi với tsudev.com.
// Lưu ở localStorage khóa `tsudev-theme` (light|warm|dark|system), ghi chế độ đã GIẢI vào <html data-theme>.
//
// Nạp ĐỒNG BỘ trong <head>, trước stylesheet (<script src="/js/theme.js">, KHÔNG defer/async/module):
// phần đầu chạy ngay để trang không nháy sai màu ở lần vẽ đầu. CSP `script-src 'self'` chặn script nội tuyến,
// nên mã phải nằm trong tệp này. Phần nối nút đổi giao diện chờ DOMContentLoaded.
//
// Khi tắt JavaScript: <html> giữ data-theme="light" và không có data-che-do, site.css đi theo hệ điều hành,
// nút đổi giao diện vẫn ẩn (thuộc tính hidden).
(() => {
  'use strict';

  const KHOA = 'tsudev-theme';
  const CHE_DO = ['light', 'warm', 'dark', 'system'];
  const MAC_DINH = 'system'; // giữ đúng hành vi cũ của site: đi theo hệ điều hành
  // --bg-base của từng chế độ (tokens.css) cho <meta name="theme-color">; stylesheet chưa nạp lúc chạy.
  const NEN = { light: '#EEF4FB', warm: '#F6F1E6', dark: '#0F1B2D' };
  const root = document.documentElement;
  const toi = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function docLuaChon() {
    try {
      const v = localStorage.getItem(KHOA);
      if (CHE_DO.includes(v)) return v;
    } catch { /* bộ nhớ bị chặn (cookie tắt, iframe sandbox): dùng mặc định */ }
    return MAC_DINH;
  }

  function ghiLuaChon(v) {
    try { localStorage.setItem(KHOA, v); } catch { /* không lưu được thì chỉ áp cho lần xem này */ }
  }

  function giai(luaChon) {
    if (luaChon !== 'system') return luaChon;
    return toi && toi.matches ? 'dark' : 'light';
  }

  function ap(luaChon) {
    const theme = giai(luaChon);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-che-do', luaChon);
    for (const m of document.querySelectorAll('meta[name="theme-color"]')) {
      m.setAttribute('content', NEN[theme]);
      m.removeAttribute('media');
    }
    const cs = document.querySelector('meta[name="color-scheme"]');
    if (cs) cs.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
    return theme;
  }

  let luaChon = docLuaChon();
  ap(luaChon);

  // "Theo hệ thống": đổi theo hệ điều hành ngay khi người dùng đổi, không cần tải lại.
  if (toi) {
    const doi = () => { if (luaChon === 'system') { ap(luaChon); capNhatNut(); } };
    if (toi.addEventListener) toi.addEventListener('change', doi);
    else if (toi.addListener) toi.addListener(doi);
  }
  // Tab khác đổi lựa chọn thì tab này theo.
  window.addEventListener('storage', (e) => {
    if (e.key !== KHOA) return;
    luaChon = docLuaChon();
    ap(luaChon);
    capNhatNut();
  });

  let nut = null;
  let menu = null;

  function capNhatNut() {
    if (!menu) return;
    for (const muc of menu.querySelectorAll('[data-chon]')) {
      muc.setAttribute('aria-checked', muc.dataset.chon === luaChon ? 'true' : 'false');
    }
  }

  function moMenu(tapTrung) {
    menu.hidden = false;
    nut.setAttribute('aria-expanded', 'true');
    if (tapTrung) {
      const dangChon = menu.querySelector('[aria-checked="true"]') || menu.querySelector('[data-chon]');
      dangChon.focus();
    }
  }

  function dongMenu(traFocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    nut.setAttribute('aria-expanded', 'false');
    if (traFocus) nut.focus();
  }

  function noi() {
    nut = document.getElementById('nut-giao-dien');
    menu = document.getElementById('menu-giao-dien');
    if (!nut || !menu) return;
    const vung = nut.parentElement;
    vung.hidden = false;
    capNhatNut();

    nut.addEventListener('click', () => {
      if (menu.hidden) moMenu(false);
      else dongMenu(false);
    });
    nut.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); moMenu(true); }
    });

    const muc = [...menu.querySelectorAll('[data-chon]')];
    for (const m of muc) {
      m.addEventListener('click', () => {
        luaChon = m.dataset.chon;
        ghiLuaChon(luaChon);
        ap(luaChon);
        capNhatNut();
        dongMenu(true);
      });
    }
    menu.addEventListener('keydown', (e) => {
      const i = muc.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); muc[(i + 1) % muc.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); muc[(i - 1 + muc.length) % muc.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); muc[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); muc[muc.length - 1].focus(); }
      else if (e.key === 'Tab') dongMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) dongMenu(true);
    });
    document.addEventListener('click', (e) => {
      if (!vung.contains(e.target)) dongMenu(false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', noi);
  else noi();
})();
