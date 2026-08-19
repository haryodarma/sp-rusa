import axiosInstance from './axiosInstance';

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (email) => {
    // Hack: since token doesn't have id and there is no /me endpoint, 
    // we fetch users and match by email to find the user_id
    const response = await axiosInstance.get('/api/users/?page=1&limit=100');
    const users = response.data.data.items || [];
    return users.find(u => u.email === email);
  }
};
