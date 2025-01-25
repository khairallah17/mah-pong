import { IoSearchOutline } from "react-icons/io5";
import { CgBlock } from "react-icons/cg";
import { CgUnblock } from "react-icons/cg";
import { PiGameControllerFill } from "react-icons/pi";
import React, { useEffect } from "react";
import ActiveChat from "./activeChat";
import useChatContext from "../hooks/useChatContext";
import { useAuthContext } from "../hooks/useAuthContext";
import useWebsocketContext from "../hooks/useWebsocketContext";

import { RxCross1 } from "react-icons/rx";
import { IoIosSend } from "react-icons/io";
import { LuCirclePlus } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { MdEmojiEmotions } from "react-icons/md";

const Chat = () => {

    const {  
        users,
        messages,
        selectedUserId, 
        isBlocked, setIsBlocked,
        fetchBlockStatus,
        unblock,
        loadUsers,
        loadConversation,
        initializeWebSocket,
        handleUserSelect,
        block,
        scrollToBottom,
        showDetails,
        filterUsername, setFilterUsername,
        filteredUsers, setFilteredUsers,
        showSide, setShowSide,
        handel,
        setShowDetails
    } = useChatContext()

    const { user } = useAuthContext()
    const { fullname, username } = user

    const { wsManager } = useWebsocketContext()

    useEffect(() => {

        if (filterUsername == null || filterUsername == "") {
            setFilteredUsers(users)
            return 
        }

        setFilteredUsers(state => state.map(item => item.username == filterUsername))

    }, [filterUsername])

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

    const handleClick = () => {
        if (isBlocked) {
            console.log("Unblocking user...");
            unblock(selectedUserId);
        } else {
            console.log("Blocking user...");
            block(selectedUserId);
        }
        setIsBlocked(!isBlocked)
    };

    return (
        <div className={`grid ${showDetails ? "lg:grid-cols-[3fr_1fr]" : "lg:grid-cols-1"} lg:grid-rows-1 lg:grid-cols-2 grid-rows-[2fr_1fr] h-full text-[#FFFFFF50] gap-5  w-full relative sm:pb-5 sm:px-5 overflow-scroll`}>
            
            <div className={` w-full grid ${!showSide ? "md:grid-cols-[1fr_2fr]" : "lg:grid-cols-[1fr_3fr]"} gap-4 duration-500`}>
                {/* User List Section */}
                <div className={`border-[3px] w-full border-black bg-gradient-to-t  from-black/25 to-black/50  bg-opacity-30 rounded-3xl md:rounded-l-3xl space-y-4 ${!showSide ? 'hidden' : "flex"} flex-col gap-10`}>
                    <div className="flex flex-col gap-4 md:gap-2 pt-4 px-4">
                        <h1 className="font-bold text-white text-xl pl-1">Messages</h1>
                        <div className="flex gap-2 items-center bg-white py-1 px-3 rounded-full">
                            <IoSearchOutline className=" text-black text-2xl"/>
                            <input
                                type="text"
                                placeholder="Search"
                                className="rounded-lg p-1 px-3 w-full outline-none text-black"
                                value={filterUsername}
                                onChange={e => setFilterUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Dynamic User List */}
                    <div className="flex flex-col gap-2 overflow-y-auto px-4"> {/* User list */}
                        {filteredUsers?.length > 0 && filteredUsers?.map((user, index) => {
                            if (!user)
                                return
                            if (user?.img?.includes('usermanagement:8000'))
                                user.img = user.img.replace('usermanagement:8000', 'localhost:8001');
                            const lastMessage = messages
                                .filter(msg => msg.sender === user.id || msg.receiver === user.id)
                                .slice(-1)[0]?.content || "No messages yet";

                            return (
                                <div key={index}
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
                                    <div className="flex flex-col">
                                        <p className="font-semibold">{user.fullname}</p>
                                        <p className="text-sm text-gray-300">{lastMessage}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Section */}
                <div className={`flex justify-between rounded-[30px] duration-200 md:rounded-r-[30px] border-[3px] border-black flex-col gap-5`}>
                    {!selectedUserId ? 
                    (
                        <div className="w-full h-full flex items-center justify-center  text-2xl">
                            select your friend
                        </div>
                    )
                    :
                    (
                        <div className='max-h-full h-fit flex flex-col gap-4'>
                            <div className="border-black h-[100px] bg-gradient-to-l  from-black/15 to-black/50  abg-opacity-30 bg-opacity-25 p-4 flex rounded-t-[27px] items-center justify-between">
                                <div className="flex gap-2 ml-[15px]">
                                    <button onClick={() => setShowSide(!showSide)}>
                                        <RxCross1 className={`${showSide && "rotate-45"} duration-200`} />
                                    </button>
                                    <div className="h-16 w-16 rounded-full overflow-hidden">
                                        <img src={users.find(user => user.id === selectedUserId)?.img} alt="profile"/>
                                    </div>
                                    <div className="ml-3 justify-center flex flex-col text-lg">
                                        <p className="font-semibold">
                                            {selectedUserId ? users.find(user => user.id === selectedUserId)?.fullname : 'Select a user'}
                                        </p>
                                        <p className="text-green-600">Online</p> {/* changing online and offline*/}
                                    </div>
                                </div>
                                <button onClick={() => setShowDetails(!showDetails)}>
                                    <MdInfoOutline onClick={handel} className="text-[30px] cursor-pointer"/>
                                </button>
                            </div>
                            <ActiveChat />
                        </div>
                    )
                    }
                </div>
            </div>

            <div className={`${showDetails ? "block" : "hidden"} w-full duration-200`}>
                <div className="flex flex-col gap-14  w-full  p-5 border-[3px] border-black rounded-[30px]"> {/* User details*/}
                    <h1 className="font-bold text-3xl text-white text-center">Details</h1>
                    <div className="flex flex-col items-center gap-3">
                        <div className=" h-28 w-28 rounded-full overflow-hidden border-4 border-green-700 place-items-center">
                            <img src={users.map(item => selectedUserId == item.id ? item.img : "")} alt="photo" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold text-2xl">{users.map(user => user.id == selectedUserId ? user.username : "")}</p> {/* Fullname */}
                            <p className="font-semibold text-xl">{users.map(user => user.id == selectedUserId ? user.fullname : "")}</p> {/* Username */}
                        </div>
                    </div>
                    <div className="flex gap-8 justify-center items-center"> {/* challenge/ block*/}
                        <button className="h-16 w-32 border-[4px] border-blue-800 flex items-center justify-center hover:bg-blue-900 rounded-3xl  font-bold"><PiGameControllerFill className="text-[45px]"/> </button>
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
        </div>
    )
}

export default Chat;