# Step-by-Step Guide: Building Desktop Apps with WebAlph from Scratch

This guide explains **WebAlph** in simple, beginner-friendly terms and walks you through creating a native desktop application step-by-step from zero.

---

## What is WebAlph in Plain English?

WebAlph is built around a straightforward concept:
1. **Frontend (User Interface)** — A standard web page (HTML, CSS, JavaScript). This is where you design buttons, forms, tables, and graphs using your favorite tools.
2. **Backend (Application Logic)** — Code written in the **Alpha** programming language. This is where you handle file system operations, heavy calculations, databases, and OS APIs.
3. **Bridge (IPC)** — A lightweight communication channel that lets JavaScript in the browser call functions written in Alpha and receive the results asynchronously.

There is no heavy Chromium bundle — WebAlph relies on your operating system's built-in web engine (Microsoft Edge WebView2 on Windows, Apple WebKit on macOS, WebKitGTK on Linux).

---

## Step 1: The Simplest Window (5 Lines of Code)

Let's start by creating the absolute minimal desktop window.

Create a file named `src/main.alpha`:

```alpha
import Core/Basic.alpha
import "../../src/lib.alpha"

function main() [here, nothing] {
    // 1. Create a 800x600 window
    var app: App = App.new("My First Window", 800, 600, "")

    // 2. Set inline HTML content directly
    app.with_html("<html><body style='background:#181825; color:#cdd6f4; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;'><h1>Hello from Alpha! ⚡</h1></body></html>")

    // 3. Open the window and enter the event loop
    app.run()
}
```

Run it:
```bash
alpha run src/main.alpha
```

**What just happened?**
- `App.new(...)` configured the title, initial dimensions, and target.
- `.with_html(...)` injected inline HTML directly without needing external assets.
- `app.run()` displayed a native operating system window running the webview.

---

## Step 2: Loading an HTML File or Dev Server

In real projects, you will usually want to load external HTML/CSS/JS files or connect to a local frontend development server.

### Option A: Loading a Local HTML File (`ui/index.html`)

Create `ui/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #11111b; color: #a6adc8; font-family: sans-serif; padding: 40px; }
    h1 { color: #89b4fa; }
  </style>
</head>
<body>
  <h1>My Desktop Application</h1>
  <p>Loaded from a local HTML file!</p>
</body>
</html>
```

In `src/main.alpha`, pass the relative path as the fourth argument:
```alpha
import Core/Basic.alpha
import "../../src/lib.alpha"

function main() [here, nothing] {
    // Load local HTML file
    var app: App = App.new("WebAlph App", 900, 650, "ui/index.html")
    app.run()
}
```

### Option B: Connecting to Vite / React / Vue (Live Reload)

If you are developing a modern frontend using Vite (`npm run dev` running on `http://localhost:5173`), pass the local URL:

```alpha
var app: App = App.new("React Desktop App", 1024, 768, "http://localhost:5173")
app.run()
```
You get instant Hot Module Replacement (HMR) right inside your native desktop window!

---

## Step 3: How JavaScript Calls Alpha Functions (Commands / RPC)

This is the core mechanic: how do you run Alpha backend code when a user clicks a button in the web UI?

### 1. In Alpha (Backend)
Write a function that accepts `args: map<string, something>` and returns a value:

```alpha
import Core/Basic.alpha
import "../../src/lib.alpha"

// Function that receives a name from JS and returns a greeting
function say_hello(args: map<string, something>) [here, string] {
    var name: string = args["user_name"]
    return format("Hello, {}! This message was generated in Alpha backend.", name)
}

function main() [here, nothing] {
    var app: App = App.new("RPC Demo", 800, 600, "ui/index.html")

    // Register command named "greet"
    app.command("greet", say_hello)

    app.run()
}
```

### 2. In HTML / JavaScript (Frontend)
The `window.webalph` global bridge is injected automatically. Call your command using `invoke`:

```html
<!-- ui/index.html -->
<input id="nameInput" value="Alex" />
<button onclick="askAlpha()">Greet</button>
<h2 id="resultText"></h2>

<script>
  async function askAlpha() {
    const name = document.getElementById('nameInput').value;
    
    // Call the Alpha command "greet" and await the Promise response
    const answer = await window.webalph.invoke('greet', { user_name: name });
    
    // Display result on screen
    document.getElementById('resultText').innerText = answer;
  }
</script>
```

**Step-by-step lifecycle:**
1. The user clicks the button.
2. JavaScript calls `window.webalph.invoke('greet', { user_name: 'Alex' })`.
3. The IPC bridge serializes the payload to JSON and dispatches it to Alpha.
4. Alpha calls `say_hello`, extracts `args["user_name"]`, and formats the response.
5. The result resolves the JavaScript `Promise`, updating the UI.

---

## Step 4: Real-time Bi-directional Events (`emit` & `listen`)

What is the difference between Commands and Events?
- **Commands (`invoke`)** — Request-Response pattern (Ask for data -> Wait for result).
- **Events (`emit`)** — Fire-and-forget notifications (Send signal without blocking, broadcast updates, streaming progress).

### Sending an Event from JavaScript to Alpha:

**In JavaScript:**
```javascript
// Emit an event named "save_clicked"
window.webalph.emit("save_clicked", { document_id: 42 });
```

**In Alpha:**
```alpha
function on_save(payload: something) [here, nothing] {
    printf("[Alpha] User clicked save! Payload: {}\n", payload)
}

function main() [here, nothing] {
    var app: App = App.new("Events Demo", 800, 600, "ui/index.html")
    
    // Listen for "save_clicked" event
    app.listen("save_clicked", on_save)
    
    app.run()
}
```

### Streaming an Event from Alpha to JavaScript:

**In Alpha:**
```alpha
// Broadcast event to webview
app.emit("status_update", "File processing finished successfully!")
```

**In JavaScript:**
```javascript
// Subscribe to event emitted by Alpha
window.webalph.listen("status_update", (message) => {
    console.log("Notification from Alpha:", message);
});
```

---

## Step 5: Complete "Clicker" Mini-Project

Let's assemble everything into a self-contained, working project.

### `ui/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Alpha Clicker</title>
  <style>
    body { background: #181825; color: #cdd6f4; font-family: sans-serif; text-align: center; padding-top: 50px; }
    button { background: #89b4fa; color: #11111b; border: none; padding: 14px 28px; font-size: 18px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: transform 0.1s; }
    button:hover { transform: scale(1.05); }
    h1 { font-size: 56px; margin: 20px 0; color: #a6e3a1; }
  </style>
</head>
<body>
  <p>State stored and incremented in Alpha backend:</p>
  <h1 id="counterView">0</h1>
  <button onclick="addClick()">Click (+1)</button>

  <script>
    async function addClick() {
      // Invoke command on Alpha backend
      const count = await window.webalph.invoke('increment', {});
      document.getElementById('counterView').innerText = count;
    }
  </script>
</body>
</html>
```

### `src/main.alpha`:
```alpha
import Core/Basic.alpha
import "../../src/lib.alpha"

// State stored on the Alpha backend
var total_clicks: int = 0

// Handler for the "increment" command
function handle_increment(args: map<string, something>) [here, int] {
    total_clicks = total_clicks + 1
    printf("[Alpha] Total clicks count: {}\n", total_clicks)
    return total_clicks
}

function main() [here, nothing] {
    var app: App = App.new("Alpha Clicker", 500, 420, "ui/index.html")

    // Register RPC command
    app.command("increment", handle_increment)

    // Launch window
    app.run()
}
```

Run the application:
```bash
alpha run src/main.alpha
```

You now have a fully functional native desktop app powered by a web frontend and an Alpha backend!

---

## Cheat Sheet Summary

| Goal | Alpha Function | JavaScript Method |
|---|---|---|
| **Create window** | `App.new(title, width, height, path)` | — |
| **Set HTML string** | `app.with_html(html_str)` | — |
| **Disable resizing** | `app.with_resizable(false)` | — |
| **Run event loop** | `app.run()` | — |
| **Register RPC command** | `app.command(name, handler)` | `window.webalph.invoke(name, args)` |
| **Emit event** | `app.emit(event, data)` | `window.webalph.emit(event, data)` |
| **Listen to event** | `app.listen(event, handler)` | `window.webalph.listen(event, cb)` |
| **Evaluate JavaScript** | `app.eval("console.log('hi')")` | — |
