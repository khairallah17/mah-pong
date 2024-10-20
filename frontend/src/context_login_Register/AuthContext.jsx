import { useState, useEffect, createContext } from "react";
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'





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
        localStorage.getItem("AuthToken") ? JSON.parse(localStorage.getItem("AuthToken")) : null
    );
    // useEffect(() => { 
    //     const token = localStorage.getItem("AuthToken");
    //     if (token)
    //         setAuthToken(JSON.parse("token")); // if token exit we send it to parse and set it 
    //     else
    //         setAuthToken(null); // other way if the token are not existed we should to set null
    // }, []);

    //GETTING NOW THE DECODE OF THE TOKEN AND STORE ==> {FULLNAME, USERNAME, EMAIL}
    const [user, setUser] = useState(localStorage.getItem("AuthToken") ? jwtDecode(localStorage.getItem("AuthToken")) : null);
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
    let tokenUrl = "http://localhost:8001/api/token/" 
        const response = await fetch(tokenUrl ,{
            credentials: 'include',
            method: "POST",
            body: JSON.stringify({email, password}), // JSON.stringify: Coverting javascrit value to JSON string
            headers: {
                "Content-Type": "application/json"
            },
        });
            // console.log("heeeer = ",JsonData.access);
            // console.log("heeeereeee = ",JsonData.status);
            // console.log("heeeereeee = ",JsonData.status);
        if (response.status === 401)
        {
            console.error("401: Unauthorized access you should to register")
            Swal.fire({
                position: "top-end",
                title: "you don't have an account you should to register",
                icon: "error",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 6000
            })
            navigation("/register")
        }
        else if (response.status === 200)
        {
            const JsonData = await response.json()
            console.log("hhhhhhhh")
            setAuthToken(JsonData) //JsonData have access token an the refresh token
            setUser(jwtDecode(JsonData.access)) // decode access token
            localStorage.setItem("AuthToken", JSON.stringify(JsonData))

            navigation("/dashboard") // Routing the USERS after he loggedin "Success"
            Swal.fire({
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
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "The email address or Username you entered isn't connected to an account",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            })
        }
    }

    
    const registerUsers = async (fullname, username, email, password, confirm_password) => {

    let tokenUrlregister = "http://localhost:8001/api/register/"
    const response = await fetch(tokenUrlregister ,{
        method: 'POST',
        body: JSON.stringify({fullname, username, email, password, confirm_password}), // JSON.stringify: Coverting javascript value to JSON string
        headers: {
            'Content-Type': 'application/json',
        },
    })
    // console.log(response.status)
    

    // const JsonData =  await response.json()
    if (response.status === 201) // 201 status Created
    {
        // setAuthToken(JsonData) //JsonData have access token an the refresh token
        // setUser(jwtDecode(JsonData.access)) // decode access token
        // localStorage.getItem("AuthToken", JSON.stringify(JsonData));
        navigation("/login") // Routing the USERS after he loggedin "Success"
        Swal.fire({
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
        Swal.fire({
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
        setUser(null)
        localStorage.removeItem("AuthToken")
        navigation("/login")
        Swal.fire({
            position: "top-end",
            title: "you have been successfully Logged out",
            icon: "success",
            showConfirmButton: true,
            timerProgressBar: true,
            timer: 3000
        })
    }

    const contextData = {
        AuthToken, setAuthToken, user, setUser, loginUsers, registerUsers, logoutUsers 
    }

    useEffect(() => {
        if (AuthToken)
        {
            setUser(jwtDecode(AuthToken.access))
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