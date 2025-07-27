# React SSE Demo with useServerSentEvent

[Русский](./README.md)

This is a demonstration React application that shows how the `useServerSentEvent` hook from the parent folder works.

## Files

- `server.js` - Bun server that sends random numbers via SSE
- `client.tsx` - React application using the useServerSentEvent hook (full version)
- `client-simple.tsx` - Simplified version of React application with built-in hook
- `react-demo.html` - HTML file for running the simplified version
- `index.html` - HTML file for running the full version
- `start.sh` - Script to start the server

## Running

1. **Start the server:**

   ```bash
   cd src/example
   bun server.js
   # or
   ./start.sh
   ```

2. **Open in browser:**
   - Main page: <http://localhost:3000>
   - React application (embedded): <http://localhost:3000/react>
   - React application (separate file): open `react-demo.html` in browser

## Functionality

### React application (embedded in server `/react`)

- Connects to `localhost:3000/events` via Server-Sent Events
- Uses simplified version of the `useServerSentEvent` hook
- Displays received numeric values in real-time
- Shows connection status (connected/disconnected)
- Displays connection errors
- Allows clearing the message list

### React application (separate file `client-simple.tsx`)

- Full-featured version with TypeScript
- Uses simplified hook implementation
- Can be run independently from the server
- Supports all features of the embedded version

### Built-in JavaScript interface (`/`)

- Simple HTML/JavaScript interface for comparison
- Connect/disconnect buttons
- Real-time message display

## SSE Endpoint

The server sends random numbers every second to the `/events` endpoint:

```sh
data: 123

data: 456

data: 789
```

## useServerSentEvent Hook Features

- Automatic connection when component mounts
- Automatic disconnection when component unmounts
- Connection error handling
- Connection state (isConnected)
- Initial state support
- TypeScript typing
- Handling both JSON and simple numeric values

## Technologies

- React 18
- TypeScript
- Server-Sent Events (SSE)
- Bun (server)
- Babel (for JSX in browser)

## Project Structure

```txt
src/example/
├── server.js          # Server with SSE endpoint
├── client.tsx         # Full version of React application
├── client-simple.tsx  # Simplified version with built-in hook
├── react-demo.html    # HTML for simplified version
├── index.html         # HTML for full version
├── start.sh           # Startup script
└── README.md          # Documentation
```

## Usage

1. Start the server with `bun server.js`
2. Open <http://localhost:3000/react> for the embedded version
3. Or open the `react-demo.html` file in browser for the separate version
4. Observe real-time data reception
5. Use the "Clear messages" button to clear the history
