// ============================================================================
// WebAlph: Frontend Client Logic (JavaScript)
// ============================================================================
// The global `window.webalph` object is injected automatically by the runtime.
// Available methods:
//   - window.webalph.invoke(cmd_name, args)  -> returns Promise
//   - window.webalph.emit(event_name, data)  -> emits event signal to Alpha backend
//   - window.webalph.listen(event_name, cb)  -> listens for event signal from Alpha
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
// 1. RPC Command invocation: "greet" (Greeting by name)
// ----------------------------------------------------------------------------
document.getElementById('btnGreet').addEventListener('click', async () => {
  const name = document.getElementById('nameInput').value || 'Alpha Developer';
  try {
    log(`Sending 'greet' call with argument: name="${name}"`);
    // Call handle_greet function in Alpha backend and wait for result:
    const res = await window.webalph.invoke('greet', { name: name });
    resultBox.innerText = res;
    log(`Response from Alpha backend: ${res}`);
  } catch (err) {
    resultBox.innerText = "Error: " + err;
    log(`Error: ${err}`);
  }
});

// ----------------------------------------------------------------------------
// 2. RPC Command invocation: "calculate" (Addition on the backend)
// ----------------------------------------------------------------------------
document.getElementById('btnCalc').addEventListener('click', async () => {
  const a = parseInt(document.getElementById('numA').value, 10);
  const b = parseInt(document.getElementById('numB').value, 10);
  try {
    log(`Sending 'calculate' call (a=${a}, b=${b})`);
    // Call handle_calculate function in Alpha backend:
    const sum = await window.webalph.invoke('calculate', { a: a, b: b });
    resultBox.innerText = `${a} + ${b} = ${sum} (Calculated on Alpha backend)`;
    log(`Calculation result: ${sum}`);
  } catch (err) {
    resultBox.innerText = "Error: " + err;
    log(`Error: ${err}`);
  }
});

// ----------------------------------------------------------------------------
// 3. RPC Command invocation: "get_system_info" (System Information)
// ----------------------------------------------------------------------------
document.getElementById('btnSysInfo').addEventListener('click', async () => {
  try {
    log("Requesting system info from Alpha backend...");
    const info = await window.webalph.invoke('get_system_info', {});
    resultBox.innerText = JSON.stringify(info, null, 2);
    log("System info received successfully.");
  } catch (err) {
    resultBox.innerText = "Error: " + err;
    log(`Error: ${err}`);
  }
});

// ----------------------------------------------------------------------------
// 4. Emit one-way event "ping" to Alpha backend
// ----------------------------------------------------------------------------
document.getElementById('btnEmit').addEventListener('click', () => {
  log("Emitting 'ping' event to Alpha backend...");
  window.webalph.emit('ping', { timestamp: Date.now(), client: 'WebAlph UI' });
});

// ----------------------------------------------------------------------------
// 5. Listen for incoming event "pong" from Alpha backend
// ----------------------------------------------------------------------------
window.webalph.listen('pong', (data) => {
  log(`Received 'pong' event from Alpha: ${JSON.stringify(data)}`);
});
