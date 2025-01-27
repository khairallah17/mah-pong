<<<<<<< HEAD
import { useEffect } from 'react';

const useOnlineStatus = () => {
    const updateOnlineStatus = async (isOnline) => {
        try {
            const authData = localStorage.getItem('authtoken');
            if (!authData) return;

            const token = JSON.parse(authData).access;
            const endpoint = isOnline ? 'user-online' : 'user-offline';
            
            await fetch(`http://localhost:8001/api/${endpoint}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    useEffect(() => {
        // Handle tab visibility change
        const handleVisibilityChange = () => {
            updateOnlineStatus(!document.hidden);
        };

        // Handle before unload
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
};


export default useOnlineStatus;
=======
>>>>>>> master
