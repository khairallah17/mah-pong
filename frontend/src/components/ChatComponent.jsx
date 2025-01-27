import { IoIosSend } from "react-icons/io";
import { LuCirclePlus } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { MdEmojiEmotions } from "react-icons/md";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { IoChevronBackOutline } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import { CgBlock } from "react-icons/cg";
import { CgUnblock } from "react-icons/cg";
import { PiGameControllerFill } from "react-icons/pi";
import React, { useState, useEffect, useRef } from "react";

import useChatContext from "../hooks/useChatContext";
import { useAuthContext } from "../hooks/useAuthContext";

const Chat = () => {
    const url_host = import.meta.env.VITE_HOST_URL
    const { user, authtoken } = useAuthContext()
    const { username } = user

    const { 
        users, setUsers,
        messages, setMessages,
        newMessage, setNewMessage,
        selectedUserId, setSelectedUserId,
        loading, setLoading,
        hand, setHand,
        isBlocked, setIsBlocked,
        handleClick,
        fetchBlockStatus,
        unblock,
        block,
        loadUsers,
        loadConversation,
        initializeWebSocket,
        handleUserSelect,
        handleSendMessage,
        scrollToBottom,
        socketRef,
        messagesEndRef,
        sendGameInvitation, formatTime
     } = useChatContext()

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId !== null) {
            loadConversation(selectedUserId);
            initializeWebSocket(selectedUserId);
            fetchBlockStatus(selectedUserId);
        }
    }, [selectedUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    return (
        <div className="flex h-full py-[20px] w-full px-[0px] sm:px-0 relative"    >
            {/* User List Section */}
            <div className={`
                    sm:min-w-80
                    md:max-w-80  
                    w-full 
                    mx-[20px]
                    sm:mx-[20px] 
                    sm:mr-[20px]  
                    md:rounded-r-none 
                    md:mx-0 
                    md:mr-0 
                    md:ml-[20px] 
                    border-[3px] 
                    border-black 
                    bg-gradient-to-t 
                    from-black/25 
                    to-black/50 
                    bg-opacity-30 
                    rounded-l-3xl 
                    rounded-r-3xl 
                    ${selectedUserId ? 'hidden md:flex' : 'flex'} 
                    flex-col 
                    gap-10 
                    py-2
                `}
                    
>

                <div className="flex flex-col gap-2 pt-4 px-4">
                    <h1 className="font-bold text-white text-xl pl-1 my-1">Messages</h1>
                    <div className="flex gap-2 p-1 items-center bg-white   rounded-full ">
                        <IoSearchOutline className=" text-black text-2xl mx-2"/>
                        <input type="text" placeholder="Search" className="rounded-lg p-1 px-3 w-full outline-none "/>
                    </div>
                </div>

                {/* Dynamic User List */}
                <div className="flex flex-col gap-2 overflow-y-auto px-4"> {/* User list */}
                    {users.map((user) => {
                        if (user.img.startsWith('http://usermanagement:8000')) {
                            user.img = user.img.replace('http://usermanagement:8000', `${url_host}/api/usermanagement`);
                        }
                        const lastMessage = messages
                            .filter(msg => msg.sender === user.username || msg.receiver === user.username)
                            .slice(-1)[0]?.content;

                        const displayedMessage = lastMessage 
                            ? lastMessage.length > 20
                                ? lastMessage.substring(0, 20) + "..."
                                : lastMessage
                            : "No messages yet";

                        return (
                            <div key={user.id}
                                onClick={() => handleUserSelect(user.id)}
                                className={`hover:bg-blue-950 p-2 rounded-lg flex gap-2 cursor-pointer user ${selectedUserId === user.id ? "selected" : ""}`}>
                                {/* User Profile Image */}
                                <div className="h-12 w-12 rounded-full overflow-hidden border border-purple-950">
                                    <img 
                                        src={user.img ? user.img : "./images/pong_logo.png"} 
                                        alt="profile" 
                                    />
                                </div>

                                {/* User Information */}
                                <div className="md:flex flex-col">
                                    <p className="font-semibold">{user.fullname}</p>
                                    <p className="text-sm text-gray-300">{displayedMessage}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Section */}
            {/* /// */}
            <>
                {!selectedUserId ? 
                (
                    <div className={`grow hidden md:flex justify-between rounded-[30px] md:ml-0  md:rounded-l-[0px] md:rounded-r-[30px] mr-[20px]   border-[3px] md:border-l-0 border-black flex-col gap-5 `}> 
                    <div className="div">
                        select your friend
                    </div>
                    </div>
                )
                :
                (
                <div className={`grow  ${selectedUserId ? 'flex' : 'hidden'}  ml-[20px]  justify-between rounded-[30px]  md:ml-0  md:rounded-l-[0px] md:rounded-r-[30px] mr-[20px]   border-[3px] md:border-l-0 border-black flex-col gap-5 `}>
                <div className={`border-black bg-gradient-to-l  from-black/15 to-black/50  abg-opacity-30 bg-opacity-25 p-4 flex h-[100px] rounded-t-[27px] md:rounded-l-[0px] lg:rounded-tr-[27px] items-center justify-between`}>
                    <div className=" gap-2  flex flex-row justify-center h-full items-center ">
                        <button className=" text-2xl md:hidden" onClick={()=>setSelectedUserId(null)}>
                            <IoChevronBackOutline  />
                        </button>
                        <div className="h-16 w-16 rounded-full overflow-hidden  ">
                            <img src={users.find(user => user.id === selectedUserId)?.img} alt="profile"/>
                        </div>
                        <div className="ml-3 justify-center flex flex-col text-lg">
                            <p className="font-semibold">
                                {selectedUserId ? users.find(user => user.id === selectedUserId)?.fullname : 'Select a user'}
                            </p>
                            <p className="text-green-600">Online</p> {/* changing online and offline*/}
                        </div>
                    </div>
                        <MdInfoOutline onClick={()=> setHand(!hand)} className="text-[30px] cursor-pointer"/>
                </div>


                <div id="message" className="overflow-auto h-full grid px-4 gap-2">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`p-2 rounded-2xl flex flex-col break-words px-3 w-fit ${
                                msg.sender === username 
                                ? 'place-self-end bg-blue-600 text-white' 
                                : 'bg-gray-700 text-white'
                            }`}
                            style={{ 
                                maxWidth: "60%", 
                                wordWrap: "break-word", 
                                overflowWrap: "break-word", 
                                wordBreak: "break-word" 
                            }}
                        >
                            {msg.message_type === "invite" ? (
                                <div className="game-invitation bg-blue-100 p-4 rounded-lg flex items-center justify-between">
                                    <span>{msg.message}</span>
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        onClick={() => startGame(msg.sender)}
                                    >
                                        Play Now
                                    </button>
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                            <div className="flex place-self-end justify-end gap-1 items-center">
                                <p className="text-xs">{formatTime(msg.timestamp)}</p>
                                <IoCheckmarkDoneOutline 
                                    className={`text-sm ${msg.sender === username 
                                        ? msg.seen
                                            ? "text-green-600" 
                                            : "text-gray-400"
                                        : "hidden" 
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* <div className="overflow-auto h-full justify-end px-4 gap-2 flex flex-col">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`p-2 rounded-2xl flex flex-col break-words px-3 w-fit ${
                                msg.sender === username 
                                ? 'place-self-end bg-blue-600 text-white' 
                                : 'bg-gray-700 text-white'
                            }`}
                            style={{ 
                                maxWidth: "60%", 
                                wordWrap: "break-word", 
                                overflowWrap: "break-word", 
                                wordBreak: "break-word" }}
                        >
                            {msg.message_type === "invite" ? (
                                <div className="game-invitation bg-blue-100 p-4 rounded-lg flex items-center justify-between">
                                    <span>{msg.message}</span>
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        onClick={() => startGame(msg.sender)}
                                    >
                                        Play Now
                                    </button>
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                            <div className="flex place-self-end justify-end gap-1 items-center">
                                <p className="text-xs">{formatTime(msg.timestamp)}</p>
                                <IoCheckmarkDoneOutline 
                                    className={`text-sm ${msg.sender === username 
                                        ? msg.seen
                                            ? "text-green-600" 
                                            : "text-gray-400"
                                        : "hidden" 
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div> */}

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
                )
                }
            </> 
            {hand && <>
            <div className={` absolute w-full h-full xl:w-fit justify-center bg-gray-900 bg-opacity-50 flex items-center xl:h-full xl:relative xl:bg-transparent xl:top-0 xl:right-0 2xl:flex `} >
                <div className="flex flex-col gap-14 xl:h-full w-[60%] md:w-[27rem] xl:w-full p-9 xl:border-[3px] xl:border-black border border-gray-300/15 bg-black bg-opacity-40 backdrop-blur-md rounded-[30px] mr-[20px]"> {/* User details*/}
                    <div className="flex flex-row  items-center justify-center ">

                    <button className=" fixed left-4 flex xl:hidden" onClick={()=> setHand(false)}>
                        <IoCloseSharp className="text-[30px]"/>
                    </button>
                    <div className="self-center">

                    <h1 className="font-bold text-3xl text-white text-center ">Details</h1>
                    </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className=" h-28 w-28 rounded-full overflow-hidden border-4 border-green-700 place-items-center">
                            <img src={users.find(user => user.id === selectedUserId)?.img} alt="profile"/>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold text-xl">
                                {selectedUserId ? users.find(user => user.id === selectedUserId)?.fullname : 'Select a user'}
                            </p> {/* Fullname */}
                            <p className="font-semibold text-xl">
                                {selectedUserId ? users.find(user => user.id === selectedUserId)?.username : 'Select a user'}
                            </p> {/* Username */}
                        </div>
                    </div>
                    <div className="flex gap-8 justify-center items-center"> {/* challenge/ block*/}
                        <button 
                            className="h-16 w-32 border-[4px] border-blue-800 flex items-center justify-center hover:bg-blue-900 rounded-3xl  font-bold"
                                onClick={sendGameInvitation}><PiGameControllerFill className="text-[45px]"/> </button>
                        <button
                            onClick={handleClick}
                            className={`h-16 w-32 border-[4px] flex items-center justify-center rounded-3xl font-bold ${
                                isBlocked ? 'bg-green-600  border-green-700 hover:bg-green-500' : 'bg-red-700  border-red-900 hover:bg-red-600'
                            }`}
                            title={isBlocked ? 'Unblock' : 'Block'}
                            >
                            {isBlocked ? <CgUnblock className="text-[45px]" /> : <CgBlock className="text-[45px]" />}</button>
                    </div>     
                </div>
            </div>
                            </>
            }
            
        </div>
    )
}

export default Chat;