// Настройки ленда агентства «Работа просто».
// source — откуда брать вакансии. Если витрина финпредложений запущена, укажи её data.php?cat=hr:
//   вакансии правятся в том же телеграм-боте и сразу появляются здесь.
// Пусто — берутся из локального data.json.
window.SMENA = {
  source: 'https://daviddavidso.github.io/efir-vitrina/data.json',   // превью; на боевом — https://<витрина>/data.php?cat=hr
  telegram: '',            // ник или ссылка для кнопки «Напишите нам в Telegram», например '@rabota_prosto'
  send: 'send.php'         // куда уходит форма заявки
};
