import { serve } from "bun";

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/") {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Server-Sent Events Demo</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            #messages { 
              border: 1px solid #ccc; 
              padding: 20px; 
              height: 300px; 
              overflow-y: auto; 
              background: #f9f9f9;
              border-radius: 5px;
            }
            .message { 
              margin: 5px 0; 
              padding: 5px; 
              background: white; 
              border-radius: 3px;
              border-left: 3px solid #007bff;
            }
            button { 
              padding: 10px 20px; 
              margin: 10px 5px; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer;
            }
            .connect { background: #28a745; color: white; }
            .disconnect { background: #dc3545; color: white; }
            .clear { background: #6c757d; color: white; }
            .react-link {
              display: inline-block;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 5px;
            }
          </style>
        </head>
        <body>
          <h1>Server-Sent Events Demo</h1>
          <p>Выберите интерфейс для демонстрации SSE:</p>
          
          <a href="/react" class="react-link">React приложение с useServerSentEvent</a>
          
          <hr style="margin: 30px 0;">
          
          <h2>Встроенный JavaScript интерфейс:</h2>
          <p>Подключитесь к серверу для получения случайных чисел:</p>
          
          <button class="connect" onclick="connect()">Подключиться</button>
          <button class="disconnect" onclick="disconnect()">Отключиться</button>
          <button class="clear" onclick="clearMessages()">Очистить</button>
          
          <div id="messages"></div>
          
          <script>
            let eventSource = null;
            
            function connect() {
              if (eventSource) {
                eventSource.close();
              }
              
              eventSource = new EventSource('/events');
              const messagesDiv = document.getElementById('messages');
              
              eventSource.onopen = function(event) {
                addMessage('Подключение установлено', 'success');
              };
              
              eventSource.onmessage = function(event) {
                addMessage('Получено: ' + event.data, 'message');
              };
              
              eventSource.onerror = function(event) {
                addMessage('Ошибка соединения', 'error');
                eventSource.close();
              };
            }
            
            function disconnect() {
              if (eventSource) {
                eventSource.close();
                eventSource = null;
                addMessage('Соединение закрыто', 'info');
              }
            }
            
            function clearMessages() {
              document.getElementById('messages').innerHTML = '';
            }
            
            function addMessage(text, type) {
              const messagesDiv = document.getElementById('messages');
              const messageDiv = document.createElement('div');
              messageDiv.className = 'message';
              messageDiv.style.borderLeftColor = type === 'success' ? '#28a745' : 
                                                type === 'error' ? '#dc3545' : 
                                                type === 'info' ? '#17a2b8' : '#007bff';
              messageDiv.textContent = new Date().toLocaleTimeString() + ': ' + text;
              messagesDiv.appendChild(messageDiv);
              messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
          </script>
        </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }
    
    if (url.pathname === "/react") {
      return new Response(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>React SSE Demo с useServerSentEvent</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                        sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                #root {
                    min-height: 100vh;
                }
            </style>
        </head>
        <body>
            <div id="root"></div>
            
            <!-- React и ReactDOM -->
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            
            <!-- Babel для JSX -->
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            
            <!-- Наш клиентский код -->
            <script type="text/babel">
              // Импортируем хук useServerSentEvent
              const { useServerSentEvent } = (() => {
                // Простая реализация хука для демонстрации
                function useServerSentEvent(url, initialState) {
                  const [data, setData] = React.useState(initialState);
                  const [error, setError] = React.useState(null);
                  const [isConnected, setIsConnected] = React.useState(false);
                  const eventSourceRef = React.useRef(null);
                
                  React.useEffect(() => {
                    const eventSource = new EventSource(url);
                    eventSourceRef.current = eventSource;
                
                    eventSource.onopen = () => {
                      setIsConnected(true);
                      setError(null);
                    };
                
                    eventSource.onmessage = (event) => {
                      try {
                        const newData = JSON.parse(event.data);
                        setData(newData);
                      } catch (err) {
                        setData(parseInt(event.data) || event.data);
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
                
                return { useServerSentEvent };
              })();
              
              // Тип для данных, получаемых от сервера
              const MessageList = ({ messages }) => {
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
                        <div key={index} style={{
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
              const App = () => {
                const [messages, setMessages] = React.useState([]);
                const [isConnected, setIsConnected] = React.useState(false);
              
                // Используем хук useServerSentEvent
                const { data, error, isConnected: sseConnected } = useServerSentEvent(
                  'http://localhost:3000/events',
                  0
                );
              
                // Обрабатываем новые данные
                React.useEffect(() => {
                  if (data !== undefined && data !== 0) {
                    const newMessage = {
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
                        <li>Использует хук <code>useServerSentEvent</code> из родительской папки</li>
                        <li>Отображает получаемые числовые значения в реальном времени</li>
                        <li>Показывает статус подключения и ошибки</li>
                      </ul>
                    </div>
              
                    <style>{\`
                      @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                      }
                    \`}</style>
                  </div>
                );
              };
              
              // Рендерим приложение
              const container = document.getElementById('root');
              const root = ReactDOM.createRoot(container);
              root.render(<App />);
            </script>
        </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }
    
    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          const sendRandomNumber = () => {
            const randomNumber = Math.floor(Math.random() * 1000);
            const data = `data: ${randomNumber}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          };
          
          // Отправляем первое сообщение сразу
          sendRandomNumber();
          
          // Затем отправляем каждую секунду
          const interval = setInterval(sendRandomNumber, 1000);
          
          // Очищаем интервал при закрытии соединения
          req.signal.addEventListener('abort', () => {
            clearInterval(interval);
            controller.close();
          });
        },
      });
      
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Сервер запущен на http://localhost:${server.port}`);
console.log(`📡 SSE endpoint: http://localhost:${server.port}/events`);
console.log(`🌐 Веб-интерфейс: http://localhost:${server.port}`);
console.log(`⚛️  React приложение: http://localhost:${server.port}/react`);
