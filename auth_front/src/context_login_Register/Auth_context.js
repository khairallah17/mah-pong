import { useContext, useState, useEffect, Children } from "react";
import { jwtDecode } from "jwt-decode"
// import { useNavigate } from "react-router-dom"

// const alert = require('sweetalert2')

const Auth_context = useContext();

export default Auth_context

// export const AuthProvider = ({Children}) => {
//     const [authToken, setauthToken] = useState(() => 
//         {
//             if(localStorage.getItem('authToken'))
//                 JSON.parse('authToken')
//             else 
//                 return null
//         }

//     )
// } 
export const AuthProvider = ({Children}) => {

    //GETTING TOKEN
    const [AuthToken, setAuthToken] = useState(null)
    useEffect(() => { 
        const token = localStorage.getItem("authToken");
        if (token)
            setauthToken(JSON.parse("token")); // if token exit we send it to parse and set it 
        else
            setauthToken(null); // other way if the token are not existed we should to set null
    }, []);

    //GETTING NOW THE DECODE OF THE TOKEN AND STORE ==> {FULLNAME, USERNAME, EMAIL}
    const [UsersInfo, setUserInfo] = useState(null)
    useEffect(() => {
        const userinfo = localStorage.getItem("authToken") // fullname, username, email
        if (userinfo)
            setAuthToken(jwtDecode("authToken"));
        else
            setAuthToken(null);
    }, [])
};