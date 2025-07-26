import {
    useCallback,
    useEffect,
    useRef,
    useSyncExternalStore,
} from 'react';

export function useServerSentEvent<T>(
    url: string,
    initialState?: T,
) {
    /**
     * Store for the server sent event data
     */
    const storeRef = useRef<{
        data: T | undefined,
        error: Error | null,
        listeners: Set<() => void>,
    }>({
        data: initialState,
        error: null,
        listeners: new Set(),
    });

    /**
     * Reference to the EventSource instance
     */
    const eventSourceRef = useRef<EventSource | null>(null);

    /**
     * Subscribe to the server sent event
     */
    const subscribe = useCallback((callback: () => void) => {
        storeRef.current.listeners.add(callback);
        return () => {
            storeRef.current.listeners.delete(callback);
        };
    }, []);

    /**
     * Get the current state
     */
    const getSnapshot = useCallback(() => storeRef.current.data, []);

    /**
     * Server snapshot for SSR
     */
    const getServerSnapshot = useCallback(() => initialState, [initialState]);

    /**
     * Update the store and notify listeners
     */
    const updateStore = useCallback((update: Partial<typeof storeRef.current>) => {
        storeRef.current = {
            ...storeRef.current,
            ...update,
        };
        storeRef.current.listeners.forEach((listener) => listener());
    }, []);

    /**
     * Sync the external store
     */
    const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    
    useEffect(() => {
        // Create SSE connection
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // Handle incoming messages
        const handleMessage = (event: MessageEvent) => {
            try {
                const newData = JSON.parse(event.data) as T;
                updateStore({ data: newData, error: null });
            } catch (err) {
                // biome-ignore lint/suspicious/noExplicitAny: TS accept only one argument for Error constructor
                updateStore({ error: (new Error as any)('Failed to parse SSE data', { cause: err }) });
            }
        }

        // Handle errors
        const handleError = (event: Event) => {
            // biome-ignore lint/suspicious/noExplicitAny: TS accept only one argument for Error constructor
            updateStore({ error: (new Error as any)('SSE connection error', { cause: event }) });
            eventSource.close();
        }

        eventSource.addEventListener('message', handleMessage);
        eventSource.addEventListener('error', handleError);

        return () => {
            eventSource.removeEventListener('message', handleMessage);
            eventSource.removeEventListener('error', handleError);
            eventSource.close();
            eventSourceRef.current = null;
        }
    }, [url, updateStore])

    return {
        data,
        error: storeRef.current.error,
        isConnected: !!eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN,
    };
}