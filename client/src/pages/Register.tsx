import React, { useState } from 'react';
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
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      // Проверяем совпадение паролей
      if (formData.password !== formData.confirm_password) {
        throw new Error('Пароли не совпадают');
      }

      await axios.post('/api/users/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });

      // После успешной регистрации перенаправляем на страницу входа
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Регистрация
          </Typography>
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
                <TextField
                  fullWidth
                  label="Пароль"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Подтвердите пароль"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Зарегистрироваться
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">
                  Уже есть аккаунт?{' '}
                  <Link href="/login" underline="hover">
                    Войти
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register; 