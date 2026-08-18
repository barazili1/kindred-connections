/* Apple of Fortune — predictions driven by Firebase RTDB (path /m11) */
(function () {
  const DB = 'https://x-men-256cc-default-rtdb.firebaseio.com/m11.json';
  const ROWS = 10;
  const COLS = 5;
  // number of rotten apples per row (row 1 = bottom = m1..m5)
  const BAD_PER_ROW = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];

  const $ = (id) => document.getElementById(id);

  function keyIndex(row, col) { return (row - 1) * COLS + col; } // 1..50

  function buildGrid() {
    const container = $('circleContainer');
    if (!container) return;
    container.innerHTML = '';
    for (let row = ROWS; row >= 1; row--) {
      const div = document.createElement('div');
      div.className = 'circle-row';
      div.dataset['row'] = String(row);
      div.style.animation = 'none';
      for (let col = 1; col <= COLS; col++) {
        const c = document.createElement('div');
        c.className = 'circle';
        c.dataset['key'] = 'm' + keyIndex(row, col);
        c.style.fontSize = '22px';
        div.appendChild(c);
      }
      const num = document.createElement('span');
      num.className = 'row-number';
      num.textContent = String(row);
      div.appendChild(num);
      container.appendChild(div);
    }
  }

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

  function paintRow(row, values) {
    document.querySelectorAll('.circle-row[data-row="' + row + '"] .circle').forEach((el) => {
      const bad = values[el.dataset['key']] === 1;
      el.textContent = bad ? '❌' : '🍏';
      el.style.background = bad
        ? 'rgba(255, 77, 77, 0.25)'
        : 'rgba(60, 220, 120, 0.25)';
      el.style.boxShadow = bad ? 'none' : '0 0 12px rgba(60,220,120,0.5)';
    });
  }

  function clearGrid() {
    document.querySelectorAll('#circleContainer .circle').forEach((el) => {
      el.textContent = '';
      el.style.background = 'rgba(255, 255, 255, 0.1)';
      el.style.boxShadow = 'none';
    });
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
    buildGrid();
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
        paintRow(currentRow, values);
      } catch (e) {
        showAlert('تعذر جلب التوقعات، حاول مرة أخرى');
      } finally {
        setLoading(false);
      }
    });

    if (resetBtn) resetBtn.addEventListener('click', async () => {
      setLoading(true);
      try {
        const payload = randomPattern();
        await writePattern(payload);
        values = null;
        currentRow = 0;
        clearGrid();
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
