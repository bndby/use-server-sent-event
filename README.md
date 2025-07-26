# useServerSentEvent

## Depend

React 17+

## Use hook

```tsx
import { useServerSentEvent } from '@bndby/useServerSentEvent';

function MyComponent() {
    const {
        data,
        error,
        isConnected
    } = useServerSentEvent(
        'https://api.example.com/events',
        { status: 'connecting' }
    );

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div>
            <p>Connection: {isConnected ? 'Live' : 'Disconnected'}</p>
            <pre>
                {data ? JSON.stringify(data, null, 2) : 'Loading...'}
            </pre>
        </div>
    )
}
```
