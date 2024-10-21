import { useContext } from "react"
import AuthContext from "../context_login_Register/AuthContext"
import { Navigate } from "react-router-dom"


const ProtectRouter = ({Children}) => {
    let {user} = useContext(AuthContext) //This Conponents check if the user "يحقق" all rules to authenticate

    if (!user){
        console.log("You Should To be Authenticate First")
        return <Navigate to="/login" replace/>
    }
    return Children

}

export default ProtectRouter