
import axios from 'axios';

export const UserSearchService = {
  async searchUsers(searchTerm = '', page = 1, limit = 20) {
    try {
      let token = localStorage.getItem('authtoken');
      const parsed = JSON.parse(token);
      const accessToken = parsed.access;
      
      const response = await axios.get('/api/usermanagement/api/allusers/', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          search: searchTerm, // Changed from 'term' to 'search' to match backend
          page,
          limit
        }
      });


      if (Array.isArray(response.data)) {
        // If searchTerm is provided, filter results
        if (searchTerm) {
          return response.data.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

};