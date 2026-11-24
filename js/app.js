/* ═══════════════════════════════════════════════════════════════════════
   «Работа просто» — тексты из панели, вакансии, фильтр по разделам, форма.

   Каталог объявлен глобальными const в data.js (на хостинге — через
   data.php, мимо кеша). const в window не попадает, поэтому проверяем
   typeof. На адресе index.html?draft=1 вместо боевого файла подставляется
   черновик из панели управления.

   С витрины сюда ведут ссылки вида …/#vac-<id> — такая вакансия
   подсвечивается и получает фокус.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var site   = typeof SITE       !== 'undefined' ? SITE       : null;
  var cats   = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  var offers = typeof OFFERS     !== 'undefined' ? OFFERS     : null;

  if (/[?&]draft/.test(location.search)) {
    try {
      var draftFile = localStorage.getItem('rabota_admin_draft:file');
      if (draftFile) {
        var d = new Function(draftFile + '\n;return { SITE: SITE, CATEGORIES: CATEGORIES, OFFERS: OFFERS };')();
        site = d.SITE || site; cats = d.CATEGORIES || cats; offers = d.OFFERS || offers;
      }
    } catch (e) { /* битый черновик — показываем боевой каталог */ }
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function t(v) { return String(v == null ? '' : v).trim(); }
  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; }
  function jobsWord(n) { return plural(n, 'вакансия', 'вакансии', 'вакансий'); }
  /* Настоящая ссылка — http(s) с доменом через точку: «https://» из пустого поля панели кнопкой не станет. */
  function okLink(u) { return /^https?:\/\/[^\/\s?#]+\.[^\/\s?#]{2,}/i.test(t(u)); }
  /* Своя вакансия без партнёрки: ссылка на Telegram (t.me/…) — кнопка ведёт в чат, пометки «Реклама» нет. */
  function isTgLink(u) { return /^https?:\/\/(t\.me|telegram\.me)\/[A-Za-z0-9_+]/i.test(t(u)); }
  function initials(s) {
    return t(s).split(/[\s,.-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase() || '?';
  }
  function announce(el, text) { clearTimeout(el._t); el.textContent = ''; el._t = setTimeout(function () { el.textContent = text; }, 60); }

  /* ── тексты сайта из панели ───────────────────────────────────────── */

  var S = site || {};
  $$('[data-s]').forEach(function (n) {
    var k = n.getAttribute('data-s');
    if (!(k in S)) return;                       // поля нет в файле — остаётся текст из разметки
    var v = t(S[k]);
    if (k === 'legal') { n.textContent = v; n.hidden = !v; return; }
    if (k === 'heroAccent') { n.textContent = v; n.hidden = !v; return; }
    if (v) n.textContent = v;
  });
  if (t(S.pageTitle)) document.title = t(S.pageTitle);
  if (t(S.metaDescription)) { var md = $('meta[name="description"]'); if (md) md.setAttribute('content', t(S.metaDescription)); }

  /* Заметка «Осторожно»: пусто и заголовок, и текст — блока нет. */
  if ('warnTitle' in S && 'warnText' in S) $('#warn').hidden = !t(S.warnTitle) && !t(S.warnText);

  /* Вопросы: показываем, только когда есть и вопрос, и ответ. */
  $$('details[data-faq]').forEach(function (det) {
    var i = det.getAttribute('data-faq'), q = 'faq' + i + 'q', a = 'faq' + i + 'a';
    if (!(q in S)) return;
    var qv = t(S[q]), av = t(S[a]);
    det.hidden = !(qv && av);
    if (qv && av) { $('summary', det).textContent = qv; $('p', det).textContent = av; }
  });

  /* Кому подойдёт — по строке на пометку. */
  if ('who' in S) {
    var who = t(S.who).split(/\n+/).map(t).filter(Boolean);
    var whoBox = $('#who');
    whoBox.innerHTML = who.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('');
    whoBox.hidden = !who.length;
  }

  /* Отзывы: показываем заполненные (имя и текст), блока нет — если ни одного. */
  (function () {
    var box = $('#revs'), sec = $('#reviews');
    if (!box || !sec || !('review1Name' in S)) return;
    var items = [];
    for (var i = 1; i <= 6; i++) {
      var name = t(S['review' + i + 'Name']), text = t(S['review' + i + 'Text']);
      if (!name || !text) continue;
      var stars = Math.max(0, Math.min(5, parseInt(t(S['review' + i + 'Stars']), 10) || 0));
      var meta = [t(S['review' + i + 'Role']), t(S['review' + i + 'City'])].filter(Boolean).join(' · ');
      var photo = t(S['review' + i + 'Photo']);
      var okPhoto = /^(https:\/\/|uploads\/|img\/)[^\s"'<>]+\.(jpe?g|png|webp|avif)$/i.test(photo);
      items.push('<li class="rev">' +
        (stars ? '<p class="rev__stars"><span aria-hidden="true">' + '★★★★★'.slice(0, stars) + '<i>' + '☆☆☆☆☆'.slice(stars) + '</i></span><span class="vh">Оценка ' + stars + ' из 5</span></p>' : '') +
        '<blockquote class="rev__text"><p>' + esc(text) + '</p></blockquote>' +
        '<div class="rev__who">' +
          (okPhoto ? '<img class="rev__ava" src="' + esc(photo) + '" alt="" width="56" height="56" loading="lazy" decoding="async">'
                   : '<span class="rev__ava rev__ava--txt" aria-hidden="true">' + esc(initials(name)) + '</span>') +
          '<p><b>' + esc(name) + '</b>' + (meta ? '<span>' + esc(meta) + '</span>' : '') + '</p>' +
        '</div></li>');
    }
    box.innerHTML = items.join('');
    sec.hidden = !items.length;
    /* На телефоне список листается вбок: тогда он должен получать фокус с клавиатуры. */
    var fit = function () {
      if (box.scrollWidth > box.clientWidth + 2) box.setAttribute('tabindex', '0'); else box.removeAttribute('tabindex');
    };
    if (items.length) { fit(); addEventListener('resize', fit, { passive: true }); }
  })();

  /* Telegram: ник, @ник или ссылка t.me — всё приводим к ссылке. */
  var tgNick = t(S.telegram).replace(/^@/, '').replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/[\/?#].*$/, '');
  var tgUrl = /^[A-Za-z0-9_]{4,32}$/.test(tgNick) ? 'https://t.me/' + tgNick : '';
  if (tgUrl) {
    var tgA = $('#tg-inline');
    tgA.href = tgUrl; tgA.target = '_blank'; tgA.rel = 'noopener';
    $('#tg-line').hidden = false;
  }

  /* ── вакансии ─────────────────────────────────────────────────────── */

  var list = $('#jobs-list');
  var status = $('#jobs-status');

  if (!offers) {
    var fail = 'Не удалось загрузить вакансии. Обновите страницу или оставьте заявку ниже — подберём сами.';
    list.innerHTML = '<li class="state">' + fail + '</li>';
    $('#open-list').innerHTML = '<li class="state">' + fail + '</li>';
    return finishPage();
  }

  var catById = {};
  cats.forEach(function (c) { catById[c.id] = c; });

  var jobs = offers.filter(function (o) { return o && !o.hidden && t(o.title || o.partner); }).map(function (o, i) {
    var brand = t(o.brand) || t(o.partner);
    return {
      id: t(o.id) || ('v' + i),
      cat: t(o.cat),
      title: t(o.title) || t(o.partner),
      tag: t(o.tag),
      partner: t(o.partner),
      brand: brand,
      headline: t(o.headline),
      note: t(o.note),
      specs: (o.specs || []).filter(function (p) { return p && (t(p[0]) || t(p[1])); }),
      url: okLink(o.url) ? t(o.url) : '',
      cta: t(o.cta),
      logo: t(o.logo),
      tone: o.tone || {}
    };
  });

  /* Должность с уточнением: «Курьер у партнёров Яндекс Еды — Беларусь».
     Одинаковые должности без уточнения различаем компанией (для списка
     заголовков экранного диктора). */
  var titleCount = {};
  jobs.forEach(function (j) { var k = (j.title + '|' + j.tag).toLowerCase(); titleCount[k] = (titleCount[k] || 0) + 1; });
  function fullName(j) { return j.title + (j.tag ? ' — ' + j.tag : ''); }

  function logoHTML(j, size, cls) {
    if (j.logo) return '<img class="' + cls + '" src="' + esc(j.logo) + '" alt="" width="' + size + '" height="' + size + '" loading="lazy" decoding="async">';
    var bg = /^#[0-9a-f]{3,6}$/i.test(t(j.tone.bg)) ? t(j.tone.bg) : '#5B16EC';
    var ink = /^#[0-9a-f]{3,6}$/i.test(t(j.tone.ink)) ? t(j.tone.ink) : '#FFFFFF';
    return '<span class="' + cls + ' lg--text" aria-hidden="true" style="background:' + bg + ';color:' + ink + '">' + esc(initials(j.brand)) + '</span>';
  }

  function cardHTML(j) {
    var cat = catById[j.cat] || {};
    var tg = isTgLink(j.url);
    var cta = j.cta || (tg ? 'Откликнуться в Telegram' : t(cat.cta) || 'Откликнуться');
    var dup = titleCount[(j.title + '|' + j.tag).toLowerCase()] > 1;
    var specs = j.specs.map(function (p) {
      var k = t(p[0]), v = t(p[1]);
      return '<li>' + (k ? '<span class="facts__k">' + esc(k) + (v ? ':' : '') + '</span> ' : '') + esc(v) + '</li>';
    }).join('');
    /* Без noreferrer: партнёрка засчитывает переход по Referer. Видимое
       «Откликнуться» стоит в начале имени ссылки дословно, хвост — для
       списка ссылок диктора. */
    var foot = tg
      ? '<a class="btn" href="' + esc(j.url) + '" target="_blank" rel="noopener">' + esc(cta) +
          '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M21.4 4.1 2.9 11.3c-1.2.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.4-1.5ZM8.4 14l9.3-5.9c.4-.3.8-.1.5.2l-7.6 6.9-.3 3.2z"/></svg>' +
          '<span class="vh">: ' + esc(fullName(j)) + ' (откроется в новой вкладке)</span></a>'
      : j.url
      ? '<a class="btn" href="' + esc(j.url) + '" target="_blank" rel="sponsored nofollow noopener">' + esc(cta) +
          '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>' +
          '<span class="vh">: ' + esc(fullName(j)) + ', ' + esc(j.brand) + ' (анкета откроется в новой вкладке)</span></a>' +
        '<p class="job__ad">Реклама · ' + esc(j.brand) + '</p>'
      : '<p class="job__soon">Отклик скоро откроется. <a href="#lead" data-job="' + esc(fullName(j)) + '" data-cat="' + esc(j.cat) + '">Оставьте заявку<span class="vh"> на вакансию «' + esc(fullName(j)) + '»</span></a> — подскажем.</p>';
    return '<li class="job" id="vac-' + esc(j.id) + '" data-cat="' + esc(j.cat) + '">' +
      '<div class="job__top">' + logoHTML(j, 44, 'lg') +
        '<div class="job__titles">' +
          '<h3>' + esc(j.title) + (j.tag ? '<span class="vh">,</span> <span class="job__tag">' + esc(j.tag) + '</span>' : '') +
            (dup ? '<span class="vh">, ' + esc(j.brand) + '</span>' : '') + '</h3>' +
          (j.partner && j.partner !== j.title ? '<p class="job__co">' + esc(j.partner) + '</p>' : '') +
        '</div></div>' +
      (j.headline ? '<p class="job__pay">' + esc(j.headline) + '</p>' : '') +
      (j.note ? '<p class="job__desc">' + esc(j.note) + '</p>' : '') +
      (specs ? '<ul class="facts" role="list">' + specs + '</ul>' : '') +
      '<div class="job__foot">' + foot + '</div>' +
    '</li>';
  }

  list.innerHTML = jobs.length ? jobs.map(cardHTML).join('')
    : '<li class="state">Скоро здесь появятся вакансии. Оставьте заявку — подберём.</li>';

  /* первый экран: число и пять первых вакансий */
  $('#open-num').textContent = jobs.length;
  $('#open-count').textContent = jobs.length + ' ' + plural(jobs.length, 'открытая вакансия', 'открытые вакансии', 'открытых вакансий');
  $('#open-list').innerHTML = jobs.slice(0, 5).map(function (j) {
    return '<li>' + logoHTML(j, 44, 'lg') + '<div><b>' + esc(fullName(j)) + '</b><span>' + esc(j.headline || j.brand) + '</span></div></li>';
  }).join('') || '<li class="state">Скоро здесь появятся вакансии.</li>';

  /* лента компаний */
  var brands = [];
  var seenBrand = {};
  jobs.forEach(function (j) { var k = j.brand.toLowerCase(); if (!seenBrand[k]) { seenBrand[k] = 1; brands.push(j); } });
  $('#brands').innerHTML = brands.map(function (j) { return '<li>' + logoHTML(j, 30, 'brands__lg') + esc(j.brand) + '</li>'; }).join('');
  $('.brands').hidden = !brands.length;

  /* строка над списком */
  var upd = t(S.updated);
  $('#jobs-meta').textContent = jobs.length ? jobs.length + ' ' + jobsWord(jobs.length) + (upd ? ' · обновлено ' + upd : '') : '';

  /* фильтры: только разделы, где есть вакансии; один раздел — фильтра нет */
  var counts = {};
  jobs.forEach(function (j) { counts[j.cat] = (counts[j.cat] || 0) + 1; });
  var shown = cats.filter(function (c) { return counts[c.id]; });
  var filters = $('#filters');
  var filter = 'all';
  if (shown.length > 1) {
    filters.innerHTML = '<button class="fbtn" type="button" data-f="all" aria-pressed="true">Все <span>' + jobs.length + '</span></button>' +
      shown.map(function (c) {
        return '<button class="fbtn" type="button" data-f="' + esc(c.id) + '" aria-pressed="false">' + esc(c.label) + ' <span>' + counts[c.id] + '</span></button>';
      }).join('');
    filters.hidden = false;
  }

  /* форма: «Какая работа интересует» — из разделов */
  var kind = $('#f-kind');
  if (shown.length) kind.innerHTML = '<option>Любая</option>' + shown.map(function (c) { return '<option>' + esc(c.label) + '</option>'; }).join('');

  function applyFilter(f, speak) {
    filter = f;
    var n = 0;
    $$('.fbtn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f)); });
    $$('.job').forEach(function (j) { var on = f === 'all' || j.getAttribute('data-cat') === f; j.hidden = !on; if (on) n++; });
    if (speak) {
      var c = catById[f];
      announce(status, (c ? c.label + ': показано ' : 'Показаны все: ') + n + ' ' + jobsWord(n));
    } else { clearTimeout(status._t); status.textContent = ''; }
  }

  /* ── переход с витрины: #vac-<id> ─────────────────────────────────── */

  var touched = false;
  ['keydown', 'wheel', 'touchstart', 'pointerdown'].forEach(function (ev) {
    addEventListener(ev, function () { touched = true; }, { once: true, passive: true, capture: true });
  });
  function showTarget(first) {
    var m = /^#vac-(.+)$/.exec(location.hash);
    $$('.job.is-target').forEach(function (j) { j.classList.remove('is-target'); });
    if (!m) return;
    var id = ''; try { id = decodeURIComponent(m[1]); } catch (e) { /* битый адрес */ }
    var card = id && document.getElementById('vac-' + id);
    var busy = first && (touched || document.activeElement !== document.body || scrollY > 40);
    if (!card) {
      if (busy) return;
      if (filter !== 'all') applyFilter('all', false);
      var h = $('#jobs-h'); h.setAttribute('tabindex', '-1');
      $('#jobs').scrollIntoView({ block: 'start' }); h.focus({ preventScroll: true });
      h.addEventListener('blur', function () { h.removeAttribute('tabindex'); }, { once: true });
      announce(status, 'Эта вакансия уже закрыта. Показаны все открытые вакансии.');
      return;
    }
    var reset = card.hidden;
    if (reset) applyFilter('all', false);
    card.classList.add('is-target');
    var h3 = $('h3', card);
    if (busy) { announce(status, '«' + h3.textContent + '» — в разделе «Вакансии».'); return; }
    card.scrollIntoView({ block: 'center' });
    h3.setAttribute('tabindex', '-1'); h3.focus({ preventScroll: true });
    h3.addEventListener('blur', function () { h3.removeAttribute('tabindex'); }, { once: true });
    if (reset) announce(status, 'Фильтр сброшен: показаны все вакансии.');
  }
  addEventListener('hashchange', function () { showTarget(false); });
  showTarget(true);

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.fbtn');
    if (b) { applyFilter(b.getAttribute('data-f'), true); return; }
    if (e.target.closest('a[href="#jobs"]') && filter !== 'all') applyFilter('all', false);
  });
  document.addEventListener('focusin', function (e) {
    var b = e.target.closest && e.target.closest('.fbtn');
    if (!b) return;
    var box = b.parentElement, l = b.offsetLeft - 16, r = b.offsetLeft + b.offsetWidth + 16 - box.clientWidth;
    if (box.scrollLeft > l) box.scrollLeft = l; else if (box.scrollLeft < r) box.scrollLeft = r;
  });

  finishPage();

  /* ── шапка, ссылка пропуска, форма ────────────────────────────────── */

  function finishPage() {
    var hdr = $('#hdr');
    var onScroll = function () { hdr.classList.toggle('is-stuck', scrollY > 8); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    document.addEventListener('click', function (e) {
      /* фокус на main только на время перехода — иначе клик по тексту уводит фокус в main */
      var skip = e.target.closest('.skip');
      if (skip) {
        var m = $('#main'); e.preventDefault();
        m.setAttribute('tabindex', '-1'); m.focus(); m.scrollIntoView();
        m.addEventListener('blur', function () { m.removeAttribute('tabindex'); }, { once: true });
        return;
      }
      /* вакансия без ссылки: переносим её в заявку и ставим курсор в первое поле */
      var job = e.target.closest('a[data-job]');
      if (job) {
        e.preventDefault();
        var c = catById[job.getAttribute('data-cat')];
        if (c) $$('option', kind).forEach(function (o) { if (o.textContent === c.label) kind.value = o.value; });
        var com = form.elements.comment, line = 'Вакансия: ' + job.getAttribute('data-job');
        if (com.value.indexOf(line) === -1) com.value = com.value ? line + '\n' + com.value : line;
        $('#lead').scrollIntoView({ block: 'start' });
        form.elements.name.focus({ preventScroll: true });
        announce(fstatus, 'Вакансия «' + job.getAttribute('data-job') + '» добавлена в заявку.');
      }
    });

    initForm();
  }

  var form, fstatus;
  function initForm() {
    form = $('#lead-form');
    fstatus = $('#form-status');
    /* GitHub Pages и прочие хостинги без PHP: заявку отправить некуда — честно говорим об этом */
    var preview = /\.github\.io$/i.test(location.hostname) || location.protocol === 'file:';
    var btn = form.querySelector('button[type=submit]');
    if (preview) { $('#preview-note').hidden = false; btn.setAttribute('aria-describedby', 'preview-note'); }

    var LABEL = { name: 'имя', contact: 'телефон или Telegram', city: 'город', consent: 'согласие на обработку данных' };
    var isTg = function (v) { return /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(v) || /t(elegram)?\.me\//i.test(v); };
    var isPhone = function (v) { return /^[+\d(][\d\s()+-]*$/.test(v) && v.replace(/\D/g, '').length >= 10; };
    var rules = {
      name: function (v) { return t(v).length >= 2 || 'Напишите имя — хотя бы 2 буквы.'; },
      contact: function (v) { v = t(v); return isTg(v) || isPhone(v) || 'Нужен телефон (+7 900 000-00-00) или ник в Telegram (@nickname).'; },
      city: function (v) { return t(v).length >= 2 || 'Напишите город и район.'; }
    };
    function check(name) {
      var el = form.elements[name];
      var res = name === 'consent' ? (el.checked || 'Без согласия отправить заявку не получится.') : rules[name](el.value);
      var err = $('#e-' + name);
      if (res === true) { el.removeAttribute('aria-invalid'); err.textContent = ''; return true; }
      el.setAttribute('aria-invalid', 'true'); err.textContent = res; return false;
    }
    ['name', 'contact', 'city'].forEach(function (n) {
      form.elements[n].addEventListener('input', function () { if (form.elements[n].getAttribute('aria-invalid')) check(n); });
    });
    form.elements.consent.addEventListener('change', function () { if (form.elements.consent.getAttribute('aria-invalid')) check('consent'); });

    function send(body, attempt) {
      return fetch('api.php?action=lead', { method: 'POST', body: body, credentials: 'same-origin' }).then(function (r) {
        if ((r.headers.get('content-type') || '').indexOf('application/json') === -1) {
          /* антибот хостинга отдаёт свою страницу с кодом 200 — пробуем ещё раз */
          if (!attempt) return new Promise(function (ok) { setTimeout(function () { ok(send(body, 1)); }, 1500); });
          throw new Error('not json');
        }
        return r.json();
      });
    }

    var sending = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      var bad = ['name', 'contact', 'city', 'consent'].filter(function (n) { return !check(n); });
      if (bad.length) {
        form.elements[bad[0]].focus();
        announce(fstatus, 'Проверьте: ' + bad.map(function (n) { return LABEL[n]; }).join(', ') + '.');
        return;
      }
      if (form.elements.site.value) return;   // бот
      if (preview) {
        announce(fstatus, 'Это превью: заявка не отправлена. Заявки начнут приходить после переноса сайта на домен.');
        return;
      }
      var contact = t(form.elements.contact.value);
      var body = new FormData();
      body.set('name', t(form.elements.name.value));
      body.set(isPhone(contact) && !isTg(contact) ? 'phone' : 'tg', contact);
      body.set('product', form.elements.kind.value || 'Любая');
      body.set('message', 'Город: ' + t(form.elements.city.value) + (t(form.elements.comment.value) ? '\n' + t(form.elements.comment.value) : ''));
      body.set('consent', '1');
      body.set('site', '');
      /* кнопку не выключаем — иначе фокус улетает со страницы; повторы гасит флаг */
      sending = true; btn.setAttribute('aria-disabled', 'true');
      announce(fstatus, 'Отправляем…');
      send(body, 0).then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.error) || 'send');
        form.reset();
        announce(fstatus, t(S.leadDone) || 'Заявка отправлена. Свяжемся с вами, как только подберём вакансию.');
      }).catch(function (err) {
        var own = err && err.message && err.message !== 'send' && err.message !== 'not json' && !(err instanceof TypeError);
        announce(fstatus, own ? err.message : 'Не получилось отправить. Проверьте интернет и попробуйте ещё раз' + (tgUrl ? ' или напишите нам в Telegram' : '') + '.');
      }).then(function () { sending = false; btn.removeAttribute('aria-disabled'); });
    });
  }
})();
