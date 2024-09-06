import axios from axios; 
import { jwtDecode } from "jwt-decode";
import dayjs from dayjs;
import { useContext } from "react";
import Auth_context from "../context_login_Register/Auth_context";

const BaseURL = "http://127.0.0.1:3000/api/"

const useAxios  = () => {

}// function useAxios