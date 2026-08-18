/* Apple of Fortune — original design, predictions driven by Firebase RTDB (/m11) */
(function () {
  const DB = 'https://x-men-256cc-default-rtdb.firebaseio.com/m11.json';
  const IMG = 'https://i.ibb.co/hBdQrHp/IMG-20241125-133222-422.jpg';
  const ROWS = 10;
  const COLS = 5;
  // rotten apples per row (row 1 = m1..m5 = bottom row in the game grid)
  const BAD_PER_ROW = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];

  const $ = (id) => document.getElementById(id);
  const keyIndex = (row, col) => (row - 1) * COLS + col;

  function showAlert(msg) {
    const box = $('alertBox');
    if (!box) return;
    box.textContent = msg;
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 2500);
  }

  async function fetchPredictions() {
    const res = await fetch(DB + '?_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const out = {};
    for (let i = 1; i <= ROWS * COLS; i++) {
      const k = 'm' + i;
      const node = data && data[k];
      const v = node && typeof node === 'object' ? node[k] : node;
      out[k] = String(v) === '1' ? 1 : 0;
    }
    return out;
  }

  function makeRow(row, safeCol) {
    const div = document.createElement('div');
    div.className = 'circle-row';
    for (let col = 1; col <= COLS; col++) {
      const c = document.createElement('div');
      c.className = 'circle';
      if (col === safeCol) {
        const img = document.createElement('img');
        img.src = IMG;
        img.alt = 'Prediction Image';
        img.style.display = 'block';
        c.appendChild(img);
      }
      div.appendChild(c);
    }
    const num = document.createElement('span');
    num.className = 'row-number';
    num.textContent = String(row);
    div.appendChild(num);
    return div;
  }

  function randomPattern() {
    const payload = {};
    for (let row = 1; row <= ROWS; row++) {
      const bad = new Set();
      while (bad.size < BAD_PER_ROW[row - 1]) bad.add(1 + Math.floor(Math.random() * COLS));
      for (let col = 1; col <= COLS; col++) {
        const k = 'm' + keyIndex(row, col);
        payload[k] = {}; payload[k][k] = bad.has(col) ? '1' : '0';
      }
    }
    return payload;
  }

  async function writePattern(payload) {
    const res = await fetch(DB, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('write failed');
  }

  function replaceButton(id) {
    const btn = $(id);
    if (!btn) return null;
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    return clone;
  }

  function init() {
    const container = $('circleContainer');
    if (!container) return;
    container.innerHTML = '';

    let currentRow = 0;
    let values = null;

    const loader = $('prediction-loading');
    const setLoading = (on) => { if (loader) loader.style.display = on ? 'flex' : 'none'; };

    const predictBtn = replaceButton('predictButton');
    const resetBtn = replaceButton('resetButton');

    if (predictBtn) predictBtn.addEventListener('click', async () => {
      if (currentRow >= ROWS) { showAlert('تم الوصول إلى الحد! اضغط على إعادة التعيين'); return; }
      setLoading(true);
      try {
        if (!values) values = await fetchPredictions();
        currentRow += 1;
        const safe = [];
        for (let col = 1; col <= COLS; col++) {
          if (values['m' + keyIndex(currentRow, col)] === 0) safe.push(col);
        }
        const pick = safe.length ? safe[Math.floor(Math.random() * safe.length)] : 0;
        container.appendChild(makeRow(currentRow, pick));
      } catch (e) {
        showAlert('تعذر جلب التوقعات، حاول مرة أخرى');
      } finally {
        setLoading(false);
      }
    });

    if (resetBtn) resetBtn.addEventListener('click', async () => {
      setLoading(true);
      try {
        await writePattern(randomPattern());
        values = null;
        currentRow = 0;
        container.innerHTML = '';
        showAlert('تم تحديث التوقعات');
      } catch (e) {
        showAlert('تعذر إعادة التعيين، حاول مرة أخرى');
      } finally {
        setLoading(false);
      }
    });

    const content = $('content');
    if (content) { content.style.display = 'block'; content.classList.add('visible'); }
    const l = $('loading');
    if (l) l.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
