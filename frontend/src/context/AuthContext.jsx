import { useState, useEffect, createContext, useCallback } from "react";
import { jwtDecode } from "jwt-decode"
import { useNavigate, useLocation } from "react-router-dom"
import useAxios from "../hooks/useAxios";

import Swal from "sweetalert2";

import { toast, Bounce } from "react-toastify";
import '../i18n';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext()

export default AuthContext

export const AuthProvider = ({ children }) => {
    const { t } = useTranslation();
    const navigate = useNavigate()


    //GETTING TOKEN
    const [authtoken, setAuthToken] = useState(() => {
        // Check localStorage for existing token
        const token = localStorage.getItem("authtoken");
        if (token)
            return JSON.parse(token).access
        return null
    });

    //GETTING NOW THE DECODE OF THE TOKEN AND STORE ==> {FULLNAME, USERNAME, EMAIL}
    // const [user, setUser] = useState(localStorage.getItem("authtoken") ? jwtDecode("authtoken") : null);
    const [user, setUser] = useState(() => {
        // Check localStorage for existing token and decode if exists
        try {
            const token = localStorage.getItem("authtoken");
            const decoded = jwtDecode(JSON.parse(token).access)
            return decoded
        } catch (error) {
            localStorage.removeItem("authtoken");
            navigate("/login")
        }
    });
    // const [loading, setloading] = useState(true)

    const navigation = useNavigate()

    const loginUsers = async (email, password, verificationCode = null) => {
        try {
            let tokenUrl = "/api/usermanagement/api/token/";
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
                toast.error(t("you don't have an account you should to register"), {
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
                        title: t('2FA Verification Required'),
                        input: 'text',
                        inputLabel: t('Please enter your 2FA code'),
                        inputPlaceholder: t('Enter 6-digit code'),
                        showCancelButton: true,
                        inputValidator: (value) => {
                            if (!value) {
                                return t('You need to enter the code!');
                            }
                        }
                    });

                    if (code) {
                        // Retry login with 2FA code
                        return loginUsers(email, password, code);
                    }
                    return;
                }

                setAuthToken(data.access);
                setUser(jwtDecode(data.access));
                localStorage.setItem("authtoken", JSON.stringify(data));

                navigation("/dashboard");
                toast.success(t("you have successfully logged in"), {
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
                toast.error(t("Failed to logged in"), {
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
            toast.error(t("error during login"), {
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

        let tokenUrlregister = "/api/usermanagement/api/register/";
        const response = await fetch(tokenUrlregister ,{
            method: 'POST',
            body: JSON.stringify({ fullname, username, email, password, confirm_password }),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (response.status === 201) {
            toast.success(t('you have successfully Registred'), {
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
        else {
            const data = await response.json();
            toast.error(t('There is some error in Your registration'), {
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

    const url_host = import.meta.env.VITE_HOST_URL

    const GoogleLogin = () => {
        const ClientId = import.meta.env.VITE_GCLIENT_ID;
        const CallBackURI = `${url_host}/api/usermanagement/api/v2/auth/googlelogin/callback/`;
        window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${CallBackURI}&prompt=consent&response_type=code&client_id=${ClientId}&scope=openid%20email%20profile&access_type=offline`)
        // GoogleloginUsers( code )
    }

    const Intra42Login = () => {
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const callbackURI = `${url_host}/api/usermanagement/api/42login/callback/`;
        window.location.replace(`https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackURI}&response_type=code`);
    }

    const location = useLocation();
    const handleGoogleLoginCallback = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('access_token');
        const tmp_password = searchParams.get('tmp_password');
        const is_password_need = searchParams.get('is_password_need');
        const error = searchParams.get('error');

        if (error) {
            toast.error(t('Failed to log in with Google') `: ${error}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            })
            navigation('/login');
            return;
        }


        if (token) {
            try {
                // First handle password setup if needed
                if (is_password_need && tmp_password) {
                    handlePasswordSetup(token, tmp_password);
                    return;
                }

                // Then check if 2FA is required
                fetch('/api/usermanagement/api/2fa/check/', {
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
                        toast.success(t("Successfully logged in"), {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        })
                    });
            } catch (error) {
                toast.error(t('Failed to process login:') `${error}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                })
                navigation('/login');
            }
        }
    }, [location.search, navigation, setAuthToken, setUser]);


    const handle42LoginCallback = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('access_token');
        const tmp_password = searchParams.get('tmp_password');
        const is_password_need = searchParams.get('is_password_need');
        const error = searchParams.get('error');

        if (error) {
            toast.error(t('Failed to log in with 42:') `: ${error}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            })
            navigation('/login');
            return;
        }

        if (token) {
            try {
                // First handle password setup if needed
                if (is_password_need && tmp_password) {
                    handlePasswordSetup(token, tmp_password);
                    return;
                }

                // Then check if 2FA is required
                fetch('/api/usermanagement/api/2fa/check/', {
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
                        toast.success(t("Successfully logged in"), {
                            position: "top-right",
                            autoClose: 1000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        })
                    });
            } catch (error) {
                toast.error(t('Token processing error:') `: ${error}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                })
                navigation('/login');
            }
        }
        else {
            toast.error(t("Failed to process login"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            })
            navigation('/login');
        }
    }, [location.search, navigation, setAuthToken, setUser]);


    const logoutUsers = async () => {
        try {

            const authData = localStorage.getItem('authtoken');
            if (!authData) {
                throw new Error('No auth token found');
            }

            const token = JSON.parse(authData).access;
            const logouturl = "/api/usermanagement/api/logout/";
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


        } catch (error) {
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

            toast.success(t("Successfully logged out"), {
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

                if (!password || !confirmPassword) {
                    Swal.showValidationMessage(t('Please fill in both password fields'));
                    return false;
                }

                if (password !== confirmPassword) {
                    Swal.showValidationMessage(t('Passwords do not match'));
                    return false;
                }

                if (password.length < 8) {
                    Swal.showValidationMessage(t('Password must be at least 8 characters long'));
                    return false;
                }

                return { password, confirmPassword };
            }
        });

        if (passwordData) {
            try {
                const response = await fetch('/api/usermanagement/api/api-set-password/', {
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
                    toast.success(t("Password set successfully"), {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    })
                    // Continue with normal login flow
                    fetch('/api/usermanagement/api/2fa/check/', {
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
                    throw new Error(t('Failed to set password'));
                }
            } catch (error) {
                toast.error(t('Failed to set password') `: ${error}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                })
                navigation('/login');
            }
        }
        else {
            handlePasswordSetup();
        }
    };

    // Helper function for 2FA verification (existing code refactored into a function)
    const handle2FAVerification = async (token) => {
        const { value: code } = await Swal.fire({
            title: t('2FA Verification Required'),
            input: 'text',
            inputLabel: t('Please enter your 2FA code'),
            inputPlaceholder: t('Enter 6-digit code'),
            // className: bg-red-600,
            confirmButtonText: t("Confirm"),
            inputValidator: (value) => {
                if (!value) {
                    return t('You need to enter the code!');
                }
            }
        });

        if (code) {
            const OTP42 = await fetch('/api/usermanagement/api/2fa/verify/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp: code })
            });

            if (OTP42.ok) {
                completeLogin(token);
                toast.success(t("You successfully logged in using 2FA"), {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                })
            } else {
                toast.error(t("Failed on 2FA verification"), {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                })
                navigation('/login');
            }
        }
        else{
            handle2FAVerification()
        }
    };

    // Helper function to complete the login process
    const completeLogin = (token) => {
        const decodedToken = jwtDecode(token);
        setAuthToken( token );
        setUser(decodedToken);
        localStorage.setItem("authtoken", JSON.stringify({ access: token }));
        navigation("/dashboard");
    };


    useEffect(() => {
        if (location.pathname === '/google-callback') {
            handleGoogleLoginCallback(); // I have here the same fuction Login with google and 42 intra we should to change it and make it in one
        }
        else if (location.pathname === '/42intra-callback') {
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