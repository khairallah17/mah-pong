import axios from axios; 
import { jwtDecode } from "jwt-decode";
import dayjs from dayjs;
import { useContext } from "react";
import AuthContext from "../context_login_Register/AuthContext";

const baseURL = "http://127.0.0.1:8000/api/"

const useAxios  = () => {
    const {AuthToken, setUserInfo, setAuthToken} = useContext(AuthToken)

    const axiosInstance = axios.create({
        baseURL,
        headers: {
            Autorisation: `Barer ${AuthToken?.access}` // To avoid injection ${AuthToken?.access} to return every check to refresh token from the backend
        }
    })
    
    // in case the token was expired we need to get the new one and use it
    
    axiosInstance.interceptor.request.use(
        async runAsRequest => {
            const checkTokenUser = jwtDecode(AuthToken.access) //checking if the token are active
            
            const isTokenExpired = dayjs.unix(checkTokenUser.exp).deff(dayjs()) < 1 // checking if the Token have less than 1 day the life of the Token are already set in the backend

            if (!isTokenExpired) //if the token are not expired
                return runAsRequest;
            
            const newToken = await axios.post(`${baseURL}/token/refresh`, {
                refresh: AuthToken.refresh
            });
            localStorage.setItem("AuthToken", JSON.stringify(newToken.contextData));
            setAuthToken(newToken.contextData); // Change the old Token with New Refreshed Token
            setUserInfo(jwtDecode(newToken.contextData.access))

            newToken.headers.Autorisation = `Bearer ${jwtDecode(newToken.contextData.access)}`

            return newToken;
        }
    )

    return axiosInstance
}// function useAxios

export default Axiosusing;