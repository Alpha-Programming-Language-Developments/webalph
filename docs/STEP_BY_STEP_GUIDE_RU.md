# Пошаговое руководство: Создание десктопного приложения на WebAlph с нуля

Это руководство объясняет концепцию **WebAlph** простыми словами без заумных терминов и показывает, как шаг за шагом создать десктопное приложение.

---

## Что такое WebAlph простыми словами?

WebAlph устроен очень просто:
1. **Интерфейс (фронтенд)** — это обычная веб-страничка (HTML, CSS, JavaScript). В ней вы рисуете кнопки, формы, таблицы и графики.
2. **Логика (бэкенд)** — это код на языке **Alpha**. В нем вы работаете с файлами, системными ресурсами, базами данных и сложными вычислениями.
3. **Мост (IPC)** — механизм, с помощью которого JavaScript на странице может вызывать функции Alpha в бэкенде и получать от них результат.

Никакого тяжелого Electron — используется встроенный в Windows/macOS/Linux нативный веб-движок (WebView2/WebKit).

---

## Шаг 1: Самое простое окно (5 строк кода)

Давайте создадим минимально возможное окно.

Создайте проект командой:
```bash
alpha here
```

Подключите библиотеку webalph в файле `packages.alpaks`:
```alpaks
"webalph" = import "https://github.com/Alpha-Programming-Language-Developments/webalph/blob/main/src/lib.alpha"
```

В `src/main.alpha`:
```alpha
const var std = @import("std")
import webalph

function main() [public, nothing] {
    // 1. Создаем окно с заголовком, шириной 800px, высотой 600px
    var app: App = App.new("Мое Первое Окно", 800, 600, "")

    // 2. Задаем HTML прямо строкой
    app.with_html("<html><body style='background:#222; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;'><h1>Привет из Alpha!</h1></body></html>")

    // 3. Открываем окно
    app.run()
}
```

Запустите:
```bash
alpha run
```
**Что произошло?**
- Функция `App.new(...)` настроила размеры и заголовок окна.
- Метод `.with_html(...)` положил внутрь готовую HTML разметку.
- Метод `app.run()` открыл настоящее нативное окно Windows с веб-страницей внутри.

---

## Шаг 2: Загрузка HTML файла или сайта

В реальных проектах верстку удобнее держать в отдельном файле.

### Вариант А: Загрузка локального файла `ui/index.html`

Создайте файл `ui/index.html`:
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
  <h1>Мое Десктопное Приложение</h1>
  <p>Отображается из локального HTML файла!</p>
</body>
</html>
```

В `src/main.alpha` укажите относительный путь 4-м аргументом:
```alpha
const var std = @import("std")
import webalph

function main() [public, nothing] {
    // Четвертый аргумент: путь к вашему index.html
    var app: App = App.new("WebAlph App", 900, 650, "ui/index.html")
    app.run()
}
```

### Вариант Б: Загрузка React / Vue / Svelte (Vite Dev Server)

Если вы разрабатываете фронтенд на Vite, запустите dev-сервер (например `npm run dev` на `http://localhost:5173`) и укажите адрес в WebAlph:

```alpha
var app: App = App.new("React App", 1000, 700, "http://localhost:5173")
app.run()
```

Вы получите мгновенное обновление верстки (Hot Module Replacement, HMR) прямо в окне программы!

---

## Шаг 3: Как JavaScript вызывает функции Alpha (Команды / RPC)

Это самое главное: как сделать так, чтобы по нажатию кнопки в HTML вызвался код на Alpha?

### 1. На стороне Alpha (Бэкенд)
Пишем обычную функцию, которая принимает аргументы `args: map<string, something>` и возвращает результат:

```alpha
const var std = @import("std")
import webalph

// Функция, которая примет имя из JS и вернет приветствие
function say_hello(args: map<string, something>) [here, string] {
    var name: string = args["user_name"]
    return std.format("Привет, {}! Я выполнен в бэкенде Alpha!", name)
}

function main() [public, nothing] {
    var app: App = App.new("RPC Demo", 800, 600, "ui/index.html")

    // Регистрируем команду под именем "greet"
    app.command("greet", say_hello)

    app.run()
}
```

### 2. На стороне HTML/JS (Фронтенд)
Внутри браузера объект `window.webalph` доступен автоматически. Мы вызываем команду через `invoke`:

```html
<!-- ui/index.html -->
<input id="nameInput" value="Михаил" />
<button onclick="askAlpha()">Поздороваться</button>
<h2 id="resultText"></h2>

<script>
  async function askAlpha() {
    const name = document.getElementById('nameInput').value;
    
    // Вызываем команду "greet", передавая объект с аргументами
    const answer = await window.webalph.invoke('greet', { user_name: name });
    
    // Отображаем результат
    document.getElementById('resultText').innerText = answer;
  }
</script>
```

**Что происходит по шагам:**
1. Пользователь нажимает на кнопку.
2. JS вызывает `window.webalph.invoke('greet', { user_name: 'Михаил' })`.
3. IPC-мост передает это в бэкенд на Alpha.
4. Alpha запускает `say_hello`, считывает `args["user_name"]` и форматирует строку.
5. Результат асинхронно возвращается в JS и отображается на странице.

---

## Шаг 4: Двусторонние события (`emit` и `listen`)

Чем события отличаются от команд?
- **Команды (`invoke`)** — это вопрос-ответ (спросили -> дождались ответа).
- **События (`emit`)** — это уведомления («файл скачан», «прогресс 50%»).

### Отправка события из JavaScript в Alpha:

**В JavaScript:**
```javascript
// Отправляем событие "save_clicked"
window.webalph.emit("save_clicked", { file_id: 123 });
```

**В Alpha:**
```alpha
function on_save(payload: something) [here, nothing] {
    std.printf("Пользователь нажал сохранить! Данные: {}\n", payload)
}

function main() [public, nothing] {
    var app: App = App.new("Events Demo", 800, 600, "ui/index.html")
    
    // Слушаем событие "save_clicked"
    app.listen("save_clicked", on_save)
    
    app.run()
}
```

### Отправка события из Alpha в JavaScript:

**В Alpha:**
```alpha
// Отправляем событие во фронтенд
app.emit("notification", "Файл успешно сохранен на диск!")
```

**В JavaScript:**
```javascript
// Подписываемся на события бэкенда
window.webalph.listen("notification", (msg) => {
    alert("Сообщение от Alpha: " + msg);
});
```

---

## Шаг 5: Полный пример — Счётчик кликов

Давайте соберем рабочий мини-проект воедино.

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
  <p>Счётчик кликов в бэкенде Alpha:</p>
  <h1 id="countView">0</h1>
  <button onclick="increment()">Кликнуть (+1)</button>

  <script>
    async function increment() {
      // Вызываем команду бэкенда Alpha
      const newCount = await window.webalph.invoke('add_click', {});
      document.getElementById('countView').innerText = newCount;
    }
  </script>
</body>
</html>
```

### `src/main.alpha`:
```alpha
const var std = @import("std")
import webalph

// Переменная состояния в Alpha
var total_clicks: int = 0

// Обработчик команды
function handle_add_click(args: map<string, something>) [here, int] {
    total_clicks = total_clicks + 1
    std.printf("[Alpha] Текущее число кликов: {}\n", total_clicks)
    return total_clicks
}

function main() [public, nothing] {
    var app: App = App.new("Alpha Clicker", 500, 400, "ui/index.html")

    // Регистрируем команду
    app.command("add_click", handle_add_click)

    // Запускаем окно
    app.run()
}
```

Запустите:
```bash
alpha run
```
Поздравляем! Вы только что написали полноценное десктопное приложение с нативным окном, веб-интерфейсом и реактивным бэкендом на языке Alpha!

---

## Сводная таблица функций

| Действие | Функция в Alpha | Функция в JavaScript |
|---|---|---|
| **Создать окно** | `App.new(title, width, height, path)` | — |
| **Задать HTML строкой** | `app.with_html(html_str)` | — |
| **Запретить ресайз** | `app.with_resizable(false)` | — |
| **Запустить окно** | `app.run()` | — |
| **Зарегистрировать команду** | `app.command(name, handler)` | `window.webalph.invoke(name, args)` |
| **Отправить событие** | `app.emit(event, data)` | `window.webalph.emit(event, data)` |
| **Слушать событие** | `app.listen(event, handler)` | `window.webalph.listen(event, callback)` |
| **Выполнить JS из Alpha** | `app.eval("alert('Hello')")` | — |
