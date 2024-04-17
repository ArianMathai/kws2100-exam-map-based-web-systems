import React, { useEffect, useState } from 'react';

const WebSocketComponent = () => {
    const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);

    useEffect(() => {
        // Function to initialize the WebSocket connection
        const connectWebSocket = () => {
            const ws = new WebSocket('wss://your-websocket-url');

            ws.onopen = () => {
                console.log('WebSocket connected');
            };

            ws.onmessage = (event) => {
                console.log('Message received:', event.data);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected. Attempting to reconnect...');
                // Attempt to reconnect after 1 minute
                setTimeout(() => {
                    connectWebSocket();
                }, 60000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                ws.close();
            };

            setWebSocket(ws);
        };

        // Initialize the WebSocket connection
        connectWebSocket();

        // Cleanup function to close the WebSocket when the component unmounts
        return () => {
            if (webSocket) {
                webSocket.close();
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once

    return (
        <div>
            <h1>WebSocket Listener</h1>
            {/* Your component UI here */}
        </div>
    );
};

export default WebSocketComponent;