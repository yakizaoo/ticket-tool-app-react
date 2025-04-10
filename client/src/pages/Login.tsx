import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Divider,
  useTheme,
  Fade,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../config/axios';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(18, 18, 18, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(255, 255, 255, 0.1)'}`,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 20px',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData);
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (response.data && response.data.user && response.data.token) {
        login(response.data.user, response.data.token);
        navigate('/');
      } else {
        setError('Некорректный ответ от сервера');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType: string) => {
    setError('');
    setLoading(true);

    let email = '';
    let password = '';

    switch (userType) {
      case 'owner':
        email = 'owner@servicetask.com';
        password = 'password123';
        break;
      case 'company-admin':
        email = 'admin@company.com';
        password = 'password123';
        break;
      case 'company-user':
        email = 'user@company.com';
        password = 'password123';
        break;
      case 'company-tech':
        email = 'techadm@te.ch';
        password = 'techadm@te.ch';
        break;
      default:
        setError('Неизвестный тип пользователя');
        setLoading(false);
        return;
    }

    try {
      console.log('Attempting quick login with user type:', userType);
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('Quick login response:', response.data);

      if (response.data && response.data.user && response.data.token) {
        login(response.data.user, response.data.token);
        navigate('/');
      } else {
        setError('Некорректный ответ от сервера');
      }
    } catch (err) {
      console.error('Quick login error:', err);
      setError('Ошибка при быстром входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Fade in timeout={1000}>
          <StyledCard sx={{ width: '100%', p: 3 }}>
            <CardContent>
              <Typography 
                component="h1" 
                variant="h4" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  mb: 3,
                  background: theme.palette.mode === 'light'
                    ? 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)'
                    : 'linear-gradient(45deg, #90caf9 30%, #21CBF3 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                }}
              >
                Вход в систему
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Пароль"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
                {error && (
                  <Typography 
                    color="error" 
                    align="center" 
                    sx={{ 
                      mt: 2,
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: theme.palette.mode === 'light'
                        ? 'rgba(211, 47, 47, 0.1)'
                        : 'rgba(211, 47, 47, 0.2)',
                    }}
                  >
                    {error}
                  </Typography>
                )}
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Войти
                </StyledButton>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Тестовый доступ
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: theme.palette.mode === 'light'
                      ? 'rgba(33, 150, 243, 0.1)'
                      : 'rgba(144, 202, 249, 0.1)',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Service Task Company (ID: 1)
                  </Typography>
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickLogin('owner')}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Войти как Владелец
                  </StyledButton>
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: theme.palette.mode === 'light'
                      ? 'rgba(245, 124, 0, 0.1)'
                      : 'rgba(255, 167, 38, 0.1)',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    ООО Компания (ID: 2)
                  </Typography>
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickLogin('company-admin')}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Войти как Администратор
                  </StyledButton>
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickLogin('company-tech')}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Войти как Тех. Администратор
                  </StyledButton>
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickLogin('company-user')}
                    fullWidth
                  >
                    Войти как Пользователь
                  </StyledButton>
                </Paper>
              </Box>
            </CardContent>
          </StyledCard>
        </Fade>
      </Box>
    </Container>
  );
};

export default Login; 