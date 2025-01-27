<<<<<<< HEAD
import SidebarContextProvider from "./sidebarProvider";
import { AuthProvider } from "../context/AuthContext";
import { ColorProvider } from '../context/ColorContext';
import { WebSocketProvider } from "../websockets/WebSocketProvider";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }) {
    return (
        <SidebarContextProvider>
            <AuthProvider>
                <ColorProvider>
                    {children}
                </ColorProvider>
                <ToastContainer/>
            </AuthProvider>
        </SidebarContextProvider>
    )
=======
import SidebarContextProvider from "./sidebarProvider";
import { AuthProvider } from "../context/AuthContext";
import { ColorProvider } from '../context/ColorContext';
import { ToastContainer } from "react-toastify";

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <SidebarContextProvider>
                <ColorProvider>
                    {children}
                </ColorProvider>
                <ToastContainer/>
            </SidebarContextProvider>
        </AuthProvider>
    )
>>>>>>> master
}