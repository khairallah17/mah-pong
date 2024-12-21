class WebSocketManager {
    static instance;

    constructor(url) {
        if (WebSocketManager.instance) {
            return WebSocketManager.instance;
        }

        this.url = url;
        this.websocket = null;
        WebSocketManager.instance = this;
    }

    connect(onMessage) {
        if (!this.websocket || this.websocket.readyState === WebSocket.CLOSED) {
            this.websocket = new WebSocket(this.url);

            this.websocket.onopen = () => {
                console.log("WebSocket connected");
            };

            this.websocket.onmessage = (event) => {
                onMessage(event.data);
            };

            this.websocket.onclose = () => {
                console.log("WebSocket closed, reconnecting...");
                setTimeout(() => this.connect(onMessage), 5000); // Reconnect after 5 seconds
            };

            this.websocket.onerror = (error) => {
                console.error("WebSocket error", error);
                this.websocket.close();
            };
        }
    }

    sendMessage(message, players) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const payload = players ? { message, players } : { message };
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
