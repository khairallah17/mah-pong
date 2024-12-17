import { useState, useEffect } from 'react';
import '../styles/UserProfile.css';

const UserProfile = ({ userId }) => {
    const [userImages, setUserImages] = useState({
        img: null,
        avatar: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserImages = async () => {
            try {
                // Get the access token from cookies or localStorage
                const accessToken = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('access_token='))
                    ?.split('=')[1];

                const response = await fetch('http://localhost:8001/api/allusers/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user images');
                }

                const data = await response.json();
                // Find the specific user in the data array
                const user = data.find(user => user.id === userId);
                
                if (user) {
                    setUserImages({
                        img: user.img ? `http://localhost:8001/media/${user.img}` : null,
                        avatar: user.avatar ? `http://localhost:8001/media/${user.avatar}` : null
                    });
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserImages();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="user-profile">
            {userImages.img && (
                <div className="profile-image">
                    <h3>Profile Image</h3>
                    <img 
                        src={userImages.img} 
                        alt="Profile" 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-profile.png'; // Add a default image path
                        }}
                    />
                </div>
            )}
            
            {userImages.avatar && (
                <div className="avatar-image">
                    <h3>Avatar</h3>
                    <img 
                        src={userImages.avatar} 
                        alt="Avatar"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png'; // Add a default image path
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default UserProfile; 