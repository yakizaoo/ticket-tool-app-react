import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

interface EditProfileProps {
  onCancel: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onCancel }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Проверяем совпадение паролей
      if (formData.new_password && formData.new_password !== formData.confirm_password) {
        throw new Error('Новые пароли не совпадают');
      }

      // Проверяем, что текущий пароль указан при изменении данных
      if ((formData.new_password || formData.email !== user?.email) && !formData.current_password) {
        throw new Error('Для изменения данных необходимо указать текущий пароль');
      }

      const response = await axios.put('/api/users/profile', {
        full_name: formData.full_name,
        email: formData.email,
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      // Обновляем данные пользователя в контексте
      updateUser(response.data);
      
      setSuccess('Профиль успешно обновлен');
      
      // Очищаем поля паролей
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));

      // Редирект на страницу профиля через 1 секунду
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Произошла ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Редактирование профиля
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
        >
          Отмена
        </Button>
      </Box>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ФИО"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Изменение пароля
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Заполните поля ниже только если хотите изменить пароль
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Текущий пароль"
                  name="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Новый пароль"
                  name="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Подтвердите новый пароль"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              {success && (
                <Grid item xs={12}>
                  <Alert severity="success">{success}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Сохранить изменения
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditProfile; 