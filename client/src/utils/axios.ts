import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен авторизации к каждому запросу
instance.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { id } = JSON.parse(user);
      config.headers['user-id'] = id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обрабатываем ответы
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Если токен истек или недействителен, перенаправляем на страницу входа
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 