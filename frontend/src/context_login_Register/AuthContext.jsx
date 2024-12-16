import { useState, useEffect, createContext, useCallback } from "react";
import { jwtDecode } from "jwt-decode"
import { useNavigate, useLocation } from "react-router-dom"
import Swal from 'sweetalert2'


// const Swal = require('sweetSwal2')

const AuthContext = createContext()

export default AuthContext

export const AuthProvider = ({ children }) => {

    //GETTING TOKEN
    const [authtoken, setAuthToken] = useState(() => {
        // Check localStorage for existing token
        const token = localStorage.getItem("authtoken");
        return token ? JSON.parse(token) : null;
    });

    //GETTING NOW THE DECODE OF THE TOKEN AND STORE ==> {FULLNAME, USERNAME, EMAIL}
    // const [user, setUser] = useState(localStorage.getItem("authtoken") ? jwtDecode("authtoken") : null);
    const [user, setUser] = useState(() => {
        // Check localStorage for existing token and decode if exists
        const token = localStorage.getItem("authtoken");
        return token ? jwtDecode(JSON.parse(token).access) : null;
    });
    

    // const [loading, setloading] = useState(true)

    const navigation = useNavigate()

    const loginUsers = async (email, password, verificationCode = null) => {
        try {
            let tokenUrl = "http://localhost:8001/api/token/"
            const response = await fetch(tokenUrl, {
                credentials: 'include',
                method: "POST",
                body: JSON.stringify({ 
                    email, 
                    password,
                    verification_code: verificationCode 
                }),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const data = await response.json();

            if (response.status === 401) {
                Swal.fire({
                    position: "top-end",
                    title: "you don't have an account you should to register",
                    icon: "error",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 6000
                });
                navigation("/register");
                return;
            }

            if (response.status === 200) {
                // Check if 2FA is required
                if (data.requires_2fa) {
                    // Show 2FA verification dialog
                    const { value: code } = await Swal.fire({
                        title: '2FA Verification Required',
                        input: 'text',
                        inputLabel: 'Please enter your 2FA code',
                        inputPlaceholder: 'Enter 6-digit code',
                        showCancelButton: true,
                        inputValidator: (value) => {
                            if (!value) {
                                return 'You need to enter the code!';
                            }
                        }
                    });

                    if (code) {
                        // Retry login with 2FA code
                        return loginUsers(email, password, code);
                    }
                    return;
                }

                setAuthToken(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem("authtoken", JSON.stringify(data));

                navigation("/dashboard");
                Swal.fire({
                    position: "top-end",
                    title: "you have successfully logged in",
                    icon: "success",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Invalid credentials or 2FA code",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "An error occurred during login",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            });
        }
    };

    
    const registerUsers = async (fullname, username, email, password, confirm_password) => {

    let tokenUrlregister = "http://localhost:8001/api/register/"
    const response = await fetch(tokenUrlregister ,{
        method: 'POST',
        body: JSON.stringify({fullname, username, email, password, confirm_password}), // JSON.stringify: Coverting javascrit value to JSON string
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
    // const [error, setError] = useState('');
    //Logout Routing
    // To Logout the user we should just delete the tokens
    const logoutUsers = async () => {
        // setAuthToken(null)
        // setUser(null)
        // localStorage.removeItem("authtoken")
        try {
            // Get tokens from localStorage
            const authData = localStorage.getItem('authtoken');
            if (!authData) {
                throw new Error('No auth token found');
            }
    
            const tokens = JSON.parse(authData);
            const logouturl = "http://localhost:8001/api/logout/";
            console.log("here are the problem");
            const response = await fetch(logouturl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header with access token
                    'Authorization': `Bearer ${tokens.access}`
                },
                body: JSON.stringify({
                    refresh: tokens.refresh  // Send refresh token in body
                })
            });
    
            // Clear tokens regardless of response
            setAuthToken(null);
            setUser(null);
            localStorage.removeItem("authtoken");
    
            navigation("/login");
            if (response.ok) {
                Swal.fire({
                    position: "top-end",
                    title: "Successfully logged out",
                    icon: "success",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
            }
    
    
        } catch (error) {
            console.error('Logout error:', error);
            
            // Clear tokens even if request fails
            setAuthToken(null);
            setUser(null);
            localStorage.removeItem("authtoken");
            
            Swal.fire({
                position: "top-end",
                title: "Logged out (with errors)",
                icon: "warning",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            });
            
            navigation("/login");
        }
    };



    const GoogleLogin = () =>{
        const ClientId = import.meta.env.VITE_GCLIENT_ID;
        const CallBackURI = "http://localhost:8001/api/v2/auth/googlelogin/callback/";
        window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${CallBackURI}&prompt=consent&response_type=code&client_id=${ClientId}&scope=openid%20email%20profile&access_type=offline`)
        // GoogleloginUsers( code )
    }

    const Intra42Login = () => {
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const callbackURI = "http://localhost:8001/api/42login/callback/";
        window.location.replace(`https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackURI}&response_type=code`);
    }


    const navigate = useNavigate();
    const location = useLocation();
    const handleGoogleLoginCallback = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('access_token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Google login error:', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Failed to log in with Google",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            });
            navigate('/login');
            return;
        }
        console.log("backend token is ====> ", token);
        if (token) {
            try {
                // First check if 2FA is required
                fetch('http://localhost:8001/api/2fa/check/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(async data => {
                    if (data.requires_2fa) {
                        // Show 2FA verification dialog
                        const { value: code } = await Swal.fire({
                            title: '2FA Verification Required',
                            input: 'text',
                            inputLabel: 'Please enter your 2FA code',
                            inputPlaceholder: 'Enter 6-digit code',
                            showCancelButton: true,
                            inputValidator: (value) => {
                                if (!value) {
                                    return 'You need to enter the code!';
                                }
                            }
                        });

                        if (code) {
                            // Verify 2FA code for login
                            const OTPGoogle = await fetch('http://localhost:8001/api/2fa/verify/', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ otp: code })
                            });

                            if (OTPGoogle.ok){
                                const decodedToken = jwtDecode(token);
                                setAuthToken({ access: token });
                                setUser(decodedToken);
                                localStorage.setItem("authtoken", JSON.stringify({ access: token }));

                                Swal.fire({
                                    position: "top-end",
                                    title: "You successfully logged in using 2FA",
                                    icon: "success",
                                    showConfirmButton: true,
                                    timerProgressBar: true,
                                    timer: 3000
                                });
                                navigate("/dashboard"); 
                                return ;
                            }
                            else
                            {
                                Swal.fire({
                                    position: "top-end",
                                    icon: "error",
                                    title: "Failed on 2FA verification",
                                    showConfirmButton: true,
                                    timerProgressBar: true,
                                    timer: 3000
                                });
                                navigate('/login');
                                return ;
                            }
                        }
                    }

                    // If no 2FA required or verification successful
                    const decodedToken = jwtDecode(token);
                    setAuthToken({ access: token });
                    setUser(decodedToken);
                    localStorage.setItem("authtoken", JSON.stringify({ access: token }));

                    navigate("/dashboard");
                    Swal.fire({
                        position: "top-end",
                        title: "Successfully logged in",
                        icon: "success",
                        showConfirmButton: true,
                        timerProgressBar: true,
                        timer: 3000
                    });
                });
            } catch (error) {
                console.error('Token processing error:', error);
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Failed to process login",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
                navigate('/login');
            }
        }
    }, [location.search, navigate, setAuthToken, setUser]);

    const handle42LoginCallback = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('access_token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Google login error:', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Failed to log in with Google",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            });
            navigate('/login');
            return;
        }

        if (token) {
            try {
                // First check if 2FA is required
                fetch('http://localhost:8001/api/2fa/check/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(async data => {
                    if (data.requires_2fa) {
                        // Show 2FA verification dialog
                        const { value: code } = await Swal.fire({
                            title: '2FA Verification Required',
                            input: 'text',
                            inputLabel: 'Please enter your 2FA code',
                            inputPlaceholder: 'Enter 6-digit code',
                            showCancelButton: true,
                            inputValidator: (value) => {
                                if (!value) {
                                    return 'You need to enter the code!';
                                }
                            }
                        });

                            if (code) {
                                // Verify 2FA code for login
                                const OTP42 = await fetch('http://localhost:8001/api/2fa/verify/', {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ otp: code })
                                });

                                if (OTP42.ok){
                                    const decodedToken = jwtDecode(token);
                                    setAuthToken({ access: token });
                                    setUser(decodedToken);
                                    localStorage.setItem("authtoken", JSON.stringify({ access: token }));
                                    Swal.fire({
                                        position: "top-end",
                                        title: "You successfully logged in using 2FA",
                                        icon: "success",
                                        showConfirmButton: true,
                                        timerProgressBar: true,
                                        timer: 3000
                                    });
                                    navigate("/dashboard");
                                    return ;
                                }
                                else
                                {
                                    Swal.fire({
                                        position: "top-end",
                                        icon: "error",
                                        title: "Failed on 2FA verification",
                                        showConfirmButton: true,
                                        timerProgressBar: true,
                                        timer: 3000
                                    });
                                    navigate('/login');
                                    return ;
                                }
                            }
                        }

                    // If no 2FA required or verification successful
                    const decodedToken = jwtDecode(token);
                    setAuthToken({ access: token });
                    setUser(decodedToken);
                    localStorage.setItem("authtoken", JSON.stringify({ access: token }));

                    navigate("/dashboard");
                    Swal.fire({
                        position: "top-end",
                        title: "Successfully logged in",
                        icon: "success",
                        showConfirmButton: true,
                        timerProgressBar: true,
                        timer: 3000
                    });
                });
            } catch (error) {
                console.error('Token processing error:', error);
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Failed to process login",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
                navigate('/login');
            }
        }
    }, [location.search, navigate, setAuthToken, setUser]);


    useEffect(() => {
        if (location.pathname === '/google-callback') {
            handleGoogleLoginCallback(); // I have here the same fuction Login with google and 42 intra we should to change it and make it in one
        }
        else if (location.pathname === '/42intra-callback'){
            handle42LoginCallback();
        }
    }, [location.pathname, handleGoogleLoginCallback, handle42LoginCallback]);

    const contextData = {
        authtoken, setAuthToken, user, setUser, loginUsers, registerUsers, logoutUsers, GoogleLogin, Intra42Login
    }

    useEffect(() => {
        if (authtoken) {
            localStorage.setItem("authtoken", JSON.stringify(authtoken));
        } else {
            localStorage.removeItem("authtoken");
        }
    }, [authtoken]);

    // Returning My context Provider
    return ( 
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}