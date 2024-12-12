import axios from 'axios';

export const UserSearchService = {
   async searchUsers(
     searchTerm,
     page = 1,
     limit = 20
   ) {
     try {
      //  const token = localStorage.getItem('authtoken'); // Assuming you store the token in localStorage
      //  trim token from local storage 
      let token = localStorage.getItem('authtoken');
      const parsed = JSON.parse(token);

      const accessToken = parsed.access;
      
      console.log(accessToken);

    
         const response = await axios.get('http://localhost:8001/api/allusers/', {
         headers: {
           Authorization: `Bearer ${accessToken}`  // Add Bearer token to header
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