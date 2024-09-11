import { useState, useEffect, createContext } from "react";
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"





const alert = require('sweetalert2')

const AuthContext = createContext()

export default AuthContext

// export const AuthProvider = ({Children}) => {
//     const [authToken, setAuthToken] = useState(() => 
//         {
//             if(localStorage.getItem('authToken'))
//                 JSON.parse('authToken')
//             else 
//                 return null
//         }

//     )
// }

export const AuthProvider = ({ children }) => {

    //GETTING TOKEN
    const [AuthToken, setAuthToken] = useState( () =>
        localStorage.getItem("AuthToken") ? JSON.parse("AuthToken") : null
    );
    // useEffect(() => { 
    //     const token = localStorage.getItem("AuthToken");
    //     if (token)
    //         setAuthToken(JSON.parse("token")); // if token exit we send it to parse and set it 
    //     else
    //         setAuthToken(null); // other way if the token are not existed we should to set null
    // }, []);

    //GETTING NOW THE DECODE OF THE TOKEN AND STORE ==> {FULLNAME, USERNAME, EMAIL}
    const [UsersInfo, setUserInfo] = useState( () => localStorage.getItem("AuthToken") ? jwtDecode("AuthToken") : null);
    // useEffect(() => {
    //     const userinfo = localStorage.getItem("AuthToken") // fullname, username, email
    //     if (userinfo)
    //         setAuthToken(jwtDecode("AuthToken"));
    //     else
    //         setAuthToken(null);
    // }, [])

    const [loading, setloading] = useState(true)

    const navigation = useNavigate()

    const loginUsers = async (email, password) => {
        let tokenUrl = "http://localhost:3000/api/token/" 
        const response = await fetch(tokenUrl,{
            method: "POST",
            body: JSON.stringify({email, password}), // JSON.stringify: Coverting javascrit value to JSON string
            headers: {
                "content-type": "application/json"
            },
        })
        
        // if (!response.ok){
            //     throw new Error(`Response status: ${response.status}`);
            // }
            
    const JsonData = await response.json()
    
    if (JsonData.status === 200)
        {
            setAuthToken(JsonData) //JsonData have access token an the refresh token
            setUserInfo(jwtDecode(JsonData.access)) // decode access token
            localStorage.getItem("AuthToken", JSON.stringify(JsonData));
            navigation("/dashboard") // Routing the USERS after he loggedin "Success"
            alert.fire({
                position: "top-end",
                title: "you have successfully logged in",
                icon: "success",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            }) 
        } 
        else 
        {
            console.log(response.status)
            console.error("An Error Occurred")
            alert.fire({
                position: "top-end",
                title: "The email address or Username you entered isn't connected to an account",
                icon: "error",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            })
        }
    }
    
    const registerUsers = async (full_name, username, email, password, confirm_password) => {

    let tokenUrl = "http://localhost:3000/api/register/" 
    const response = await fetch(tokenUrl,{
        method: "POST",
        body: JSON.stringify({full_name, username, email, password, confirm_password}), // JSON.stringify: Coverting javascrit value to JSON string
        headers: {
            "content-type": "application/json"
        },
    })

    const JsonData = await response.json()
    
    if (JsonData.status === 201) // 201 status Created
    {
        // setAuthToken(JsonData) //JsonData have access token an the refresh token
        // setUserInfo(jwtDecode(JsonData.access)) // decode access token
        // localStorage.getItem("AuthToken", JSON.stringify(JsonData));
        navigation("/dashboard") // Routing the USERS after he loggedin "Success"
        alert.fire({
            position: "top-end",
            title: "you have successfully Registred",
            icon: "success",
            showConfirmButton: true,
            timerProgressBar: true,
            timer: 3000
        }) 
    } 
    else 
    {
        console.log(response.status)
        console.error("An Error Occurred")
        alert.fire({
            position: "top-end",
            title: "There is some error in Your registration",
            showConfirmButton: true,
            timerProgressBar: true,
            timer: 3000
        })
    }
    }

    //Logout Routing
    // To Logout the user we should just delete the tokens
    const logoutUsers = () => {
        setAuthToken(null)
        setUserInfo(null)
        localStorage.removeItem("AuthToken")
        navigation("/login")
        alert.fire({
            position: "top-end",
            title: "you have been successfully Logged out",
            icon: "success",
            showConfirmButton: true,
            timerProgressBar: true,
            timer: 3000
        })
    }

    const contextData = {
        AuthToken, setAuthToken, UsersInfo, setUserInfo, loginUsers, registerUsers, logoutUsers 
    }

    useEffect(() => {
        if (AuthToken)
        {
            setUserInfo(jwtDecode(AuthToken.access))
        }
        setloading(false)
    }, [AuthToken, loading])

    // Returning My context Provider
    return ( 
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    )
}