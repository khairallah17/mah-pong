import { IoIosSend } from "react-icons/io";
import { LuCirclePlus } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { MdEmojiEmotions } from "react-icons/md";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import { CgBlock } from "react-icons/cg";
import { PiGameControllerFill } from "react-icons/pi";
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const Chat = ({ roomName }) => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const [hand, setHand] = useState(false);
    const accessToken = JSON.parse(localStorage.getItem('authtoken')).access;
    const { username, fullname } = jwtDecode(accessToken);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId !== null) {
            loadConversation(selectedUserId);
            initializeWebSocket(selectedUserId);
        }
    }, [selectedUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadUsers = async () => {
        try {
            const response = await axios.get("http://localhost:8003/chat/api/users/", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            console.log(response.data);
            setUsers(response.data);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const loadConversation = async (userId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8003/chat/api/conversation/${userId}/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            console.log(response.data)
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

        const chatSocket = new WebSocket(`ws://localhost:8003/ws/chat/?user_id=${userId}&token=${accessToken}`);

        socketRef.current = chatSocket;

        chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "chat_message") {
                setMessages((prev) => [...prev, data]);
            }
        };

        chatSocket.onclose = () => {
            console.error("Chat socket closed unexpectedly");
        };
    };

    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== "") {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    message: newMessage,
                    user_id: selectedUserId,
                }));
                setNewMessage("");
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handel = () => {
        setHand(!hand);
    }

    return (
        <div className="flex h-full text-[#FFFFFF50] bg-[#10104F] w-full relative">
            <div className="absolute bg-black h-full w-full opacity-50 z-[-1]"></div>

            {/* User List Section */}
            <div className="md:w-[320px] my-[20px] ml-[20px] border-[3px] border-black bg-gradient-to-t  from-black/25 to-black/50  abg-opacity-30 rounded-l-3xl  flex flex-col gap-10 py-2 md:py-0">
                <div className="md:flex hidden flex-col gap-2 pt-4 px-4">
                    <h1 className="font-bold text-white text-xl pl-1">Messages</h1>
                    <div className="flex gap-2 items-center bg-white py-1 px-3 rounded-full">
                        <IoSearchOutline className=" text-black text-2xl"/>
                        <input type="text" placeholder="Search" className="rounded-lg p-1 px-3 w-full outline-none "/>
                    </div>
                </div>

                {/* Dynamic User List */}
                <div className="flex flex-col gap-2 overflow-y-auto px-4"> {/* User list */}
                    {users.map((user) => {
                        const lastMessage = messages
                            .filter(msg => msg.sender === user.id || msg.receiver === user.id)
                            .slice(-1)[0]?.content || "No messages yet";

                        return (
                            <div key={user.id}
                                onClick={() => handleUserSelect(user.id)}
                                className={`hover:bg-blue-950 p-2 rounded-lg flex gap-2 cursor-pointer user ${selectedUserId === user.id ? "selected" : ""}`}>
                                {/* User Profile Image */}
                                <div className="h-12 w-12 rounded-full overflow-hidden border border-purple-950">
                                    <img src={user.profile_image || "default-profile-img.webp"} alt="profile"/>
                                </div>

                                {/* User Information */}
                                <div className="md:flex flex-col hidden">
                                    <p className="font-semibold">{user.username}</p>
                                    <p className="text-sm text-gray-300">{lastMessage}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Section */}
            <div className="grow my-[20px] flex justify-between  rounded-r-[30px] mr-[20px]   border-[3px] border-l-0 border-black flex-col gap-5">
                <div className="border-black bg-gradient-to-l  from-black/15 to-black/50  abg-opacity-30 bg-opacity-25 p-4 flex h-[100px] rounded-tr-[27px] items-center justify-between">
                    <div className="flex gap-2 ml-[15px]">
                        <div className="h-16 w-16 rounded-full overflow-hidden">
                            <img src="img.webp" alt="profile"/>
                        </div>
                        <div className="ml-3 justify-center flex flex-col text-lg">
                            <p className="font-semibold">
                                {selectedUserId ? users.find(user => user.id === selectedUserId)?.username : 'Select a user'}
                            </p>
                            <p className="text-green-600">Online</p> {/* changing online and offline*/}
                        </div>
                    </div>
                        <MdInfoOutline onClick={handel} className="text-[30px] cursor-pointer"/>
                </div>

                <div className="overflow-auto px-4 gap-2 flex flex-col">
                    {messages.map((msg, index) => (
                        <div key={index} className={`p-2 rounded-2xl ${msg.sender === username ? 'place-self-end bg-blue-600' : 'bg-gray-700'}`}>
                            <p>{msg.content}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className=""> {/* send msg footer*/}
                    <div className="px-4 pb-4  "> {/* sending msg*/}
                        <div className="flex h-[45px] gap-2 items-center bg-black py-1 px-3 rounded-full">
                            <MdEmojiEmotions className="text-3xl cursor-pointer hover:text-yellow-400 text-blue-700"/>
                            <input  type="text" 
                               value={newMessage} 
                               onChange={(e) => setNewMessage(e.target.value)} 
                               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                               placeholder="Type your message here..." 
                               className="w-full  focus:outline-none bg-transparent text-white focus-none"/>
                                <RiSendPlaneFill onClick={handleSendMessage} className="text-3xl cursor-pointer hover:text-white text-blue-700"/>  
                        </div>
                    </div>
                </div>
            </div>
            <div className={` my-[20px] mr-[20px]   w-[400px]  xl:flex ${hand ? "flex" : "hidden"} `}>
                <div className="flex flex-col gap-14  w-full pt-9 px-2 border-[3px] border-black rounded-[30px]"> {/* User details*/}
                    <h1 className="font-bold text-3xl text-white text-center">Details</h1>
                    <div className="flex flex-col items-center gap-3">
                        <div className=" h-28 w-28 rounded-full overflow-hidden border-4 border-green-700 place-items-center">
                            <img src="img.webp" alt="photo" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold text-2xl">{fullname}</p> {/* Fullname */}
                            <p className="font-semibold text-xl">{username}</p> {/* Username */}
                        </div>
                    </div>
                    <div className="flex gap-8 justify-center items-center"> {/* challenge/ block*/}
                        <button className="h-16 w-32 border-[6px] border-blue-900 flex items-center justify-center hover:bg-blue-900 rounded-3xl  font-bold"><PiGameControllerFill className="text-[45px]"/> </button>
                        <button className="h-16 w-32 border-4 flex items-center justify-center rounded-3xl hover:bg-red-600 font-bold"><CgBlock className="text-[45px]"/></button>
                    </div>     
                </div>
            </div>
        </div>
    )
}

export default Chat;