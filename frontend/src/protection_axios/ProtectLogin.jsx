import { useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthContext from "../context_login_Register/AuthContext";

const ProtectLogin = ({ children }) => {
    const authtoken = useContext(AuthContext);
    const navigate = useNavigate();


    // If no token, allow access to public routes (login/register)
    if (!authtoken) {
        console.log("LLLL")
        return children;
    }
    useEffect(() => {
        if (authtoken || localStorage.getItem('authtoken')) // Check if user is authenticated
        {
            navigate('/profil', { replace: true });
        }
    }, [authtoken, navigate]);

    
    if (authtoken || localStorage.getItem('authtoken')) // If user is authenticated, don't render children
    {
        return <Navigate to="/profil" replace />;
    }

    return children;
};

export default ProtectLogin;