import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Пропускаем проверку токена для эндпоинтов авторизации
    if (config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/register')) {
      return config;
    }

    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      console.error('No user or token found in localStorage');
      return Promise.reject(new Error('No user or token found in localStorage'));
    }
    
    try {
      const userData = JSON.parse(user);
      config.headers['user-id'] = userData.id;
      config.headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return Promise.reject(error);
    }
    
    // Добавляем логирование для отладки
    console.log('Making request to:', `${config.baseURL}${config.url}`);
    console.log('Request config:', {
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    });
    
    // Добавляем более информативное сообщение об ошибке
    if (error.response?.status === 500) {
      error.message = 'Ошибка сервера. Пожалуйста, попробуйте позже.';
    } else if (error.response?.status === 404) {
      error.message = 'Запрашиваемый ресурс не найден.';
    } else if (error.response?.status === 401) {
      error.message = 'Необходима авторизация.';
      // Очищаем данные пользователя при ошибке авторизации
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance; 