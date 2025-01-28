import { useEffect, createContext } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useState } from 'react';

const OnlineContext = createContext({})

export const OnlineContextProvider = ({ children }) =>{

    const [count, setCount] = useState(0)

    const { authtoken } = useAuthContext()

    const updateOnlineStatus = async (isOnline) => {
        try {
            const endpoint = isOnline ? 'user-online' : 'user-offline';
            
            await fetch(`/api/usermanagement/api/${endpoint}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authtoken}`
                },
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error updating status 123123:', error.message);
        }
    };

    useEffect(() => {
        // // Handle tab visibility change
        const handleVisibilityChange = () => {
            updateOnlineStatus(!document.hidden);
        };

        // // Handle before unload
        const handleBeforeUnload = () => {
            updateOnlineStatus(false);
        };

        // Handle when user comes back online
        const handleOnline = () => {
            updateOnlineStatus(true);
        };

        // Handle when user goes offline
        const handleOffline = () => {
            updateOnlineStatus(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Set initial online status
        updateOnlineStatus(true);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            updateOnlineStatus(false);
        };
    }, []);

    return (
        <OnlineContext.Provider value={{}}>
            {children}
        </OnlineContext.Provider>
    )

};


export default OnlineContext