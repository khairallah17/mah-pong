import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectAuthRouter = () => {
    
    const { authtoken } = useContext(AuthContext);

    if (authtoken) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;

};

export default ProtectAuthRouter