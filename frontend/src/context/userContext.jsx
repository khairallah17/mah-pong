import { createContext, useState } from "react"
import { useAuthContext } from "../hooks/useAuthContext"

const UserContext = createContext({})

export const UserContextProvider = ({ children }) => {

    const [loading, setLoading] = useState(true)

    const { authtoken, user, setUser } = useAuthContext()

    const fetchUserData = async () => {
  
        try {

            setLoading(true)

            const response = await fetch('/api/usermanagement/api/edit-profile/', {
                headers: {
                    'Authorization': `Bearer ${authtoken}`
                }
            });

            const userData = await response.json();
            setUser(userData);

            console.log("user ==> ", user)

        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
            setLoading(false)
        }
  
    };

    const values = {
        fetchUserData,
        loading
    }

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    )

}

export default UserContext