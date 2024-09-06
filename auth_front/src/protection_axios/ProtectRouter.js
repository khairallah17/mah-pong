import { useContext } from "react"
import Auth_context from "../context_login_Register/Auth_context"
import { Navigate  } from "react-router-dom"


const ProtectRouter = ({Children}) => {
    let {user} = useContext(Auth_context) //This Conponents check if the user "يحقق" all roules to authenticate

    if (!user){
        console.log("You Should To be Authenticate First")
        return <Navigate to="/login" replace/>
    }
    return Children

}

export default ProtectRouter