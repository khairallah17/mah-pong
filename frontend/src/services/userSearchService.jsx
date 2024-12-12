import axios from 'axios';

export const UserSearchService = {
   async searchUsers(
     searchTerm,
     page = 1,
     limit = 20
   ) {
     try {
       const token = localStorage.getItem('authtoken'); // Assuming you store the token in localStorage
       console.log('Token:', token);
       const response = await axios.get('http://localhost:8001/api/search-users/', {
         headers: {
           'Authorization': `Token ${token}`
         },
         params: {
            term: searchTerm,
            page,
            limit
         }
       });
       return response.data;
     } catch (error) {
       console.error('Error searching users:', error);
       throw error;
     }
   }
};