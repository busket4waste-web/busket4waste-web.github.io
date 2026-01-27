/**
 * Веб-приложение для приёма ответов прототипа «Чаевые» в Google Таблицу.
 *
 * Как использовать:
 * 1. Создайте Google Таблицу с заголовками в первой строке: Цель | Показывать цель | Показывать фото | Время
 * 2. В таблице: Расширения → Apps Script. Удалите шаблон и вставьте этот скрипт целиком.
 * 3. Сохраните, затем Развёртывание → Новое развёртывание → Веб-приложение.
 * 4. «Выполнять от имени»: вы; «У кого есть доступ»: любой пользователь.
 * 5. Скопируйте URL веб-приложения (…/exec) и подставьте в index.html в window.TEST_SUBMIT_URL.
 *
 * Прототип шлёт POST с телом application/x-www-form-urlencoded: goal, show_goal, show_photo, sent_at.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var raw = (e.postData && e.postData.contents) ? e.postData.contents : '';
  var params = parseFormUrlEncoded(raw);

  var goal = params.goal || '';
  var showGoal = params.show_goal || '';
  var showPhoto = params.show_photo || '';
  var sentAt = params.sent_at || '';

  sheet.appendRow([goal, showGoal, showPhoto, sentAt]);

  return ContentService.createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Парсит application/x-www-form-urlencoded строку в объект ключ → значение.
 */
function parseFormUrlEncoded(str) {
  var out = {};
  if (!str) return out;
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var idx = pairs[i].indexOf('=');
    var key = idx >= 0 ? pairs[i].substring(0, idx) : pairs[i];
    var value = idx >= 0 ? pairs[i].substring(idx + 1) : '';
    try {
      key = decodeURIComponent(key.replace(/\+/g, ' '));
      value = decodeURIComponent(value.replace(/\+/g, ' '));
    } catch (err) {
      // оставляем как есть при ошибке декодирования
    }
    out[key] = value;
  }
  return out;
}
