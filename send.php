<?php
// Заявка с формы: проверка, защита от ботов и частых отправок, CSV в закрытой папке, сообщение в Telegram.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$cfgFile = __DIR__ . '/send-config.php';
$cfg = is_file($cfgFile) ? (require $cfgFile) : [];
date_default_timezone_set($cfg['tz'] ?? 'Europe/Moscow');
$priv = !empty($cfg['private_dir']) ? $cfg['private_dir'] : dirname(__DIR__) . '/.smena-private';
if (!is_dir($priv)) @mkdir($priv, 0700, true);

function out(bool $ok, string $error = '', int $code = 200) { http_response_code($code); echo json_encode(['ok' => $ok, 'error' => $error], JSON_UNESCAPED_UNICODE); exit; }
function clean($v, int $max) { $v = trim(preg_replace('/\s+/u', ' ', (string)$v)); return mb_substr($v, 0, $max); }

$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in)) out(false, 'Пустая заявка.', 400);
// ловушка для ботов: отвечаем «успех», но заявку не теряем молча — пишем в отдельный журнал
if (!empty($in['website'])) { @file_put_contents("$priv/honeypot.log", date('c') . ' ' . substr(json_encode($in, JSON_UNESCAPED_UNICODE), 0, 600) . "\n", FILE_APPEND | LOCK_EX); out(true); }

$name = clean($in['name'] ?? '', 60);
$contact = clean($in['contact'] ?? '', 60);
$city = clean($in['city'] ?? '', 80);
$kind = clean($in['kind'] ?? '', 20);
$comment = clean($in['comment'] ?? '', 500);
if (mb_strlen($name) < 2 || mb_strlen($city) < 2) out(false, 'Проверьте имя и город.', 422);
$isPhone = preg_match('/^[+\d(][\d\s()+-]*$/', $contact) && strlen(preg_replace('/\D/', '', $contact)) >= 10;
if (!preg_match('/^@?[A-Za-z0-9_]{5,32}$/', $contact) && !$isPhone) out(false, 'Нужен телефон или ник в Telegram.', 422);
if (empty($in['consent'])) out(false, 'Нужно согласие на обработку данных.', 422);

// не чаще 3 заявок за 10 минут с одного адреса
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$rlFile = "$priv/rate.json";
$rl = is_file($rlFile) ? (json_decode((string)file_get_contents($rlFile), true) ?: []) : [];
$now = time();
foreach ($rl as $k => $ts) { $rl[$k] = array_values(array_filter($ts, function ($t) use ($now) { return $now - $t < 600; })); if (!$rl[$k]) unset($rl[$k]); }
$key = hash('sha256', $ip);
if (count($rl[$key] ?? []) >= 3) out(false, 'Слишком много заявок подряд. Попробуйте через 10 минут.', 429);
$rl[$key][] = $now;
file_put_contents($rlFile, json_encode($rl), LOCK_EX);

// CSV — копия на случай, если телеграм недоступен
$csv = "$priv/leads.csv";
$fh = fopen($csv, 'a');
if ($fh) { flock($fh, LOCK_EX); if (filesize($csv) === 0) fputcsv($fh, ['Дата', 'Имя', 'Контакт', 'Город', 'Работа', 'Комментарий'], ';', '"', ''); fputcsv($fh, [date('Y-m-d H:i:s'), $name, $contact, $city, $kind, $comment], ';', '"', ''); flock($fh, LOCK_UN); fclose($fh); @chmod($csv, 0600); }

// Telegram
$sent = false;
$token = $cfg['token'] ?? '';
$chats = array_filter(array_map('trim', explode(',', (string)($cfg['chat_ids'] ?? ''))));
if ($token && $chats) {
    $h = function ($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); };
    $text = "🟣 <b>Заявка с сайта «Работа просто»</b>\n\nИмя: " . $h($name) . "\nКонтакт: " . $h($contact) . "\nГород: " . $h($city) . "\nРабота: " . $h($kind ?: 'любая') . ($comment ? "\nКомментарий: " . $h($comment) : '');
    foreach ($chats as $chat) {
        $ch = curl_init("https://api.telegram.org/bot$token/sendMessage");
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
            CURLOPT_POSTFIELDS => ['chat_id' => $chat, 'text' => $text, 'parse_mode' => 'HTML']]);
        $res = json_decode((string)curl_exec($ch), true);
        curl_close($ch);
        $sent = $sent || !empty($res['ok']);
    }
}
out(true);
