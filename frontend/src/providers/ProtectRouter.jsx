
import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { WebSocketProvider } from "../websockets/WebSocketProvider";
import ChatContextProvider from "../context/chatContext";
import { OnlineContextProvider } from "../context/onlineStatusContext";
import { UserContextProvider } from "../context/userContext";
import { ProfilContextProvider } from "../context/profilContext";

const ProtectRouter = () => {

    const { user, authtoken } = useContext(AuthContext)

    if (!authtoken) {
        return (
            <Navigate to="/login" replace />
        )
    }

        return (
            <WebSocketProvider>
                <ChatContextProvider>
                    <UserContextProvider>
                        <ProfilContextProvider>
                            <OnlineContextProvider>
                                <Outlet />
                            </OnlineContextProvider>
                        </ProfilContextProvider>
                    </UserContextProvider>
                </ChatContextProvider>
            </WebSocketProvider>
        );

};

export default ProtectRouter