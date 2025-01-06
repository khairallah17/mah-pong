import React from 'react'

export const Friends = () => {
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      });
    
      useEffect(() => {
        fetchFriendsList();
      }, []);
    
      const fetchFriendsList = async () => {
        try {
          const response = await fetch('http://localhost:8001/api/api/friends/', {
            headers: getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch friends');
          const data = await response.json();
          setFriends(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
        console.log(data);
      };
    
  return (
    <div>
        <button className="bg-black" onClick={Friendrequest}>click here</button>
    </div>
  )
}

export default Friends;