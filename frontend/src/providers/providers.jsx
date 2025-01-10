import SidebarContextProvider from "./sidebarProvider";
import { AuthProvider } from "../context/AuthContext";
import { ColorProvider } from '../context/ColorContext';
import { WebSocketProvider } from "../websockets/WebSocketProvider";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }) {
    return (
        <SidebarContextProvider>
            <AuthProvider>
                <WebSocketProvider>
                    <ColorProvider>
                        {children}
                    </ColorProvider>
                    <ToastContainer/>
                </WebSocketProvider>
            </AuthProvider>
        </SidebarContextProvider>
    )
}