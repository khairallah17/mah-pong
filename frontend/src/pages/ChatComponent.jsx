import { IoIosSend } from "react-icons/io";
import { LuCirclePlus } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { MdEmojiEmotions } from "react-icons/md";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';

const ChatComponent = ({ roomName }) => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId !== null) {
            loadConversation(selectedUserId);
            // initializeWebSocket(selectedUserId);
        }
    }, [selectedUserId]);

    const loadUsers = async () => {
        try {
            const response = await axios.get("http://localhost:8003/chat/api/users/", {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('authtoken')).access}`
                },
                withCredentials: true
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error loading users:", error);
            alert("Failed to load users");
        }
        console.log("heeeer",JSON.parse(localStorage.getItem('authtoken')).access);
    };

    const loadConversation = async (userId) => {  // Fixed userId casing
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8003/chat/api/conversation/${parseInt(userId, 10)}/`, {
                // headers: {
                //     // Authorization: `Bearer ${JSON.parse(localStorage.getItem('authtoken')).access}`
                // },
                // withCredentials: true
            });
            console.log(response.data)
            setMessages(response.data);
        } catch (error) {
            // console.error("Error loading conversation:", error);
            // alert("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    // const initializeWebSocket = (userId) => {
    //     if (socketRef.current) {
    //         socketRef.current.close();  
    //     }

    //     const chatSocket = new WebSocket(`ws://localhost:8000/ws/chat/${parseInt(userId, 10)}/`);

    //     socketRef.current = chatSocket;

    //     chatSocket.onmessage = (e) => {
    //         const data = JSON.parse(e.data);
    //         if (data.type === "chat_message") {
    //             setMessages((prev) => [...prev, data]);
    //         }
    //     };

    //     chatSocket.onclose = () => {
    //         console.error("Chat socket closed unexpectedly");
    //     };
    // };

    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== "") {
            // const chatSocket = new WebSocket(
            //     `ws://localhost:8000/ws/chat/${selectedUserId}/`
            // );

            // chatSocket.onopen = () => {
            //     chatSocket.send(
            //         JSON.stringify({
            //             message: newMessage,
            //             user_id: selectedUserId,
            //         })
            //     );
            //     setNewMessage("");
            // };
        }
    };

//     // Fetch Users List

//     useEffect(() => {
//         axios.get("http://localhost:8003/chat/api/users/")
//             .then((response) => {
//                 console.log(response.data);
//                 if (Array.isArray(response.data)) {
//                     setUsers(response.data);
//                 } else {
//                     setUsers([]);
//                 }
//             })   
//             .catch((error) => {
//                 console.log('error',error);
//                 setUsers([]);
//         });
// }, []);

//     const loadConversation = (user) => {
//         setSelectedUser(user);
//         console.log("here == ", user.id)
//         axios.get(`http://localhost:8003/chat/api/conversation/${user.id}/`)
//             .then((response) => setMessages(response.data))
//         .catch((error) => console.error("Error fetching messages:", error));
        
//         //Establish WebSocket for Real-Time Messaging

//         // const chatSocket = new WebSocket(
//         //     `ws://localhost:8000/ws/chat/1/`
//         // );
//         // console.log("WebSocket URL: ", chatSocket);

//         // chatSocket.onopen = () => console.log("Connected");
//         // chatSocket.onerror = (error) => console.error("WebSocket error:", error);

//         // chatSocket.onmessage = (e) => {
//         //     const data = JSON.parse(e.data);
//         //     setMessages((prevMessages) => [...prevMessages, data]);
//         // };

//         // chatSocket.onclose = () => {
//         //     console.log("WebSocket closed");
//         // };

//         // setSocket(chatSocket);
//         // console.log(data);
//     };
        
//     const sendMessage = () => {
//         if (socket && message.trim() !== "") {
//             const newMessage = {
//                 sender_id: 1,  
//                 receiver_id: selectedUserId, 
//                 message: message, 
//             };

//             // Send message through WebSocket for real-time update
//             socket.send(JSON.stringify({ message }));

//             // Post message to Django backend to save in the database
//             axios.post("http://localhost:8003/chat/api/send-message/", newMessage)
//                 .then((response) => {
                    
//                     //Update chat with the new message
                    
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         response.data
//                     ]);
//                     setMessage("");
//                 })
//                 .catch((error) => {
//                     console.error("Failed to send message:", error);
//                 });
//         }
//         console.log("goooooood");
//     };
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
                <div className="md:flex hidden flex-col gap-2 pt-4 px-4">
                    <h1 className="font-bold text-white text-xl">Messages</h1>
                    <div className="flex gap-2 items-center bg-white py-1 px-3 rounded-full">
                        <IoSearchOutline className="text-2xl"/>
                        <input type="text" placeholder="Search" className="rounded-lg p-1 px-3 w-full outline-none "/>
                    </div>
                </div>

                {/* Dynamic User List */}
                <div className="flex flex-col gap-2 overflow-y-auto px-4">
                    {users.map((user) => (
                        <div key={user.id}
                             onClick={() => handleUserSelect(user.id)}
                             className={`bg-purple-800 p-2 rounded-lg flex gap-2 cursor-pointer user ${selectedUserId === user.id ? "selected" : ""}`}>
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                                <img src="img.webp" alt="profile"/>
                            </div>
                            <div className="md:flex flex-col hidden">
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-sm">Click to chat</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Section */}
            <div className="grow bg-purple-900 flex flex-col gap-5">
                <div className="bg-yellow-800 p-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                            <img src="img.webp" alt="profile"/>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-semibold">
                                {selectedUserId ? users.find(user => user.id === selectedUserId)?.username : 'Select a user'}
                            </p>
                            <p className="text-green-600">Online</p>
                        </div>
                    </div>
                    <MdInfoOutline className="text-2xl"/>
                </div>

                <div className="overflow-auto px-4 gap-2 flex flex-col">
                    {messages.map((msg, index) => (
                        <div key={index} className={`p-2 rounded-2xl ${msg.sender === 1 ? 'place-self-end bg-blue-600' : 'bg-gray-700'}`}>
                            <p>{msg.message}</p>
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
                               value={newMessage} 
                               onChange={(e) => setNewMessage(e.target.value)} 
                               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                               placeholder="Type your message here..." 
                               className="w-full bg-transparent text-white focus-none"/>
                            <RiSendPlaneFill onClick={handleSendMessage} className="text-2xl text-blue-700"/>  
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

// return (
//     <div className="flex h-full w-full">
//         {/* User List (Sidebar) */}
//         <div className="w-[320px] bg-purple-900 p-4 overflow-y-auto">
//             <h1 className="text-white text-xl font-bold mb-4">Messages</h1>
//             {users.map((user) => (
//                 <div
//                     key={user.id}
//                     onClick={() => loadConversation(user)}
//                     className={`p-3 rounded-lg cursor-pointer ${selectedUser?.id === user.id ? 'bg-purple-700' : 'bg-purple-800'}`}
//                 >
//                     <p className="text-white">{user.username}</p>
//                 </div>
//             ))}
//         </div>

//         {/* Chat Section */}
//         <div className="grow bg-purple-900 flex flex-col">
//             {selectedUser ? (
//                 <>
//                     <div className="bg-yellow-800 p-4">
//                         <h2 className="text-white">{selectedUser.username}</h2>
//                     </div>
//                     <div className="flex-1 p-4 overflow-auto">
//                         {messages.map((msg, index) => (
//                             <div key={index} className={`p-2 rounded-lg max-w-xs ${msg.sender.username === selectedUser.username ? 'bg-purple-600' : 'bg-green-600'}`}>
//                                 <p>{msg.content}</p>
//                                 <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
//                             </div>
//                         ))}
//                     </div>
//                     <div className="p-4 bg-black flex items-center gap-2">
//                         <input
//                             type="text"
//                             value={message}
//                             onChange={(e) => setMessage(e.target.value)}
//                             onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//                             placeholder="Type your message..."
//                             className="w-full p-2 rounded-lg"
//                         />
//                         <button onClick={sendMessage} className="bg-blue-600 px-4 py-2 rounded-lg text-white">Send</button>
//                     </div>
//                 </>
//             ) : (
//                 <div className="flex justify-center items-center flex-1">
//                     <p className="text-white">Select a user to start chatting</p>
//                 </div>
//             )}
//         </div>
//     </div>
// );
}
export default ChatComponent;