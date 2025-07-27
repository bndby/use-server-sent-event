import React from 'react';
import { createRoot } from 'react-dom/client';

// Простая реализация хука useServerSentEvent для демонстрации
function useServerSentEvent<T>(url: string, initialState?: T) {
  const [data, setData] = React.useState<T | undefined>(initialState);
  const [error, setError] = React.useState<Error | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const eventSourceRef = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data) as T;
        setData(newData);
      } catch (err) {
        // Если не JSON, пробуем как число
        const numValue = parseInt(event.data);
        if (!isNaN(numValue)) {
          setData(numValue as T);
        } else {
          setData(event.data as T);
        }
      }
    };

    eventSource.onerror = (event) => {
      setError(new Error('SSE connection error'));
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [url]);

  return { data, error, isConnected };
}

// Тип для данных, получаемых от сервера
interface ServerData {
  timestamp: string;
  value: number;
}

// Компонент для отображения сообщений
const MessageList: React.FC<{ messages: ServerData[] }> = ({ messages }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '20px',
      height: '300px',
      overflowY: 'auto',
      background: '#f9f9f9',
      borderRadius: '5px',
      marginTop: '20px'
    }}>
      {messages.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>Сообщения появятся здесь...</p>
      ) : (
        messages.map((message, index) => (
          <div key={`message-${index}-${message.timestamp}`} style={{
            margin: '5px 0',
            padding: '10px',
            background: 'white',
            borderRadius: '3px',
            borderLeft: '3px solid #007bff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <strong>{message.timestamp}</strong>: Получено значение <strong>{message.value}</strong>
          </div>
        ))
      )}
    </div>
  );
};

// Основной компонент приложения
const App: React.FC = () => {
  const [messages, setMessages] = React.useState<ServerData[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  // Используем хук useServerSentEvent
  const { data, error, isConnected: sseConnected } = useServerSentEvent<number>(
    'http://localhost:3000/events',
    0
  );

  // Обрабатываем новые данные
  React.useEffect(() => {
    if (data !== undefined && data !== 0) {
      const newMessage: ServerData = {
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        value: data
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, [data]);

  // Обновляем статус подключения
  React.useEffect(() => {
    setIsConnected(sseConnected);
  }, [sseConnected]);

  // Очистка сообщений
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      margin: '40px',
      maxWidth: '800px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        React SSE Demo с useServerSentEvent
      </h1>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '10px 20px',
          borderRadius: '5px',
          color: 'white',
          fontWeight: 'bold',
          backgroundColor: isConnected ? '#28a745' : '#dc3545'
        }}>
          Статус: {isConnected ? 'Подключено' : 'Отключено'}
        </div>
        
        <button
          type="button"
          onClick={clearMessages}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Очистить сообщения
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          color: '#721c24'
        }}>
          <strong>Ошибка:</strong> {error.message}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#555' }}>
          Полученные сообщения ({messages.length})
        </h3>
        {isConnected && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#28a745',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Получение данных...
            </span>
          </div>
        )}
      </div>

      <MessageList messages={messages} />

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e9ecef',
        borderRadius: '5px',
        fontSize: '14px',
        color: '#495057'
      }}>
        <strong>Информация:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Приложение подключается к <code>localhost:3000/events</code></li>
          <li>Использует хук <code>useServerSentEvent</code> (упрощенная версия)</li>
          <li>Отображает получаемые числовые значения в реальном времени</li>
          <li>Показывает статус подключения и ошибки</li>
        </ul>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Рендерим приложение
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  // Если элемент root не найден, создаем его
  const newContainer = document.createElement('div');
  newContainer.id = 'root';
  document.body.appendChild(newContainer);
  
  const root = createRoot(newContainer);
  root.render(<App />);
} 