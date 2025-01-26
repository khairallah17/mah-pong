import { useContext } from "react"
import UserContext from "../context/userContext";

const useUserContext = () => {
    
    const context = useContext(UserContext)

    if (!context)
        throw new Error("useUserContext must be used within a UserContextProvider")

    return context

}

export default useUserContext;