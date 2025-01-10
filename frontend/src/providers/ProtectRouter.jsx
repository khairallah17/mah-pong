import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectRouter = () => {
    
    const { user, authtoken } = useContext(AuthContext);

    if (!authtoken) {
        return <Navigate to="/login" replace />;
    }
    
    return <Outlet />;

};

export default ProtectRouter