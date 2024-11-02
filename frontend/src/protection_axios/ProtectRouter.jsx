import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context_login_Register/AuthContext";

const ProtectRouter = () => {
    const { user, authtoken } = useContext(AuthContext);


    console.log(authtoken);
    if (!authtoken) {
        // console.log("You Should To be Authenticated First");
        return <Navigate to="/login" replace />;
    }
    console.log("authtoken");
    return <Outlet />;
};

export default ProtectRouter