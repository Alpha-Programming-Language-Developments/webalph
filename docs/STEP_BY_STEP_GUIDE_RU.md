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

Создайте файл `src/main.alpha`:

```alpha
import Core/Basic.alpha
import "../../src/lib.alpha"

function main() [here, nothing] {
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
alpha run src/main.alpha
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
  <p>Это локальный HTML файл!</p>
</body>
</html>
```

В `src/main.alpha` просто передайте путь к файлу:
```alpha
import Core/Basic.alpha
import "../../src/lib.alpha"

function main() [here, nothing] {
    // Четвертый аргумент - путь к вашему index.html
    var app: App = App.new("WebAlph App", 900, 650, "ui/index.html")
    app.run()
}
```

### Вариант Б: Загрузка React/Vue (Vite Dev Server)

Если вы разрабатываете фронтенд на React или Vue через Vite, запустите `npm run dev` (например, на `http://localhost:5173`) и укажите адрес сервера:

```alpha
var app: App = App.new("React App", 1000, 700, "http://localhost:5173")
app.run()
```
Вы получите полноценное окно приложения с мгновенным обновлением интерфейса (Hot Reload)!

---

## Шаг 3: Как JavaScript вызывает функции Alpha (Команды / RPC)

Это самое главное: как сделать так, чтобы по нажатию кнопки в HTML вызвался код на Alpha?

### 1. На стороне Alpha (Бэкенд)
Пишем обычную функцию, которая принимает аргументы `args: map<string, something>` и возвращает результат:

```alpha
import Core/Basic.alpha
import "../../src/lib.alpha"

// Функция, которая примет имя из JS и вернет приветствие
function say_hello(args: map<string, something>) [here, string] {
    var name: string = args["user_name"]
    return format("Привет, {}! Я выполнен в бэкенде Alpha!", name)
}

function main() [here, nothing] {
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
    
    // Выводим результат
    document.getElementById('resultText').innerText = answer;
  }
</script>
```

**Как это работает шаг за шагом:**
1. Пользователь нажал кнопку.
2. JS вызвал `window.webalph.invoke('greet', { user_name: 'Михаил' })`.
3. Запрос улетел в Alpha бэкенд.
4. Alpha вызвала функцию `say_hello`, достала `args["user_name"]` и склеила строку.
5. Результат вернулся в JavaScript и отобразился на экране.

---

## Шаг 4: Двусторонние события (Events: `emit` и `listen`)

Чем события отличаются от команд?
- **Команда (`invoke`)** — это «вопрос-ответ» (запросил -> дождался ответа).
- **Событие (`emit`)** — это уведомление без ожидания ответа («что-то произошло», «прогресс загрузки 50%»).

### Отправка события из JavaScript в Alpha:

**В JavaScript:**
```javascript
// Отправляем событие "save_clicked"
window.webalph.emit("save_clicked", { file_id: 123 });
```

**В Alpha:**
```alpha
function on_save(payload: something) [here, nothing] {
    printf("Пользователь нажал сохранить! Данные: {}\n", payload)
}

function main() [here, nothing] {
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
// Подписываемся на событие из бэкенда
window.webalph.listen("notification", (msg) => {
    alert("Сообщение от Alpha: " + msg);
});
```

---

## Шаг 5: Законченный пример «Счетчик кликов»

Давайте соберем всё вместе в один законченный мини-проект.

### `ui/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Кликер</title>
  <style>
    body { background: #121212; color: #fff; font-family: sans-serif; text-align: center; padding-top: 50px; }
    button { background: #007acc; color: white; border: none; padding: 15px 30px; font-size: 20px; border-radius: 8px; cursor: pointer; }
    button:hover { background: #005999; }
    h1 { font-size: 48px; }
  </style>
</head>
<body>
  <p>Счетчик кликов на Alpha бэкенде:</p>
  <h1 id="countView">0</h1>
  <button onclick="increment()">Кликнуть (+1)</button>

  <script>
    async function increment() {
      // Вызываем Alpha бэкенд
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
import "../../src/lib.alpha"

// Переменная состояния в Alpha
var total_clicks: int = 0

// Обработчик команды
function handle_add_click(args: map<string, something>) [here, int] {
    total_clicks = total_clicks + 1
    printf("[Alpha] Текущее число кликов: {}\n", total_clicks)
    return total_clicks
}

function main() [here, nothing] {
    var app: App = App.new("Alpha Clicker", 500, 400, "ui/index.html")

    // Регистрируем команду
    app.command("add_click", handle_add_click)

    // Запускаем окно
    app.run()
}
```

Запустите:
```bash
alpha run src/main.alpha
```
Поздравляем! Вы только что написали полноценное десктопное приложение с нативным окном, веб-интерфейсом и реактивным бэкендом на языке Alpha!

---

## Сводная таблица функций

| Что нужно сделать | Функция на Alpha | Функция в JavaScript |
|---|---|---|
| **Создать окно** | `App.new(title, width, height, path)` | — |
| **Задать HTML строкой** | `app.with_html(html_str)` | — |
| **Запретить ресайз** | `app.with_resizable(false)` | — |
| **Запустить окно** | `app.run()` | — |
| **Зарегистрировать команду** | `app.command(name, handler)` | `window.webalph.invoke(name, args)` |
| **Послать событие** | `app.emit(event, data)` | `window.webalph.emit(event, data)` |
| **Слушать событие** | `app.listen(event, handler)` | `window.webalph.listen(event, cb)` |
| **Выполнить JS из Alpha** | `app.eval("alert('Привет')")` | — |
