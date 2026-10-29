// ============================================================================
// WebAlph: Клиентская логика веб-интерфейса (JavaScript)
// ============================================================================
// Глобальный объект window.webalph внедрен рантаймом автоматически.
// Доступные методы:
//   - window.webalph.invoke(имя_команды, аргументы) -> возвращает Promise
//   - window.webalph.emit(имя_события, данные)       -> отправка сигнала в Alpha
//   - window.webalph.listen(имя_события, callback)   -> прием сигнала из Alpha
// ============================================================================

function log(msg) {
  const box = document.getElementById('logBox');
  if (!box) return;
  const item = document.createElement('div');
  item.className = 'log-item';
  const time = new Date().toLocaleTimeString();
  item.innerHTML = `<span class="log-time">[${time}]</span><span class="log-msg">${msg}</span>`;
  box.appendChild(item);
  box.scrollTop = box.scrollHeight;
}

const resultBox = document.getElementById('resultBox');

// ----------------------------------------------------------------------------
// 1. Вызов RPC-команды "greet" (Приветствие)
// ----------------------------------------------------------------------------
document.getElementById('btnGreet').addEventListener('click', async () => {
  const name = document.getElementById('nameInput').value || 'Alpha Developer';
  try {
    log(`Отправка вызова 'greet' с аргументом: name="${name}"`);
    // Вызываем функцию handle_greet в Alpha и ждем результат:
    const res = await window.webalph.invoke('greet', { name: name });
    resultBox.innerText = res;
    log(`Ответ от бэкенда Alpha: ${res}`);
  } catch (err) {
    resultBox.innerText = "Ошибка: " + err;
    log(`Ошибка: ${err}`);
  }
});

// ----------------------------------------------------------------------------
// 2. Вызов RPC-команды "calculate" (Сложение чисел на бэкенде)
// ----------------------------------------------------------------------------
document.getElementById('btnCalc').addEventListener('click', async () => {
  const a = parseInt(document.getElementById('numA').value, 10);
  const b = parseInt(document.getElementById('numB').value, 10);
  try {
    log(`Отправка вызова 'calculate' (a=${a}, b=${b})`);
    // Вызываем функцию handle_calculate в Alpha:
    const sum = await window.webalph.invoke('calculate', { a: a, b: b });
    resultBox.innerText = `${a} + ${b} = ${sum} (Вычислено на бэкенде Alpha)`;
    log(`Результат вычисления: ${sum}`);
  } catch (err) {
    resultBox.innerText = "Ошибка: " + err;
    log(`Ошибка: ${err}`);
  }
});

// ----------------------------------------------------------------------------
// 3. Вызов RPC-команды "get_system_info" (Системная информация)
// ----------------------------------------------------------------------------
document.getElementById('btnSysInfo').addEventListener('click', async () => {
  try {
    log("Запрос системной информации из Alpha бэкенда...");
    const info = await window.webalph.invoke('get_system_info', {});
    resultBox.innerText = JSON.stringify(info, null, 2);
    log("Системная информация успешно получена.");
  } catch (err) {
    resultBox.innerText = "Ошибка: " + err;
    log(`Ошибка: ${err}`);
  }
});

// ----------------------------------------------------------------------------
// 4. Отправка одностороннего события "ping" в Alpha
// ----------------------------------------------------------------------------
document.getElementById('btnEmit').addEventListener('click', () => {
  log("Отправка события 'ping' в Alpha бэкенд...");
  window.webalph.emit('ping', { timestamp: Date.now(), client: 'WebAlph UI' });
});

// ----------------------------------------------------------------------------
// 5. Прослушивание входящего события "pong" из Alpha
// ----------------------------------------------------------------------------
window.webalph.listen('pong', (data) => {
  log(`Получено событие 'pong' от Alpha: ${JSON.stringify(data)}`);
});
