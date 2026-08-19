import axiosInstance from './axiosInstance';

export const predictionService = {
  // Fetch referensi data
  getSymptoms: async () => {
    // ambil semua data (limit disesuaikan dengan backend)
    const response = await axiosInstance.get('/api/symptoms/?page=1&limit=100');
    return response.data.data.items || [];
  },
  
  getDeers: async () => {
    const response = await axiosInstance.get('/api/deers/?page=1&limit=100');
    return response.data.data.items || [];
  },

  getExpertSymptoms: async () => {
    const response = await axiosInstance.get('/api/expert-symptoms/?page=1&limit=100');
    return response.data.data.items || [];
  },

  getDiseases: async () => {
    const response = await axiosInstance.get('/api/diseases/?page=1&limit=100');
    return response.data.data.items || [];
  },

  // Prediksi & Riwayat
  createPrediction: async (predictionData) => {
    const response = await axiosInstance.post('/api/predictions/', predictionData);
    return response.data.data;
  },

  createUserSymptom: async (userSymptomData) => {
    const response = await axiosInstance.post('/api/user-symptoms/', userSymptomData);
    return response.data.data;
  },

  getPredictionsByUser: async (userId, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/api/predictions/?page=${page}&limit=${limit}&user_id=${userId}`);
    return response.data.data;
  }
};
