import axiosInstance from './axiosInstance';

export const adminService = {
  // --- Gejala ---
  getSymptoms: async () => {
    const res = await axiosInstance.get('/api/symptoms/?page=1&limit=100');
    return res.data.data.items || [];
  },
  createSymptom: async (data) => {
    const res = await axiosInstance.post('/api/symptoms/', data);
    return res.data.data;
  },
  updateSymptom: async (id, data) => {
    const res = await axiosInstance.put(`/api/symptoms/${id}`, data);
    return res.data.data;
  },
  deleteSymptom: async (id) => {
    const res = await axiosInstance.delete(`/api/symptoms/${id}`);
    return res.data;
  },

  // --- Penyakit ---
  getDiseases: async () => {
    const res = await axiosInstance.get('/api/diseases/?page=1&limit=100');
    return res.data.data.items || [];
  },
  createDisease: async (data) => {
    const res = await axiosInstance.post('/api/diseases/', data);
    return res.data.data;
  },
  updateDisease: async (id, data) => {
    const res = await axiosInstance.put(`/api/diseases/${id}`, data);
    return res.data.data;
  },
  deleteDisease: async (id) => {
    const res = await axiosInstance.delete(`/api/diseases/${id}`);
    return res.data;
  },

  // --- Expert Symptoms (Rule CF) ---
  getRules: async () => {
    const res = await axiosInstance.get('/api/expert-symptoms/?page=1&limit=100');
    return res.data.data.items || [];
  },
  createRule: async (data) => {
    const res = await axiosInstance.post('/api/expert-symptoms/', data);
    return res.data.data;
  },
  updateRule: async (id, data) => {
    const res = await axiosInstance.put(`/api/expert-symptoms/${id}`, data);
    return res.data.data;
  },
  deleteRule: async (id) => {
    const res = await axiosInstance.delete(`/api/expert-symptoms/${id}`);
    return res.data;
  },

  // --- Kelola User ---
  getUsers: async (page = 1, limit = 10) => {
    const res = await axiosInstance.get(`/api/users/?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  createUser: async (data) => {
    const res = await axiosInstance.post('/api/users/', data);
    return res.data.data;
  },
  updateUser: async (id, data) => {
    const res = await axiosInstance.put(`/api/users/${id}`, data);
    return res.data.data;
  },
  deleteUser: async (id) => {
    const res = await axiosInstance.delete(`/api/users/${id}`);
    return res.data;
  },

  // --- Data Rusa ---
  getDeers: async (page = 1, limit = 50) => {
    const res = await axiosInstance.get(`/api/deers/?page=${page}&limit=${limit}`);
    return res.data.data.items || [];
  },
  createDeer: async (data) => {
    const res = await axiosInstance.post('/api/deers/', data);
    return res.data.data;
  },
  updateDeer: async (id, data) => {
    const res = await axiosInstance.put(`/api/deers/${id}`, data);
    return res.data.data;
  },
  deleteDeer: async (id) => {
    const res = await axiosInstance.delete(`/api/deers/${id}`);
    return res.data;
  },

  // --- Gejala yang Dialami User (Monitoring) ---
  getUserSymptoms: async (page = 1, limit = 10) => {
    const res = await axiosInstance.get(`/api/user-symptoms/?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  getUserSymptomById: async (id) => {
    const res = await axiosInstance.get(`/api/user-symptoms/${id}`);
    return res.data.data;
  },

  // --- Prediksi & Diagnosis (Monitoring) ---
  getPredictions: async (page = 1, limit = 10) => {
    const res = await axiosInstance.get(`/api/predictions/?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  getPredictionById: async (id) => {
    const res = await axiosInstance.get(`/api/predictions/${id}`);
    return res.data.data;
  },
};
