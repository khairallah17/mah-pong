import { IoIosSend } from "react-icons/io";
import { LuCirclePlus } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { MdEmojiEmotions } from "react-icons/md";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import axios from 'axios';




const Chat = ({ roomName }) => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [socket, setSocket] = useState(null);

    // Fetch users from Django API on component mount

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    //Load conversation messages dynamically

    const loadConversation = async (userId) => {
        try {
            setSelectedUser(userId); //Highlight selected user
            const response = await axios.get('http://localhost:8000/api/conversation/${userId}/');
            setMessages(response.data);
        } catch (error) {
            console.error("Error Loading conversation:", error);
        }
    };

    // WebSocket connection for real-time messaging

    useEffect(() => {
        if (selectedUser) {
            const chatSocket = new WebSocket(
                'ws://localhost:8000/ws/chat/${roomName}/'
            );
            
            chatSocket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                setMessages((prevMessages) => [...prevMessages, data.message]);
            };
            
            chatSocket.onclose = () => {
                console.log("WebSocket closed");
            };
            
            setSocket(chatSocket);
            return () => chatSocket.close();
        }
    }, [selectedUser]);
        
    const sendMessage = () => {
        if (socket && message.trim() !== "") {
            socket.send(JSON.stringify({ message }));
            setMessage("");
        }
    };
    const friends = [];
    for (let i = 0; i < 20; i++) {
        friends.push(
            <div className="bg-purple-800 p-2 rounded-lg flex gap-2"> {/* friend*/}
                <div className="h-12 w-12 rounded-full overflow-hidden border border-purple-950"> {/* friend img*/}
                    <img src="img.webp" alt="photo"/>
                </div>
                <div className="md:flex flex-col justify-center hidden"> {/* frined info*/}
                    <p className="font-semibold">hamza salam</p>
                    <p className="text-sm">wa fen abro!</p>
                </div>
                <div className="md:flex place-self-end gap-1 justify-end grow text-right hidden">
                    <p className="text-xs">time</p>
                </div>
            </div>
        )
    }
    const chats = [];
    for (let i = 0; i < 20; i++) {
        chats.push(
            <div className="grow flex flex-col gap-2"> {/* conversation*/}
                <div className="bg-purple-600 p-2 rounded-2xl px-3 w-fit max-w-[60%] flex flex-col break-all">
                    <p className="">Hello</p>
                    <div className="flex place-self-end justify-end gap-1 items-center">
                        <p className="text-xs">time</p>
                        <IoCheckmarkDoneOutline className="text-sm"/>
                    </div>
                </div>
                <div className="bg-purple-600 p-2 rounded-2xl px-3 w-fit max-w-[60%] place-self-end flex flex-col break-all">
                    <p className="">checking the messages</p>
                    <div className="flex place-self-end justify-end gap-1 items-center">
                        <p className="text-xs">time</p>
                        <IoCheckmarkDoneOutline className="text-sm"/>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="flex h-full w-full relative">
            <div className="absolute bg-black h-full w-full opacity-50 z-[-1]"></div>

            {/* User List Section */}
            <div className="md:w-[320px] bg-purple-900 flex flex-col gap-10 py-2 md:py-0">
                <div className="md:flex hidden flex-col gap-2 pt-4 px-4"> {/* search*/}
                    <h1 className="font-bold text-white text-xl">Messages</h1>
                    <div className="flex gap-2 items-center bg-white py-1 px-3 rounded-full">
                        <IoSearchOutline className="text-2xl"/>
                        <input type="text" placeholder="Search" className="rounded-lg p-1 px-3 w-full outline-none "/>
                    </div>
                </div>

                {/* Dynamic User List */}
                <div className="flex flex-col gap-2 overflow-y-auto px-4"> {/* container friends*/}
                    {/* {friends} */}
                    {users.map((user) => (
                        <div key={user.id}
                             onClick={() => loadConversation(user.id)}>
                             className={`bg-purple-800 p-2 rounded-lg flex gap-2 cursor-pointer ${selectedUser === user.id ? 'bg-purple-700' : ''}`}
                            <div className="h-12 w-12 rounded-full overflow-hidden borded borded-purple-950">
                                <img src="img.webp" alt="profile" />
                            </div>
                            <div className="md:flex flex-col justify-center hidden">
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-sm">Click to chat</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Section */}
            <div className="grow bg-purple-900 flex flex-col gap-5"> {/* chat*/}
                <div className="bg-yellow-800 p-4 flex items-center justify-between"> {/* header*/}
                    <div className="flex gap-2">
                        <div className="h-12 w-12 rounded-full overflow-hidden border border-purple-950"> {/* sender img*/}
                            <img src="img.webp" alt="profile"/>
                        </div>
                        <div className="flex flex-col justify-center"> {/* sender info*/}
                            <p className="font-semibold">{selectedUser ? users.find(user => user.id === selectedUser)?.username : 'Select a user'}</p>
                            <p className="text-green-600">Online</p>
                        </div>
                    </div>
                    <MdInfoOutline className="text-2xl"/>
                </div>

                {/* Chat Messages */}
                <div className="overflow-auto px-4 gap-2 flex flex-col">
                    {/* {chats} */}
                    {messages.map((msg, index) => (
                        <div key={index} className={`p-2 rounded-2xl px-3 w-fit max-w-[60%] ${msg.sender === 'You' ? 'place-self-end bg-blue-700' : 'bg-purple-600'}`}>
                            <p>{msg.content}</p>
                            <div className="flex place-self-end justify-end gap items-center">
                                <p className="text-xs">{msg.timestamp}</p>
                                <IoCheckmarkDoneOutline className="text-sm" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className=""> {/* send msg footer*/}
                    <div className="px-4 pb-4 "> {/* sending msg*/}
                        <div className="flex gap-2 items-center bg-black py-1 px-3 rounded-full">
                            <LuCirclePlus className="text-2xl text-blue-700"/>
                            {/* <MdEmojiEmotions className="text-2xl text-blue-700"/> */}
                            <input type="text" 
                                   value={message} 
                                   onChange={(e) => setMessage(e.target.value)} 
                                   onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                   placeholder="Type your message here ..." className="rounded-lg p-1 px-3 w-full outline-none bg-transparent text-white" />
                            <RiSendPlaneFill onClick={sendMessage} className="text-2xl text-blue-700"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-[320px] p-4 bg-purple-900 hidden lg:flex">
                <div className="flex flex-col gap-8 pt-4 px-4"> {/* User details*/}
                    <h1 className="font-bold text-3xl text-white text-center">Details</h1>
                    <div className="flex flex-col items-center gap-3">
                        <div className=" h-28 w-28 rounded-full overflow-hidden border-4 border-green-700 place-items-center">
                            <img src="img.webp" alt="photo" />
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="font-semibold text-2xl">hamza salam</p>
                            <p className="font-semibold">sirius</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <button className="h-10 w-32 rounded-full bg-blue-900">View Profile</button>
                        </div>
                    </div>
                    <div className="flex flex-col border-t-2 rounded-full px-32 items-center"></div>
                    <div className="flex flex-col gap-3 items-center"> {/* challange/ block*/}
                        <button className="h-10 w-52 rounded-full bg-blue-500 font-semibold">Invite game</button>
                        <button className="h-10 w-52 rounded-full bg-red-600 font-bold">Block</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Chat;