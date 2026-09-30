// Ленд агентства «Работа просто»: вакансии (из витрины или data.json), фильтр по типу работы, форма заявки.
// Витрина ведёт сюда ссылками вида …/#vac-<id оффера> — такая вакансия подсвечивается и получает фокус.
(function () {
  const C = window.SMENA || {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; };
  const okLink = u => /^https?:\/\//i.test(u || '');
  const KINDS = { courier: 'Курьеры', store: 'Магазины', warehouse: 'Склады' };
  const KIND_FORM = { courier: 'Курьер', store: 'Магазин', warehouse: 'Склад' };
  const kindOf = o => o.kind || (/курьер/i.test(o.name) ? 'courier' : /склад/i.test(o.name) ? 'warehouse' : 'store');
  const tgUrl = t => !t ? '' : /^https?:/.test(t) ? t : 'https://t.me/' + t.replace(/^@/, '');

  let jobs = [], filter = 'all', tg = '', touched = false;
  ['keydown', 'wheel', 'touchstart', 'pointerdown'].forEach(t => addEventListener(t, () => { touched = true; }, { once: true, passive: true, capture: true }));

  // Телеграм подключаем сразу, до загрузки вакансий: без него строка со ссылкой не показывается
  function setTelegram(t) {
    tg = tgUrl(t);
    const inline = $('#tg-inline');
    if (!tg) { inline.closest('p').hidden = true; return; }
    inline.href = tg; inline.target = '_blank'; inline.rel = 'noopener';
    if (!inline.querySelector('.vh')) inline.insertAdjacentHTML('beforeend', '<span class="vh"> (откроется в новой вкладке)</span>');
    inline.closest('p').hidden = false;
  }
  setTelegram(C.telegram);

  function logo(o) {
    return o.logo ? `<img class="lg" src="${esc(o.logo)}" alt="" width="44" height="44" loading="lazy">`
      : `<span class="lg" aria-hidden="true" style="display:grid;place-items:center;font-weight:900">${esc((o.brand || o.name).charAt(0))}</span>`;
  }

  function render(data) {
    const S = data._own ? (data.site || {}) : {};
    if (S.name) document.querySelectorAll('[data-site="name"]').forEach(n => n.textContent = S.name);
    if (S.legal) $('[data-site="legal"]').textContent = S.legal;
    if (!C.telegram && S.telegram) setTelegram(S.telegram);

    const hrCats = new Set((data.categories || []).filter(c => c.group === 'hr').map(c => c.id));
    jobs = (data.offers || []).filter(o => !o.hidden && (!hrCats.size || hrCats.has(o.cat))).map(o => ({ ...o, kind: kindOf(o) }));
    $('#open-num').textContent = jobs.length;
    $('#open-list').innerHTML = jobs.slice(0, 5).map(o => `<li>${logo(o)}<div><b>${esc(o.name)}</b><span>${esc(o.cond || o.brand)}</span></div></li>`).join('');

    const brands = [...new Map(jobs.map(o => [o.brand, o])).values()];
    $('#brands').innerHTML = brands.map(o => `<li>${o.logo ? `<img src="${esc(o.logo)}" alt="" width="32" height="32">` : ''}${esc(o.brand)}</li>`).join('');

    const counts = jobs.reduce((a, o) => (a[o.kind] = (a[o.kind] || 0) + 1, a), {});
    $('#filters').innerHTML = `<button class="fbtn" type="button" data-f="all" aria-pressed="true">Все <span>${jobs.length}</span></button>` +
      Object.keys(KINDS).filter(k => counts[k]).map(k => `<button class="fbtn" type="button" data-f="${k}" aria-pressed="false">${KINDS[k]} <span>${counts[k]}</span></button>`).join('');

    $('#jobs-list').innerHTML = jobs.map(o => {
      // без ссылки работодателя отклик идёт через нашу заявку — и это видно на кнопке
      const btn = okLink(o.link)
        ? `<a class="btn" href="${esc(o.link)}" target="_blank" rel="sponsored noopener">Откликнуться<svg class="ext" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg><span class="vh">: ${esc(o.name)} (анкета откроется в новой вкладке)</span></a>`
        : `<a class="btn" href="#lead" data-job="${esc(o.name)}" data-kind="${o.kind}">Откликнуться через заявку<span class="vh">: ${esc(o.name)}</span></a>`;
      const facts = (o.facts || []).filter(Boolean);
      return `<li class="job" id="vac-${esc(o.id)}" data-kind="${o.kind}">
        <div class="job__top">${logo(o)}<div class="job__titles"><h3>${esc(o.name)}</h3>${o.brand && o.brand !== o.name ? `<div class="job__co">${esc(o.brand)}</div>` : ''}</div></div>
        ${o.cond ? `<p class="job__pay">${esc(o.cond)}</p>` : ''}
        ${o.desc ? `<p class="job__desc">${esc(o.desc)}</p>` : ''}
        ${facts.length ? `<ul class="facts" role="list">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
        <div class="job__foot">${btn}</div>
      </li>`;
    }).join('') || '<li class="state">Скоро здесь появятся вакансии. Оставьте заявку — подберём.</li>';
    showTarget(true);
  }

  // переход с витрины: #vac-<id> — показываем вакансию (сбрасываем фильтр, если прячет), подсвечиваем, ставим фокус
  function showTarget(first) {
    const m = /^#vac-(.+)$/.exec(location.hash);
    document.querySelectorAll('.job.is-target').forEach(j => j.classList.remove('is-target'));
    if (!m) return;
    let id = ''; try { id = decodeURIComponent(m[1]); } catch (e) { /* битый адрес — как закрытая вакансия */ }
    const card = id && document.getElementById('vac-' + id);
    const st = $('#jobs-status');
    // вакансии подгружаются асинхронно: если человек уже листает или нажал Tab — фокус не выдёргиваем
    const busy = first && (touched || document.activeElement !== document.body || scrollY > 40);
    if (!card) {
      if (busy) return;
      if (filter !== 'all') applyFilter('all', false);
      const h = $('#jobs-h'); h.setAttribute('tabindex', '-1');
      $('#jobs').scrollIntoView({ block: 'start' }); h.focus({ preventScroll: true });
      h.addEventListener('blur', () => h.removeAttribute('tabindex'), { once: true });
      announce(st, 'Эта вакансия уже закрыта. Показаны все открытые вакансии.');
      return;
    }
    const reset = card.hidden;
    if (reset) applyFilter('all', false);
    card.classList.add('is-target');
    const name = card.querySelector('h3').textContent;
    if (busy) { announce(st, `Вакансии загружены. «${name}» — в разделе «Вакансии».`); return; }
    card.scrollIntoView({ block: 'center' });
    const h = card.querySelector('h3');
    h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
    h.addEventListener('blur', () => h.removeAttribute('tabindex'), { once: true });
    if (reset) announce(st, 'Фильтр сброшен: показаны все вакансии.');
  }
  addEventListener('hashchange', () => showTarget(false));

  // новое сообщение отменяет недосказанное прошлое — иначе в регионе остаётся устаревшее число
  function announce(el, text) { clearTimeout(el._t); el.textContent = ''; el._t = setTimeout(() => { el.textContent = text; }, 60); }

  function applyFilter(f, speak = true) {
    filter = f;
    let n = 0;
    document.querySelectorAll('.fbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
    document.querySelectorAll('.job').forEach(j => { const on = f === 'all' || j.dataset.kind === f; j.hidden = !on; if (on) n++; });
    const st = $('#jobs-status');
    if (speak) announce(st, `Показано ${n} ${plural(n, 'вакансия', 'вакансии', 'вакансий')}`); else { clearTimeout(st._t); st.textContent = ''; }
  }

  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  document.addEventListener('focusin', e => {
    const b = e.target.closest && e.target.closest('.fbtn');
    if (!b) return;
    const box = b.parentElement, l = b.offsetLeft - 16, r = b.offsetLeft + b.offsetWidth + 16 - box.clientWidth;
    if (box.scrollLeft > l) box.scrollLeft = l; else if (box.scrollLeft < r) box.scrollLeft = r;
  });

  document.addEventListener('click', e => {
    // ссылка пропуска: фокус на main только на время перехода (иначе клик по тексту уводит фокус в main)
    const skip = e.target.closest('.skip');
    if (skip) {
      const m = $('#main'); e.preventDefault();
      m.setAttribute('tabindex', '-1'); m.focus(); m.scrollIntoView();
      m.addEventListener('blur', () => m.removeAttribute('tabindex'), { once: true });
      return;
    }
    const b = e.target.closest('.fbtn');
    if (b) { applyFilter(b.dataset.f); return; }
    // «Все вакансии» — без активного фильтра
    if (e.target.closest('a[href="#jobs"]') && filter !== 'all') applyFilter('all', false);
    // отклик через заявку: переносим вакансию в форму и ставим курсор в первое поле
    const job = e.target.closest('a[data-job]');
    if (job) {
      e.preventDefault();
      const k = KIND_FORM[job.dataset.kind];
      if (k) form.elements.kind.value = k;
      const c = form.elements.comment;
      const line = `Вакансия: ${job.dataset.job}`;
      if (!c.value.includes(line)) c.value = c.value ? `${line}\n${c.value}` : line;
      form.elements.name.focus();
      announce(status, `Вакансия «${job.dataset.job}» добавлена в заявку.`);
    }
  });

  async function load() {
    const urls = [C.source, 'data.json'].filter(Boolean);
    for (const u of urls) {
      try {
        const r = await fetch(u + (u.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
        if (r.ok) { const d = await r.json(); if (d && Array.isArray(d.offers)) { d._own = u === 'data.json'; return d; } }
      } catch (e) { /* следующий источник */ }
    }
    throw new Error('no data');
  }
  load().then(render).catch(() => {
    const m = 'Не удалось загрузить вакансии. Обновите страницу или оставьте заявку ниже.';
    $('#jobs-list').innerHTML = `<li class="state">${m}</li>`;
    announce($('#jobs-status'), m);
  });

  // ---------- форма ----------
  const form = $('#lead-form');
  const status = $('#form-status');
  const LABEL = { name: 'имя', contact: 'телефон или Telegram', city: 'город', consent: 'согласие на обработку данных' };
  const rules = {
    name: v => v.trim().length >= 2 || 'Напишите имя — хотя бы 2 буквы.',
    contact: v => /^@?[A-Za-z0-9_]{5,32}$/.test(v.trim()) || (/^[+\d(][\d\s()+-]*$/.test(v.trim()) && v.replace(/\D/g, '').length >= 10) || 'Нужен телефон (+7 900 000-00-00) или ник в Telegram (@nickname).',
    city: v => v.trim().length >= 2 || 'Напишите город и район.',
  };
  function check(name) {
    const el = form.elements[name];
    const res = name === 'consent' ? (el.checked || 'Без согласия отправить заявку не получится.') : rules[name](el.value);
    const err = $('#e-' + name);
    if (res === true) { el.removeAttribute('aria-invalid'); err.textContent = ''; return true; }
    el.setAttribute('aria-invalid', 'true'); err.textContent = res; return false;
  }
  ['name', 'contact', 'city'].forEach(n => {
    form.elements[n].addEventListener('blur', () => { if (form.elements[n].value && !check(n)) announce($('#field-status'), $('#e-' + n).textContent); });
    // ошибка исчезает, как только поле исправлено
    form.elements[n].addEventListener('input', () => { if (form.elements[n].getAttribute('aria-invalid')) check(n); });
  });
  form.elements.consent.addEventListener('change', () => { if (form.elements.consent.getAttribute('aria-invalid')) check('consent'); });

  const btn = form.querySelector('button[type=submit]');
  let sending = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    const bad = ['name', 'contact', 'city', 'consent'].filter(n => !check(n));
    if (bad.length) {
      form.elements[bad[0]].focus();
      announce(status, `Проверьте: ${bad.map(n => LABEL[n]).join(', ')}.`);
      return;
    }
    // кнопку не выключаем — иначе фокус улетает со страницы; повторные нажатия гасит флаг
    sending = true; btn.setAttribute('aria-disabled', 'true');
    announce(status, 'Отправляем…');
    try {
      const body = Object.fromEntries(new FormData(form));
      body.consent = form.elements.consent.checked;
      const r = await fetch(C.send || 'send.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'send');
      form.reset();
      announce(status, 'Заявка отправлена. Свяжемся с вами, как только подберём вакансию.');
    } catch (err) {
      const own = err && !(err instanceof TypeError) && err.message && err.message !== 'send';
      announce(status, own ? err.message : `Не получилось отправить. Проверьте интернет и попробуйте ещё раз${tg ? ' или напишите нам в Telegram' : ''}.`);
    } finally { sending = false; btn.removeAttribute('aria-disabled'); }
  });
})();
