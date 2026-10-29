# WebAlph Internal Architecture & Protocol

This document covers the internal design of **WebAlph** and how data flows between the native Alpha runtime and the web engine.

---

## 1. System Overview

```
┌────────────────────────────────────────────────────────┐
│                      Web UI (JS)                       │
│  window.webalph.invoke("calculate", { a: 40, b: 2 })   │
└───────────────────────────┬────────────────────────────┘
                            │ window.ipc.postMessage(JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Native Engine Layer (Rust / wry / tao)      │
│  - EventLoop (EventLoopBuilder::<String>::with_user_event)
│  - System WebView (Edge WebView2 / WebKit)             │
│  - Thread-safe Event Proxy                             │
└───────────────────────────┬────────────────────────────┘
                            │ Event::UserEvent(json_string)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Core Alpha Runtime (Core/Webview.alpha)     │
│  - Webview.on_message callback trigger                 │
└───────────────────────────┬────────────────────────────┘
                            │ raw_json string
                            ▼
┌────────────────────────────────────────────────────────┐
│            WebAlph Library (Pure Alpha)                │
│  - ipc.alpha: JSON parser & command dispatcher         │
│  - app.alpha: App.command("calculate", handler)        │
│  - events.alpha: Bi-directional Event Bus              │
└───────────────────────────┬────────────────────────────┘
                            │ Evaluates JS resolution script:
                            │ window.__webalph_resolve(id, 42, false);
                            ▼
┌────────────────────────────────────────────────────────┐
│                 WebView Script Execution               │
│  - webview.evaluate_script(...)                        │
│  - Promise in JS resolves with 42                      │
└───────────────────────────┬────────────────────────────┘
```

---

## 2. Wire Protocol (JSON-RPC)

All communication between JavaScript and Alpha uses structured JSON packets.

### 2.1. RPC Command Invocation (`invoke`)

**JavaScript sends:**
```json
{
  "type": "invoke",
  "cmd": "calculate",
  "id": 1,
  "args": {
    "a": 40,
    "b": 2
  }
}
```

**Alpha executes handler and responds with script evaluation:**
- On success:
  ```javascript
  window.__webalph_resolve(1, 42, false);
  ```
- On error:
  ```javascript
  window.__webalph_resolve(1, "Error message string", true);
  ```

### 2.2. Events (`emit`)

**JavaScript to Alpha:**
```json
{
  "type": "emit",
  "event": "button_clicked",
  "payload": { "id": "submit" }
}
```

**Alpha to JavaScript:**
```javascript
window.__webalph_dispatch("sync_status", { "ready": true });
```
