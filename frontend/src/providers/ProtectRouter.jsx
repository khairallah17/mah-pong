import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { WebSocketProvider } from "../websockets/WebSocketProvider";

const ProtectRouter = () => {
    
    const { user, authtoken } = useContext(AuthContext);

    if (!authtoken) {
        return (
            <Navigate to="/login" replace />
        )
    }
        return (
            <WebSocketProvider>
                <Outlet />
            </WebSocketProvider>
        );

};

export default ProtectRouter