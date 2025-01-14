class WebSocketManager {
    static instance;

    constructor(url) {
        if (WebSocketManager.instance) {
            return WebSocketManager.instance;
        }

        this.url = url;
        this.websocket = null;
        this.onMessageCallback = null;
        WebSocketManager.instance = this;
    }

    connect(onMessage) {
        this.onMessageCallback = onMessage;
        if (!this.websocket || this.websocket.readyState === WebSocket.CLOSED) {
            this.websocket = new WebSocket(this.url);

            this.websocket.onopen = () => {
                console.log("WebSocket connected");
            };

            this.websocket.onmessage = (event) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback(event.data);
                }
            };

            this.websocket.onclose = () => {
                console.log("WebSocket closed, reconnecting...");
                setTimeout(() => this.connect(this.onMessageCallback), 5000);
            };

            this.websocket.onerror = (error) => {
                console.error("WebSocket error", error);
                this.websocket.close();
            };
        }
    }

    setUrl(url) {
        this.url = url;
    }

    sendMessage(message, users) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const payload = users ? { 'message': message, 'users': users } : {'message': message };
            this.websocket.send(JSON.stringify(payload));
        } else {
            console.warn("WebSocket is not open");
        }
    }

    close() {
        if (this.websocket) {
            this.websocket.close();
        }
    }
}

export default WebSocketManager;