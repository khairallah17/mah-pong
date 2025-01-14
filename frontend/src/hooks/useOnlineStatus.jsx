import { useEffect } from 'react';

export const useOnlineStatus = () => {
    useEffect(() => {
        const handleOffline = async () => {
            try {
                const authData = localStorage.getItem('authtoken');
                if (!authData) return;

                const token = JSON.parse(authData).access;
                
                // Send offline status update
                await fetch('http://localhost:8001/api/user-offline/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include',
                    keepalive: true
                });
            } catch (error) {
                console.error('Error updating offline status:', error);
            }
        };

        // Handle tab/browser close
        const handleBeforeUnload = (e) => {
            handleOffline();
        };

        // Handle user switching tabs
        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleOffline();
            }
        };

        // Handle user losing connection
        const handleOfflineEvent = () => {
            handleOffline();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('offline', handleOfflineEvent);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('offline', handleOfflineEvent);
        };
    }, []);
};