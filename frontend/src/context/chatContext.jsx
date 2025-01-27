import { createContext, useState, useRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import useWebsocketContext from "../hooks/useWebsocketContext";
import axios from "axios";

export const ChatContext = createContext();

const ChatContextProvider = ({ children }) => {

    const { wsManager } = useWebsocketContext()

    const { authtoken } = useAuthContext()
    const { user } = useAuthContext()
    const { username } = user

    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hand, setHand] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showDetails, setShowDetails] = useState(false)
    const [filterUsername, setFilterUsername] = useState("")
    const [filteredUsers, setFilteredUsers] = useState([])
    const [showSide, setShowSide] = useState(true)

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const fetchBlockStatus = async (userId) => {
        const response = await axios.get(`http://localhost:8003/chat/api/block-status/${userId}/`, {
            headers: {
                Authorization: `Bearer ${authtoken}`,
            },
        });
        console.log("Block status response:", response.data);
    };
    const unblock = async (userId) => {
        try {
            await axios.post(`http://localhost:8003/chat/api/block_user/${userId}/`, {
                action: 'unblock'
            }, {
                headers: {
                    'Authorization': `Bearer ${authtoken}`
                }
            });
        } catch (error) {
            console.error(error.response?.data?.error || 'Failed to block user');
        }
    };


    const loadUsers = async () => {
        try {
            const response = await axios.get("http://localhost:8003/chat/api/users/", {
                headers: {
                    Authorization: `Bearer ${authtoken}`
                },
                withCredentials: true
            });
            setUsers(response.data);
            setFilteredUsers(response.data)
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const loadConversation = async (userId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8003/chat/api/conversation/${userId}/`, {
                headers: {
                    Authorization: `Bearer ${authtoken}`
                },
                withCredentials: true
            });
            setMessages(response.data.messages);
        } catch (error) {
            console.error("Error loading conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    const initializeWebSocket = (userId) => {
        if (socketRef.current) {
            socketRef.current.close();  
        }

        const chatSocket = new WebSocket(`ws://localhost:8003/ws/chat/?user_id=${userId}&token=${authtoken}`);

        socketRef.current = chatSocket;

        chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "chat_message") {
                setMessages((prev) => [...prev, data]);
            }
            else if (data.type === "error") {
                alert(data.message);
            }
        };

        chatSocket.onclose = () => {
            console.error("Chat socket closed unexpectedly");
        };
    };

    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
    };
    const block = async (userId) => {
        try {
            await axios.post(`http://localhost:8003/chat/api/block_user/${userId}/`, {
                action: 'block'
            }, {
                headers: {
                    'Authorization': `Bearer ${authtoken}`
                }
            });
        } catch (error) {
            console.error(error.response?.data?.error || 'Failed to block user');
        }
    };
    const handleSendMessage = () => {
        if (newMessage.trim() !== "") {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    message: newMessage,
                    user_id: selectedUserId,
                }));
                setNewMessage("");
                const sendTo = users.filter(item => selectedUserId == item.id)
                if (sendTo)
                    wsManager.sendMessage(`${username} sent you a message`, [sendTo[0].username], "/dashboard/chat")
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handel = () => {
        setHand(!hand);
    }

    const values = {
        users, setUsers,
        messages, setMessages,
        newMessage, setNewMessage,
        selectedUserId, setSelectedUserId,
        loading, setLoading,
        socketRef,
        hand, setHand,
        isBlocked, setIsBlocked,
        messagesEndRef,
        fetchBlockStatus,
        unblock,
        loadUsers,
        loadConversation,
        initializeWebSocket,
        handleUserSelect,
        block,
        handleSendMessage,
        scrollToBottom,
        handel,
        showDetails, setShowDetails,
        filterUsername, setFilterUsername,
        filteredUsers, setFilteredUsers,
        showSide, setShowSide
    }

    return (
        <ChatContext.Provider value={values}>
            {children}
        </ChatContext.Provider>
    )

}

export default ChatContextProvider