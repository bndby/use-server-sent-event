# useServerSentEvent

React хук для работы с Server-Sent Events (SSE).

## Установка

```bash
npm install use-server-sent-event
```

## Использование

```tsx
import { useServerSentEvent } from 'use-server-sent-event';

function MyComponent() {
  const { data, error, isConnected } = useServerSentEvent<MyDataType>(
    'http://localhost:3000/events',
    initialData
  );

  if (error) {
    return <div>Ошибка: {error.message}</div>;
  }

  return (
    <div>
      <p>Статус: {isConnected ? 'Подключено' : 'Отключено'}</p>
      <p>Данные: {JSON.stringify(data)}</p>
    </div>
  );
}
```

## API

### `useServerSentEvent<T>(url, initialState?)`

- `url` - URL для подключения к SSE endpoint
- `initialState` - Начальное состояние данных (опционально)

### Возвращаемые значения

- `data` - Текущие данные от сервера
- `error` - Ошибка подключения (если есть)
- `isConnected` - Статус подключения (boolean)

## Демонстрация

В папке `src/example` находится полная демонстрация работы хука:

### Быстрый запуск

```bash
cd src/example
bun server.js
```

Затем откройте в браузере:

- <http://localhost:3000/react> - React приложение с хуком
- <http://localhost:3000> - Простой JavaScript интерфейс

### Файлы демонстрации

- `server.js` - Сервер с SSE endpoint
- `client-simple.tsx` - React приложение с упрощенной версией хука
- `react-demo.html` - HTML файл для запуска демонстрации
- `start.sh` - Скрипт для запуска сервера

Подробная документация в [src/example/README.md](src/example/README.md).

## Особенности

- Автоматическое подключение/отключение
- Обработка ошибок
- TypeScript поддержка
- SSR совместимость
- Оптимизированная производительность
