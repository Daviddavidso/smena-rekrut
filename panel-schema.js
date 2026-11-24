/* ==========================================================================
   СХЕМА САЙТА «РАБОТА ПРОСТО» ДЛЯ ЯДРА ПАНЕЛИ (panel-core.js).

   Ядро одинаковое во всех сайтах и про формат data.js ничего не знает.
   Здесь сказано только: какие поля у текстов, разделов и вакансий и как
   разложить общий вид обратно в файл, который читает сайт:
   SITE / CATEGORIES / OFFERS.

   Особенности:
     * раздел = кнопка-фильтр над списком («Курьеры», «Склады и сборка»…);
     * у вакансии есть постоянный id — на него ведут ссылки с витрины
       (адрес сайта#vac-<id>), поэтому он переживает переименование;
     * под кнопкой партнёрской вакансии печатается «Реклама · компания»
       (erid на сайте не показывается — по просьбе клиента 24.11.2026);
     * своя вакансия: в ссылке t.me/ник — кнопка «Откликнуться в Telegram»,
       без пометки «Реклама»;
     * отзывы — до 6 штук в текстах сайта (review1… review6).
   ========================================================================== */

window.ADMIN = {
  brand: 'Работа просто',
  dataFile: 'data.js',
  draftKey: 'rabota_admin_draft',
  preview: 'index.html?draft=1',

  /* erid на сайте не показываем и не требуем (просьба клиента 24.11.2026). */
  requireErid: false,

  logo: true,
  surface: '#ffffff',
  defaultTone: { bg: '#5B16EC', ink: '#FFFFFF' },

  presets: [
    { label: 'Компании на сайте', items: [
      { name: 'Яндекс Еда', value: 'img/logos/yandexeda.png' },
      { name: 'Яндекс Лавка', value: 'img/logos/yandexlavka.png' },
      { name: 'Яндекс Маркет', value: 'img/logos/yandexmarket.png' },
      { name: 'Заряд от Магнита', value: 'img/logos/zaryad.svg' },
      { name: 'Купер', value: 'img/logos/kuper.png' },
      { name: 'Достависта', value: 'img/logos/dostavista.png' },
      { name: 'Яндекс Смена', value: 'img/logos/yandexsmena.png' },
      { name: 'OZON', value: 'img/logos/ozon.png' },
      { name: 'Альфа-Банк', value: 'img/logos/alfabank.png' },
      { name: 'Т-Банк', value: 'img/logos/tbank.png' },
      { name: 'Efin', value: 'img/logos/efin.png' },
      { name: 'МТС', value: 'img/logos/mts.png' },
      { name: 'Тетрика', value: 'img/logos/tetrika.png' },
      { name: 'Руки', value: 'img/logos/ruki.png' }
    ] },
    { label: 'Другие компании', items: [
      { name: 'Wildberries', value: 'img/logos/wildberries.png' },
      { name: 'ВкусВилл', value: 'img/logos/vkusvill.png' },
      { name: 'Додо Пицца', value: 'img/logos/dodo.png' },
      { name: 'Магнит', value: 'img/logos/magnit.png' },
      { name: 'Пятёрочка', value: 'img/logos/pyaterochka.png' },
      { name: 'Самокат', value: 'img/logos/samokat.png' }
    ] }
  ],

  /* Тексты сайта по блокам страницы, сверху вниз. */
  site: [
    { section: 'Название и контакты', sectionHint: 'вкладка браузера, подвал, Telegram, реквизиты',
      key: 'brand', label: 'Название агентства', required: true,
      hint: 'В подвале и в заголовке вкладки. Логотип в шапке — картинка, он от этого поля не меняется.' },
    { key: 'pageTitle', label: 'Заголовок вкладки браузера', required: true,
      hint: 'Его видно на вкладке и в поиске Яндекса и Google.' },
    { key: 'metaDescription', label: 'Описание для поисковиков', textarea: true,
      hint: 'Одно-два предложения: их показывают под ссылкой в поиске.' },
    { key: 'telegram', label: 'Telegram для связи',
      hint: 'Ник (@name) или ссылка t.me/… Пока пусто — строки «Напишите нам в Telegram» нет.' },
    { key: 'legal', label: 'Реквизиты', textarea: true,
      hint: 'ИП или ООО, ИНН, ОГРН — для доверия соискателей. Пусто — в подвале строка-напоминание не показывается.' },
    { key: 'updated', label: 'Дата проверки вакансий',
      hint: 'Печатается над списком: «обновлено 24.11.2026».' },

    { section: 'Первый экран', sectionHint: 'заголовок, текст, три преимущества',
      key: 'heroPill', label: 'Метка над заголовком', hint: 'Например «Рекрутинговое агентство».' },
    { key: 'heroTitle', label: 'Заголовок, чёрная часть', required: true },
    { key: 'heroAccent', label: 'Заголовок, фиолетовая часть', hint: 'Можно оставить пустой.' },
    { key: 'heroLead', label: 'Текст под заголовком', textarea: true },
    { key: 'trust1Title', label: 'Преимущество 1: заголовок' },
    { key: 'trust1Text', label: 'Преимущество 1: текст', wide: true },
    { key: 'trust2Title', label: 'Преимущество 2: заголовок' },
    { key: 'trust2Text', label: 'Преимущество 2: текст', wide: true },
    { key: 'trust3Title', label: 'Преимущество 3: заголовок' },
    { key: 'trust3Text', label: 'Преимущество 3: текст', wide: true },
    { key: 'openTitle', label: 'Заголовок карточки справа', hint: 'Над пятью первыми вакансиями: «Сейчас открыто».' },

    { section: 'Вакансии', sectionHint: 'заголовок над списком',
      key: 'jobsKicker', label: 'Метка блока' },
    { key: 'jobsTitle', label: 'Заголовок', required: true },
    { key: 'jobsLead', label: 'Текст справа от заголовка', textarea: true },

    { section: 'Как устроено', sectionHint: 'четыре шага и «кому подойдёт»',
      key: 'howTitle', label: 'Заголовок', required: true },
    { key: 'howLead', label: 'Текст справа', textarea: true },
    { key: 'step1Title', label: 'Шаг 1: заголовок' }, { key: 'step1Text', label: 'Шаг 1: текст', wide: true },
    { key: 'step2Title', label: 'Шаг 2: заголовок' }, { key: 'step2Text', label: 'Шаг 2: текст', wide: true },
    { key: 'step3Title', label: 'Шаг 3: заголовок' }, { key: 'step3Text', label: 'Шаг 3: текст', wide: true },
    { key: 'step4Title', label: 'Шаг 4: заголовок' }, { key: 'step4Text', label: 'Шаг 4: текст', wide: true },
    { key: 'who', label: 'Кому подойдёт', textarea: true, hint: 'По строке на пометку: «Без опыта», «Студентам».' },

    { section: 'Отзывы', sectionHint: 'до 6 отзывов; отзыв без имени или текста не показывается',
      key: 'reviewsKicker', label: 'Метка блока' },
    { key: 'reviewsTitle', label: 'Заголовок' },
    { key: 'reviewsLead', label: 'Текст справа от заголовка', textarea: true,
      hint: 'Все отзывы пустые — блока на сайте нет. Пишите только настоящие отзывы, с разрешения людей.' },
    { key: 'review1Name', label: 'Отзыв 1: имя', hint: 'Имя и фамилия или только имя.' },
    { key: 'review1Role', label: 'Отзыв 1: вакансия', hint: 'Например «Курьер Яндекс Еды».' },
    { key: 'review1City', label: 'Отзыв 1: город' },
    { key: 'review1Stars', label: 'Отзыв 1: оценка 1–5', hint: 'Цифра от 1 до 5 — столько звёзд. Пусто — без звёзд.' },
    { key: 'review1Photo', label: 'Отзыв 1: фото', wide: true, hint: 'Ссылка на фото (https://…jpg) или путь uploads/имя.jpg. Пусто — кружок с инициалами.' },
    { key: 'review1Text', label: 'Отзыв 1: текст', textarea: true },
    { key: 'review2Name', label: 'Отзыв 2: имя', hint: '' },
    { key: 'review2Role', label: 'Отзыв 2: вакансия', hint: '' },
    { key: 'review2City', label: 'Отзыв 2: город' },
    { key: 'review2Stars', label: 'Отзыв 2: оценка 1–5', hint: '' },
    { key: 'review2Photo', label: 'Отзыв 2: фото', wide: true, hint: '' },
    { key: 'review2Text', label: 'Отзыв 2: текст', textarea: true },
    { key: 'review3Name', label: 'Отзыв 3: имя', hint: '' },
    { key: 'review3Role', label: 'Отзыв 3: вакансия', hint: '' },
    { key: 'review3City', label: 'Отзыв 3: город' },
    { key: 'review3Stars', label: 'Отзыв 3: оценка 1–5', hint: '' },
    { key: 'review3Photo', label: 'Отзыв 3: фото', wide: true, hint: '' },
    { key: 'review3Text', label: 'Отзыв 3: текст', textarea: true },
    { key: 'review4Name', label: 'Отзыв 4: имя', hint: '' },
    { key: 'review4Role', label: 'Отзыв 4: вакансия', hint: '' },
    { key: 'review4City', label: 'Отзыв 4: город' },
    { key: 'review4Stars', label: 'Отзыв 4: оценка 1–5', hint: '' },
    { key: 'review4Photo', label: 'Отзыв 4: фото', wide: true, hint: '' },
    { key: 'review4Text', label: 'Отзыв 4: текст', textarea: true },
    { key: 'review5Name', label: 'Отзыв 5: имя', hint: '' },
    { key: 'review5Role', label: 'Отзыв 5: вакансия', hint: '' },
    { key: 'review5City', label: 'Отзыв 5: город' },
    { key: 'review5Stars', label: 'Отзыв 5: оценка 1–5', hint: '' },
    { key: 'review5Photo', label: 'Отзыв 5: фото', wide: true, hint: '' },
    { key: 'review5Text', label: 'Отзыв 5: текст', textarea: true },
    { key: 'review6Name', label: 'Отзыв 6: имя', hint: '' },
    { key: 'review6Role', label: 'Отзыв 6: вакансия', hint: '' },
    { key: 'review6City', label: 'Отзыв 6: город' },
    { key: 'review6Stars', label: 'Отзыв 6: оценка 1–5', hint: '' },
    { key: 'review6Photo', label: 'Отзыв 6: фото', wide: true, hint: '' },
    { key: 'review6Text', label: 'Отзыв 6: текст', textarea: true },

    { section: 'Заявка', sectionHint: 'тёмный блок с формой «Не нашли подходящую?»',
      key: 'leadTitle', label: 'Заголовок', required: true },
    { key: 'leadText', label: 'Текст слева от формы', textarea: true },
    { key: 'leadDone', label: 'Сообщение после отправки', textarea: true,
      hint: 'Заявки смотрите ниже, в разделе «Заявки» этой панели, — туда же подключается Telegram-бот.' },

    { section: 'Вопросы и подвал', sectionHint: 'до 6 вопросов; пустой вопрос не показывается',
      key: 'faq1q', label: 'Вопрос 1', wide: true }, { key: 'faq1a', label: 'Ответ 1', textarea: true },
    { key: 'faq2q', label: 'Вопрос 2', wide: true }, { key: 'faq2a', label: 'Ответ 2', textarea: true },
    { key: 'faq3q', label: 'Вопрос 3', wide: true }, { key: 'faq3a', label: 'Ответ 3', textarea: true },
    { key: 'faq4q', label: 'Вопрос 4', wide: true }, { key: 'faq4a', label: 'Ответ 4', textarea: true },
    { key: 'faq5q', label: 'Вопрос 5', wide: true }, { key: 'faq5a', label: 'Ответ 5', textarea: true },
    { key: 'faq6q', label: 'Вопрос 6', wide: true }, { key: 'faq6a', label: 'Ответ 6', textarea: true,
      hint: 'Вопрос показывается, только когда заполнены и он, и ответ.' },
    { key: 'warnTitle', label: 'Жёлтая заметка: заголовок' },
    { key: 'warnText', label: 'Жёлтая заметка: текст', textarea: true, hint: 'Пусто вместе с заголовком — заметки нет.' },
    { key: 'footerNote', label: 'Строка в подвале', textarea: true }
  ],

  groups: [
    { key: 'title', label: 'Название раздела', required: true,
      hint: 'Кнопка-фильтр над вакансиями: «Курьеры», «Склады и сборка».' },
    { key: 'cta', label: 'Надпись на кнопках', required: true,
      hint: 'Одна на все вакансии раздела: «Откликнуться».' }
  ],

  card: [
    { key: 'title', label: 'Должность', required: true,
      hint: 'Крупно в карточке: «Пеший курьер», «Кладовщик даркстора».' },
    { key: 'tag', label: 'Уточнение к должности',
      hint: 'Мелко рядом с должностью: страна («Беларусь») или формат («вахта»). Если должности совпадают — обязательно.' },
    { key: 'partner', label: 'Кто нанимает', required: true,
      hint: 'Строка под должностью: «Купер», «Партнёр сервиса Яндекс Лавка». Для Яндекс Еды и Лавки партнёрка требует писать, что набор идёт к партнёру сервиса.' },
    { key: 'brand', label: 'Компания коротко',
      hint: 'Для пометки «Реклама · …» под кнопкой и ленты логотипов: «Яндекс Еда». Пусто — берётся «Кто нанимает».' },
    { key: 'headline', label: 'Главное условие', required: true,
      hint: 'Фиолетовая строка: «Доход до 5 500 ₽ за смену». Цифры — только те, что дала партнёрка, слово в слово.' },
    { key: 'note', label: 'Описание', type: 'textarea',
      hint: 'Два-три предложения: что делать и чем хороша вакансия.' },
    { key: 'specs', label: 'Условия', type: 'pairs',
      hint: 'По строке на условие, через двоеточие: «График: 2/2». На сайте — серые плашки.' },
    { key: 'url', label: 'Ссылка для отклика', type: 'url',
      hint: 'Ссылку из партнёрки — целиком. Своя вакансия без партнёрки — ссылка на ваш Telegram (t.me/ник): кнопка «Откликнуться в Telegram», без пометки «Реклама». Пусто — строка «Отклик скоро откроется».' },
    { key: 'cta', label: 'Надпись на кнопке', 
      hint: 'Необязательно. Пусто — как у раздела («Откликнуться») или «Откликнуться в Telegram» для ссылки t.me.' }
  ],

  /* ---------------------------------------------- чтение --------------- */

  load: function () {
    function str(v) { return v == null ? '' : String(v); }
    function extraOf(obj, known) {
      var x = {};
      Object.keys(obj).forEach(function (k) { if (known.indexOf(k) === -1) x[k] = obj[k]; });
      return x;
    }
    function slug(s) {
      var map = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };
      return String(s || '').toLowerCase().replace(/[а-яё]/g, function (c) { return map[c]; })
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    }

    var GKEYS = ['id', 'label', 'cta'];
    var groups = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).map(function (c) {
      return { key: str(c.id), title: str(c.label), cta: str(c.cta), extra: extraOf(c, GKEYS) };
    });

    var KEYS = ['id', 'cat', 'title', 'tag', 'partner', 'brand', 'logo', 'tone', 'headline', 'note', 'specs', 'url', 'cta', 'hidden'];
    var seen = {};
    var cards = (typeof OFFERS !== 'undefined' ? OFFERS : []).map(function (o, i) {
      var base = str(o.id) || slug(str(o.partner) + '-' + str(o.title) + '-' + str(o.tag)) || ('v' + i);
      var uid = base, n = 2;
      while (seen[uid]) uid = base + '-' + (n++);
      seen[uid] = true;
      return {
        uid: uid,
        group: str(o.cat),
        hidden: !!o.hidden,
        title: str(o.title),
        tag: str(o.tag),
        partner: str(o.partner),
        brand: str(o.brand),
        headline: str(o.headline),
        note: str(o.note),
        specs: (o.specs || []).map(function (p) { return [str(p && p[0]), str(p && p[1])]; }),
        url: str(o.url),
        cta: str(o.cta),
        logo: str(o.logo),
        tone: { bg: (o.tone && o.tone.bg) || '#5B16EC', ink: (o.tone && o.tone.ink) || '#FFFFFF' },
        extra: extraOf(o, KEYS)
      };
    });

    return {
      SITE: JSON.parse(JSON.stringify(typeof SITE !== 'undefined' ? SITE : {})),
      GROUPS: groups,
      CARDS: cards
    };
  },

  /* ---------------------------------------------- сборка файла --------- */

  build: function (m) {
    function js(v) { return JSON.stringify(v, null, 2); }
    function t(v) { return String(v == null ? '' : v).trim(); }

    var site = {};
    Object.keys(m.SITE || {}).forEach(function (k) {
      var v = m.SITE[k];
      site[k] = typeof v === 'string' ? v.trim() : v;
    });

    var categories = m.GROUPS.map(function (g) {
      var c = { id: g.key, label: t(g.title), cta: t(g.cta) || 'Откликнуться' };
      Object.keys(g.extra || {}).forEach(function (k) { c[k] = g.extra[k]; });
      return c;
    });

    /* id новой карточки ядро даёт служебный (c-…): для адреса #vac- это
       некрасиво, но работает; уже выданные id не меняем никогда. */
    var offers = m.CARDS.map(function (c) {
      var o = {
        id: c.uid,
        cat: c.group,
        title: t(c.title),
        tag: t(c.tag),
        partner: t(c.partner),
        brand: t(c.brand),
        logo: t(c.logo),
        tone: { bg: t(c.tone && c.tone.bg) || '#5B16EC', ink: t(c.tone && c.tone.ink) || '#FFFFFF' },
        headline: t(c.headline),
        note: t(c.note),
        specs: (c.specs || [])
          .map(function (p) { return [t(p[0]), t(p[1])]; })
          .filter(function (p) { return p[0] || p[1]; }),
        url: t(c.url)
      };
      if (t(c.cta)) o.cta = t(c.cta);
      if (c.hidden) o.hidden = true;
      Object.keys(c.extra || {}).forEach(function (k) { o[k] = c.extra[k]; });
      return o;
    });

    return [
      '/* ═════════════════════════════════════════════════════════════════════════',
      '   «' + (t(site.brand) || 'Работа просто').toUpperCase() + '» — тексты сайта, разделы и вакансии.',
      '   Собран панелью ' + new Date().toLocaleString('ru-RU') + '.',
      '',
      '   Правится через panel.html. Руками тоже можно, но при следующем',
      '   сохранении из панели правки будут перезаписаны.',
      '',
      '   SITE        — тексты страницы по блокам.',
      '   CATEGORIES  — разделы (кнопки-фильтры над вакансиями).',
      '   OFFERS      — вакансии. Порядок в файле = порядок на сайте.',
      '     id        — якорь вакансии (#vac-<id>), на него ведут ссылки с витрины;',
      '     partner   — кто нанимает; brand — компания коротко (для «Реклама»);',
      '     tag       — страна/формат; headline — главное условие; note — описание;',
      '     specs     — условия «Ключ: значение»; url — партнёрская ссылка или t.me/… для своей;',
      '     cta       — своя надпись на кнопке (необязательно).',
      '',
      '   ВАЖНО ПРО ЦИФРЫ: доход и выплаты — только те, что дала партнёрка,',
      '   слово в слово. Для Яндекс Еды и Лавки: набор — к ПАРТНЁРУ сервиса,',
      '   без формулировок о трудовых отношениях с сервисом.',
      '   ═════════════════════════════════════════════════════════════════════════ */',
      '',
      'const SITE = ' + js(site) + ';',
      '',
      '/* label — название раздела (кнопка-фильтр); cta — надпись на кнопках вакансий раздела. */',
      'const CATEGORIES = ' + js(categories) + ';',
      '',
      'const OFFERS = ' + js(offers) + ';',
      ''
    ].join('\n');
  }
};
