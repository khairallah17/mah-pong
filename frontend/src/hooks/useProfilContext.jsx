import { useContext } from "react";
import ProfileContext from "../context/profilContext";

export const UseProfilContext = () => {

    const context = useContext(ProfileContext)
    
    if (!context) {
        throw new Error("error while create profile context")
    }

    return context

}