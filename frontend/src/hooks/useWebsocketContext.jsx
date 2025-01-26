import { useContext } from "react";
import { WebSocketContext } from "../websockets/WebSocketProvider";

const useWebsocketContext = () => {

    const context = useContext(WebSocketContext)

    if (!context)
        throw new Error("Error while creating websocket context")

    return context

}

export default useWebsocketContext;