import React from 'react'
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import useChatContext from '../hooks/useChatContext';
import { useAuthContext } from '../hooks/useAuthContext';

const ActiveChat = () => {


    const {  
        users,
        messages, 
        newMessage, setNewMessage,
        selectedUserId,
        messagesEndRef,
        handleSendMessage,
        handel,
        showDetails, setShowDetails
    } = useChatContext()

    const { user }= useAuthContext();
    const { username } = user

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <>
            <div className="!overflow-scroll h-[700px] py-3 justify-end px-4 gap-2 space-y-4">
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
                        <p>{msg.content}</p>
                    <div className="flex place-self-end justify-end gap-1 items-center">
                        <p className="text-xs">{formatTime(msg.timestamp)}</p>
                        <IoCheckmarkDoneOutline className={`text-sm ${msg.seen ? "text-green-600" : "text-gray-400"}`}/>
                    </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className=""> {/* send msg footer*/}
                <div className="px-4 pb-4  "> {/* sending msg*/}
                    <div className="flex h-[45px] gap-2 items-center bg-black py-1 px-3 rounded-full">
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
        </>
    )
}

export default ActiveChat