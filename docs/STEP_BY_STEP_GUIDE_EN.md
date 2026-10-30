# Step-by-Step Guide: Building a Desktop Application with WebAlph from Scratch

This guide explains the core concepts behind **WebAlph** in plain English—free of convoluted jargon—and shows you how to build a complete desktop application step by step.

---

## What is WebAlph in Simple Terms?

WebAlph is built around a straightforward architecture:
1. **Frontend (User Interface)** — A standard web page (HTML, CSS, JavaScript). This is where you design buttons, forms, tables, and graphics.
2. **Backend (Application Logic)** — Code written in the **Alpha** programming language. This is where you handle files, system resources, databases, and heavy computations.
3. **Bridge (IPC)** — A communication channel allowing JavaScript in the web view to invoke Alpha backend functions and receive responses.

No heavy Electron overhead—WebAlph leverages the operating system's native web engine (WebView2 on Windows, WebKit on macOS/Linux).

---

## Step 1: The Simplest Window (5 Lines of Code)

Let's create the smallest possible working window.

Initialize a new project:
```bash
alpha here
```

Add the `webalph` library dependency to `packages.alpaks`:
```alpaks
"webalph" = import "https://github.com/Alpha-Programming-Language-Developments/webalph/blob/main/src/lib.alpha"
```

In `src/main.alpha`:
```alpha
import webalph

function main() [here, nothing] {
    // 1. Create a window: title, width: 800px, height: 600px
    var app: App = App.new("My First Window", 800, 600, "")

    // 2. Supply inline HTML content
    app.with_html("<html><body style='background:#222; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;'><h1>Hello from Alpha!</h1></body></html>")

    // 3. Open the window and start the event loop
    app.run()
}
```

Run your application:
```bash
alpha run
```

**What just happened?**
- `App.new(...)` configured the initial window dimensions and title.
- `.with_html(...)` injected raw HTML markup into the web view.
- `app.run()` spawned a genuine native desktop window rendering your page.

---

## Step 2: Loading HTML Files or Live Websites

In real-world applications, keeping your layout in separate files is much cleaner.

### Option A: Loading a Local File (`ui/index.html`)

Create `ui/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #1a1a1a; color: #eee; font-family: sans-serif; padding: 40px; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>My Desktop Application</h1>
  <p>Rendered from a local HTML file!</p>
</body>
</html>
```

In `src/main.alpha`, provide the relative path as the fourth argument:
```alpha
import webalph

function main() [here, nothing] {
    // Fourth argument: path to your index.html
    var app: App = App.new("WebAlph App", 900, 650, "ui/index.html")
    app.run()
}
```

### Option B: Loading React / Vue / Svelte (Vite Dev Server)

If you are developing your frontend with modern tooling like Vite, run your dev server (e.g., `npm run dev` running at `http://localhost:5173`) and point WebAlph to that address:

```alpha
var app: App = App.new("React App", 1000, 700, "http://localhost:5173")
app.run()
```

You get a full-featured desktop window with instant **Hot Module Replacement (HMR)**!

---

## Step 3: Calling Alpha Backend Functions from JavaScript (Commands / RPC)

This is the core mechanic: how do you trigger backend Alpha code by clicking a button in HTML?

### 1. On the Alpha Side (Backend)
Write a standard function that takes `args: map<string, something>` and returns a value:

```alpha
import Core/Basic.alpha
import webalph

// Handler function receiving a name from JS and returning a greeting
function say_hello(args: map<string, something>) [here, string] {
    var name: string = args["user_name"]
    return format("Hello, {}! I was executed in the Alpha backend!", name)
}

function main() [here, nothing] {
    var app: App = App.new("RPC Demo", 800, 600, "ui/index.html")

    // Register command named "greet"
    app.command("greet", say_hello)

    app.run()
}
```

### 2. On the HTML/JS Side (Frontend)
The `window.webalph` object is injected automatically. You invoke backend commands using `invoke`:

```html
<!-- ui/index.html -->
<input id="nameInput" value="Michael" />
<button onclick="askAlpha()">Greet</button>
<h2 id="resultText"></h2>

<script>
  async function askAlpha() {
    const name = document.getElementById('nameInput').value;
    
    // Call the "greet" command and pass arguments as an object
    const answer = await window.webalph.invoke('greet', { user_name: name });
    
    // Display the result
    document.getElementById('resultText').innerText = answer;
  }
</script>
```

**Step-by-Step Breakdown:**
1. The user clicks the button.
2. JavaScript calls `window.webalph.invoke('greet', { user_name: 'Michael' })`.
3. The IPC layer dispatches the request to the Alpha backend.
4. Alpha calls `say_hello`, reads `args["user_name"]`, and formats the string.
5. The result returns asynchronously to JavaScript and updates the DOM.

---

## Step 4: Bidirectional Events (`emit` and `listen`)

How do events differ from commands?
- **Commands (`invoke`)** — Request/Response model (query -> wait for return value).
- **Events (`emit`)** — Fire-and-forget notifications ("file downloaded", "upload progress 50%").

### Sending an Event from JavaScript to Alpha:

**In JavaScript:**
```javascript
// Emit the "save_clicked" event
window.webalph.emit("save_clicked", { file_id: 123 });
```

**In Alpha:**
```alpha
function on_save(payload: something) [here, nothing] {
    printf("User clicked save! Data: {}\n", payload)
}

function main() [here, nothing] {
    var app: App = App.new("Events Demo", 800, 600, "ui/index.html")
    
    // Listen for the "save_clicked" event
    app.listen("save_clicked", on_save)
    
    app.run()
}
```

### Sending an Event from Alpha to JavaScript:

**In Alpha:**
```alpha
// Emit an event to the frontend
app.emit("notification", "File saved to disk successfully!")
```

**In JavaScript:**
```javascript
// Subscribe to backend events
window.webalph.listen("notification", (msg) => {
    alert("Message from Alpha: " + msg);
});
```

---

## Step 5: Complete Example — Click Counter

Let's tie everything together into a self-contained mini project.

### `ui/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Clicker</title>
  <style>
    body { background: #121212; color: #fff; font-family: sans-serif; text-align: center; padding-top: 50px; }
    button { background: #007acc; color: white; border: none; padding: 15px 30px; font-size: 20px; border-radius: 8px; cursor: pointer; }
    button:hover { background: #005999; }
    h1 { font-size: 48px; }
  </style>
</head>
<body>
  <p>Click counter managed by the Alpha backend:</p>
  <h1 id="countView">0</h1>
  <button onclick="increment()">Click Me (+1)</button>

  <script>
    async function increment() {
      // Invoke the Alpha backend command
      const newCount = await window.webalph.invoke('add_click', {});
      document.getElementById('countView').innerText = newCount;
    }
  </script>
</body>
</html>
```

### `src/main.alpha`:
```alpha
import Core/Basic.alpha
import webalph

// Application state stored in Alpha
var total_clicks: int = 0

// Command handler
function handle_add_click(args: map<string, something>) [here, int] {
    total_clicks = total_clicks + 1
    printf("[Alpha] Current click count: {}\n", total_clicks)
    return total_clicks
}

function main() [here, nothing] {
    var app: App = App.new("Alpha Clicker", 500, 400, "ui/index.html")

    // Register the command
    app.command("add_click", handle_add_click)

    // Launch the window
    app.run()
}
```

Run the app:
```bash
alpha run
```

Congratulations! You have just built a native desktop application with a web-based UI and a reactive backend written in Alpha!

---

## Quick API Reference

| Action | Alpha Function | JavaScript Function |
|---|---|---|
| **Create window** | `App.new(title, width, height, path)` | — |
| **Set HTML string** | `app.with_html(html_str)` | — |
| **Disable resizing** | `app.with_resizable(false)` | — |
| **Run application** | `app.run()` | — |
| **Register command** | `app.command(name, handler)` | `window.webalph.invoke(name, args)` |
| **Emit event** | `app.emit(event, data)` | `window.webalph.emit(event, data)` |
| **Listen to event** | `app.listen(event, handler)` | `window.webalph.listen(event, callback)` |
| **Execute JS from Alpha** | `app.eval("alert('Hello')")` | — |
