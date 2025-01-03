import SidebarContextProvider from "./sidebarProvider";
import { AuthProvider } from "../context/AuthContext";
import { WebSocketProvider } from "../websockets/WebSocketProvider";

export default function Providers({ children }) {
    return (
        <SidebarContextProvider>
            <AuthProvider>
                <WebSocketProvider>
                    {children}
                </WebSocketProvider>
            </AuthProvider>
        </SidebarContextProvider>
    )
}