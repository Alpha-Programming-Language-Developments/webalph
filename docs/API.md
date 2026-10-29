# WebAlph: Справочник по всем функциям и методам (API)

В этом документе подробно описана каждая функция и метод библиотеки **WebAlph** с понятными примерами использования.

---

## Оглавление

1. [Структура `App` (Основное приложение)](#1-структура-app)
   - [`App.new`](#appnewtitle-width-height-url---app)
   - [`.with_html`](#with_htmlhtml_content-string---app)
   - [`.with_resizable`](#with_resizableresizable-boolean---app)
   - [`.command`](#commandname-string-handler-something---nothing)
   - [`.listen`](#listenevent-string-handler-something---nothing)
   - [`.emit`](#emitevent-string-payload-something---nothing)
   - [`.eval`](#evalscript-string---nothing)
   - [`.run`](#run---nothing)
2. [Вспомогательная функция `create_app`](#2-функция-create_app)
3. [Структура `WindowConfig`](#3-структура-windowconfig)
4. [Модуль событий `events.alpha`](#4-модуль-eventsalpha)
5. [Модуль RPC `ipc.alpha`](#5-модуль-ipcalpha)
6. [JavaScript API (`window.webalph`)](#6-javascript-api-windowwebalph)

---

## 1. Структура `App`

Структура `App` — это сердце вашего приложения. Она создает окно, регистрирует обработчики и запускает цикл событий.

### `App.new(title, width, height, url) -> App`
Создает новое приложение.

- **Параметры:**
  - `title: string` — Заголовок окна (будет виден в шапке окна).
  - `width: int` — Начальная ширина окна в пикселях (например, `800` или `1024`).
  - `height: int` — Начальная высота окна в пикселях (например, `600` или `768`).
  - `url: string` — Путь к HTML файлу (например, `"ui/index.html"`) или веб-адрес (`"http://localhost:5173"`). Если вы планируете передать HTML прямо строкой через `.with_html(...)`, этот параметр можно оставить пустым `""`.
- **Возвращает:** Экземпляр `App`.

**Пример:**
```alpha
var app: App = App.new("Моя Программа", 900, 600, "ui/index.html")
```

---

### `.with_html(html_content: string) -> App`
Позволяет встроить HTML-разметку прямо в код Alpha без создания внешнего HTML-файла.

- **Параметры:**
  - `html_content: string` — Строка с полным текстом HTML страницы.
- **Возвращает:** Тот же экземпляр `App` (для чейнинга).

**Пример:**
```alpha
var app: App = App.new("Быстрое Окно", 600, 400, "")
app.with_html("<h1>Привет, мир!</h1><p>Окно без внешних файлов.</p>")
app.run()
```

---

### `.with_resizable(resizable: boolean) -> App`
Разрешает или запрещает пользователю растягивать окно мышкой.

- **Параметры:**
  - `resizable: boolean` — `true` (можно менять размер, по умолчанию) или `false` (размер окна строго фиксирован).

**Пример:**
```alpha
var app: App = App.new("Калькулятор", 400, 500, "ui/calc.html")
app.with_resizable(false) // Окно нельзя растянуть
app.run()
```

---

### `.command(name: string, handler: something) -> nothing`
Связывает имя команды с функцией на языке Alpha. Когда JavaScript вызывает `window.webalph.invoke(name, args)`, запустится эта функция.

- **Параметры:**
  - `name: string` — Название команды, по которому фронтенд будет её вызывать.
  - `handler: something` — Функция на Alpha вида:
    `function my_handler(args: map<string, something>) [here, тип_возврата]`
- **Как писать функцию-обработчик:**
  - Функция всегда принимает один параметр: `args: map<string, something>` (словарь с переданными аргументами).
  - Функция может возвращать: число (`int`), строку (`string`), булево (`boolean`), словарь (`map`) или список (`vect`).
  - Возвращенное значение автоматически передается в JavaScript в виде Promise-результата.

**Пример на Alpha:**
```alpha
function sum_numbers(args: map<string, something>) [here, int] {
    var a: int = args["first"]
    var b: int = args["second"]
    return a + b
}

app.command("sum", sum_numbers)
```

**Вызов из JavaScript:**
```javascript
const result = await window.webalph.invoke("sum", { first: 10, second: 32 });
console.log(result); // Выведет: 42
```

---

### `.listen(event: string, handler: something) -> nothing`
Подписывается на событие, отправленное со страницы через `window.webalph.emit(event, payload)`.

- **Параметры:**
  - `event: string` — Имя события.
  - `handler: something` — Функция вида:
    `function my_listener(payload: something) [here, nothing]`

**Пример на Alpha:**
```alpha
function on_user_login(payload: something) [here, nothing] {
    printf("Пользователь залогинился: {}\n", payload)
}

app.listen("user_login", on_user_login)
```

**Отправка из JavaScript:**
```javascript
window.webalph.emit("user_login", { username: "admin", time: Date.now() });
```

---

### `.emit(event: string, payload: something) -> nothing`
Отправляет событие из Alpha бэкенда во фронтенд в реальном времени.

- **Параметры:**
  - `event: string` — Имя события.
  - `payload: something` — Любые данные (строка, число, словарь, список).

**Пример на Alpha:**
```alpha
var status: map<string, something> = map.new()
status.insert("progress", 100)
status.insert("state", "completed")

app.emit("task_status", status)
```

**Прием в JavaScript:**
```javascript
window.webalph.listen("task_status", (data) => {
    console.log("Прогресс задачи:", data.progress, "%");
});
```

---

### `.eval(script: string) -> nothing`
Выполняет произвольную строку JavaScript кода внутри окна браузера.

- **Параметры:**
  - `script: string` — Строка с JavaScript кодом.

**Пример:**
```alpha
app.eval("document.body.style.backgroundColor = 'red';")
```

---

### `.run() -> nothing`
Запускает окно приложения и входит в нативный цикл обработки событий.

- **Важно:** Этот вызов блокирует выполнение текущей функции `main()` до тех пор, пока пользователь не закроет окно крестиком.
- После закрытия окна метод завершается, и код продолжает выполняться дальше (например, можно сохранить файлы или вывести завершающее сообщение).

**Пример:**
```alpha
printf("Запуск приложения...\n")
app.run()
printf("Окно закрыто. Программа завершена.\n")
```

---

## 2. Функция `create_app`

Вспомогательная короткая функция из `lib.alpha` для быстрого старта (эквивалент `App.new`):

```alpha
var app: App = create_app("Название", 800, 600, "ui/index.html")
app.run()
```

---

## 3. Структура `WindowConfig`

Используется внутри `App` для хранения настроек окна:
- `title: string` — Заголовок.
- `width: int` — Ширина.
- `height: int` — Высота.
- `resizable: boolean` — Разрешение изменять размер.
- `url: string` — Путь к файлу или URL.
- `html: string` — Прямой HTML текст.

---

## 4. JavaScript API (`window.webalph`)

Объект `window.webalph` создается автоматически в любом открытом окне.

| Метод JS | Что делает | Пример |
|---|---|---|
| `invoke(cmd, args)` | Вызывает функцию бэкенда и ждет ответ (Promise). | `const res = await window.webalph.invoke('calc', { a: 5 });` |
| `emit(event, data)` | Отправляет сигнал в Alpha без ожидания ответа. | `window.webalph.emit('button_pressed', { id: 1 });` |
| `listen(event, fn)` | Подписывается на сигнал, пришедший из Alpha. | `window.webalph.listen('download_done', (data) => { ... });` |
