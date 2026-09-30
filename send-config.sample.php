<?php
// Скопируй в send-config.php. Файл закрыт от браузера (.htaccess).
return [
    // Токен бота от @BotFather — можно тот же, что у бота витрины
    'token' => '',
    // Кому слать заявки: chat_id через запятую. Узнать свой id — написать @userinfobot
    'chat_ids' => '',
    // Где хранить CSV с заявками. Пусто — папка .smena-private над корнем сайта
    'private_dir' => '',
    // Часовой пояс для дат в заявках
    'tz' => 'Europe/Moscow',
];
