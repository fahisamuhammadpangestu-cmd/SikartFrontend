import axios from 'axios';

const axiosInstance = axios.create({
  // Ini adalah alamat API Laravel kita
  baseURL: 'https://besikart-sibm4.karyakreasi.id/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Fungsi ini bertugas menyelipkan "Kunci Tiket" (Token) secara otomatis jika ada
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;