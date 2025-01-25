import { useContext } from "react";
import { ChatContext } from "../context/chatContext";

const useChatContext = () => {

    const context = useContext(ChatContext)

    if (!context)
        throw new Error("useChatContext must be used within a ChatContextProvider")

    return context
}

export default useChatContext;