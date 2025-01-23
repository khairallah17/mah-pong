import { useState, useEffect, createContext, useCallback } from "react";
import { jwtDecode } from "jwt-decode"
import { useNavigate, useLocation } from "react-router-dom"
import useAxios from "../hooks/useAxios";

import Swal from "sweetalert2";

import { toast, Bounce } from "react-toastify";

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

            if (!response.ok) {
                console.log("Error: ", data);
                toast.error("you don't have an account you should to register", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
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
                toast.success("you have successfully logged in", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
                
            } else {
                toast.error("Failed to logged in", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
            }
        } catch (error) {
            toast.error("error during login", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }
    };

    
    const registerUsers = async (fullname, username, email, password, confirm_password) => {

        let tokenUrlregister = "http://localhost:8001/api/register/"
        const response = await fetch(tokenUrlregister ,{
            method: 'POST',
            body: JSON.stringify({fullname, username, email, password, confirm_password}),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (response.status === 201)
        {
            toast.success('you have successfully Registred', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            // navigation("/login");
            
        } 
        else 
        {
            const data = await response.json();
            console.log("Error:  ", data);
            toast.error('There is some error in Your registration', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }

    }



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
        const tmp_password = searchParams.get('tmp_password');
        const is_password_need = searchParams.get('is_password_need');
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
                console.log("hehre ",is_password_need)
                // First handle password setup if needed
                if (is_password_need && tmp_password) {
                    handlePasswordSetup(token, tmp_password);
                    return;
                }
    
                // Then check if 2FA is required
                fetch('http://localhost:8001/api/2fa/check/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(async data => {
                    if (data.requires_2fa) {
                        await handle2FAVerification(token);
                        return;
                    }
    
                    // If no 2FA required, proceed with login
                    completeLogin(token);
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
        const tmp_password = searchParams.get('tmp_password');
        const is_password_need = searchParams.get('is_password_need');
        const error = searchParams.get('error');
    
        if (error) {
            console.error('42 login error:', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Failed to log in with 42",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            });
            navigate('/login');
            return;
        }
    
        if (token) {
            try {
                console.log("hehre ", is_password_need)
                // First handle password setup if needed
                if (is_password_need && tmp_password) {
                    handlePasswordSetup(token, tmp_password);
                    return;
                }
    
                // Then check if 2FA is required
                fetch('http://localhost:8001/api/2fa/check/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(async data => {
                    if (data.requires_2fa) {
                        await handle2FAVerification(token);
                        return;
                    }
    
                    // If no 2FA required, proceed with login
                    completeLogin(token);
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
        else{
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
    }, [location.search, navigate, setAuthToken, setUser]);


    const logoutUsers = async () => {
        try {

            const authData = localStorage.getItem('authtoken');
            if (!authData) {
                console.log('No auth token found');
                throw new Error('No auth token found');
            }
    
            const token = JSON.parse(authData).access;
            const logouturl = "http://localhost:8001/api/logout/";
            console.log("Attempting logout...");
    
            const response = await fetch(logouturl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // No need to send refresh token in body as it's in cookies
                credentials: 'include' // Important: This ensures cookies are sent
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Logout failed');
            }
    
            console.log("Logout successful");
    
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        } finally {
            // Clean up
            setAuthToken(null);
            setUser(null);
            localStorage.removeItem("authtoken");
            navigation("/login");
            
            toast.success("Successfully logged out", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }
    };
    
    // Helper function to handle password setup
    const handlePasswordSetup = async (token, tmp_password) => {
        const { value: passwordData } = await Swal.fire({
            title: 'Set Your Password',
            html: `
                <input type="password" id="password" class="swal2-input" placeholder="New Password">
                <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm Password">
            `,
            focusConfirm: false,
            showCancelButton: false,
            preConfirm: () => {
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                console.log("isss===> ", password, confirmPassword)
                if (!password || !confirmPassword) {
                    Swal.showValidationMessage('Please fill in both password fields');
                    return false;
                }
                
                if (password !== confirmPassword) {
                    Swal.showValidationMessage('Passwords do not match');
                    return false;
                }
                
                if (password.length < 8) {
                    Swal.showValidationMessage('Password must be at least 8 characters long');
                    return false;
                }
                
                return { password, confirmPassword };
            }
        });
    
        if (passwordData) {
            try {
                console.log("isss===> before response ", passwordData.password, tmp_password)
                console.log("Token===> before response ", token)
                const response = await fetch('http://localhost:8001/api/api-set-password/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        new_password: passwordData.password,
                        tmp_password: tmp_password
                    })
                });
    
                if (response.ok) {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Password set successfully",
                        showConfirmButton: true,
                        timerProgressBar: true,
                        timer: 3000
                    });
                    // Continue with normal login flow
                    fetch('http://localhost:8001/api/2fa/check/', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(async data => {
                        if (data.requires_2fa) {
                            await handle2FAVerification(token);
                            return;
                        }
                        completeLogin(token);
                    });
                } else {
                    console.log(response.json());
                    throw new Error('Failed to set password');
                }
            } catch (error) {
                console.error('Password setup error:', error);
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Failed to set password",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
                navigate('/login');
            }
        }
        else{
            handlePasswordSetup();
        }
    };
    
    // Helper function for 2FA verification (existing code refactored into a function)
    const handle2FAVerification = async (token) => {
        const { value: code } = await Swal.fire({
            title: '2FA Verification Required',
            input: 'text',
            inputLabel: 'Please enter your 2FA code',
            inputPlaceholder: 'Enter 6-digit code',
            showCancelButton: true,
            // className: bg-red-600,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to enter the code!';
                }
            }
        });
    
        if (code) {
            const OTP42 = await fetch('http://localhost:8001/api/2fa/verify/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp: code })
            });
    
            if (OTP42.ok) {
                completeLogin(token);
                Swal.fire({
                    position: "top-end",
                    title: "You successfully logged in using 2FA",
                    icon: "success",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Failed on 2FA verification",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    timer: 3000
                });
                navigate('/login');
            }
        }
    };
    
    // Helper function to complete the login process
    const completeLogin = (token) => {
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
    };


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

    // Returning My context Provider
    return ( 
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}