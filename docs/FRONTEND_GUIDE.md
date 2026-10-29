# WebAlph Frontend & TypeScript Guide

A comprehensive guide for frontend developers building modern web UIs for **WebAlph** desktop applications.

---

## 1. Global Bridge Object: `window.webalph`

The `window.webalph` bridge is injected automatically into every window before any page scripts execute. No bundler plugins or npm dependencies are required.

### TypeScript Definition (`webalph.d.ts`)

Add this file to your `src/` directory in TypeScript projects for full autocomplete and type safety:

```typescript
declare global {
  interface Window {
    webalph: {
      /**
       * Calls an RPC command registered on the Alpha backend.
       * Resolves with the returned value, or rejects if an error occurs.
       */
      invoke<T = any>(command: string, args?: Record<string, any>): Promise<T>;

      /**
       * Emits a fire-and-forget event to the Alpha backend.
       */
      emit(event: string, payload?: any): void;

      /**
       * Listens for real-time events streamed from the Alpha backend.
       */
      listen<T = any>(event: string, callback: (data: T) => void): void;
    };
  }
}

export {};
```

---

## 2. Usage Examples

### Calling Backend Commands (`invoke`)

```javascript
// Simple call without arguments
const systemInfo = await window.webalph.invoke('get_system_info');
console.log('System Info:', systemInfo);

// Call with parameters
try {
  const result = await window.webalph.invoke('calculate', { a: 40, b: 2 });
  console.log('Calculation result:', result); // 42
} catch (error) {
  console.error('Alpha backend error:', error);
}
```

### Real-time Event Streaming (`emit` and `listen`)

```javascript
// Send event to Alpha
window.webalph.emit('user_theme_changed', { theme: 'dark' });

// Listen for events from Alpha
window.webalph.listen('download_progress', (data) => {
  console.log(`Progress: ${data.percentage}%`);
  updateProgressBar(data.percentage);
});
```

---

## 3. Framework Integrations (React, Vue, Svelte)

WebAlph works out-of-the-box with any modern frontend framework.

### React Custom Hook Example

```typescript
import { useState, useCallback } from 'react';

export function useAlphaCommand<TResponse, TArgs = Record<string, any>>(commandName: string) {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (args?: TArgs) => {
    setLoading(true);
    setError(null);
    try {
      const response = await window.webalph.invoke<TResponse>(commandName, args as any);
      setData(response);
      return response;
    } catch (err: any) {
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [commandName]);

  return { data, loading, error, execute };
}
```

### Development with Vite (HMR)

During development, point your Alpha backend to Vite's local dev server:

```alpha
var app: App = App.new("My App (Dev Mode)", 1024, 768, "http://localhost:5173")
app.run()
```
