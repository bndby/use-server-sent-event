# useServerSentEvent

React hook for working with Server-Sent Events (SSE).

## Installation

```bash
npm install use-server-sent-event
```

## Usage

```tsx
import { useServerSentEvent } from 'use-server-sent-event';

function MyComponent() {
  const { data, error, isConnected } = useServerSentEvent<MyDataType>(
    'http://localhost:3000/events',
    initialData
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  );
}
```

## API

### `useServerSentEvent<T>(url, initialState?)`

- `url` - URL to connect to the SSE endpoint
- `initialState` - Initial data state (optional)

### Return values

- `data` - Current data from the server
- `error` - Connection error (if any)
- `isConnected` - Connection status (boolean)

## Demo

In the `src/example` folder there is a complete demonstration of the hook:

### Quick start

```bash
cd src/example
bun server.js
```

Then open in your browser:

- <http://localhost:3000/react> - React application with the hook
- <http://localhost:3000> - Simple JavaScript interface

### Demo files

- `server.js` - Server with SSE endpoint
- `client-simple.tsx` - React application with simplified version of the hook
- `react-demo.html` - HTML file for running the demo
- `start.sh` - Script to start the server

Detailed documentation in [src/example/README.md](src/example/README.md).

## Features

- Automatic connection/disconnection
- Error handling
- TypeScript support
- SSR compatibility
- Optimized performance 