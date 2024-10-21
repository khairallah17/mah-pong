import { useContext } from "react"
import AuthContext from "../context_login_Register/AuthContext"
import { Navigate } from "react-router-dom"


const ProtectRouter = ({children}) => {
    let {user} = useContext(AuthContext) //This Conponent checks if the user validates all rules to authenticate

    if (!user){
        console.log("You Should To be Authenticate First")
        return <Navigate to="/login" replace />
    }
    return children

}

export default ProtectRouter