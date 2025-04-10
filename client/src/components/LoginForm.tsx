import React, { useState } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        login(response.data.user, response.data.token);
        
        // Редирект на главную страницу
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Проверяем тип ошибки
      if (err.response && err.response.data) {
        // Проверяем, содержит ли сообщение об ошибке информацию о деактивации
        if (err.response.data.error && err.response.data.error.includes('деактивирована')) {
          setError('Ваша учетная запись деактивирована. Обратитесь к администратору.');
        } else {
          setError(err.response.data.error || 'Ошибка входа в систему');
        }
      } else {
        setError('Ошибка входа в систему. Проверьте соединение с интернетом.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Форма входа */}
    </div>
  );
};

export default LoginForm; 