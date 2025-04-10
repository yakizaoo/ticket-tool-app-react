import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'task',
    urgency: 'medium',
    assigned_role: 'admin',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting ticket data:', {
        ...formData,
        created_by: user.id,
        company_id: user.company_id,
      });

      const response = await axios.post('/api/tickets', {
        ...formData,
        created_by: user.id,
        company_id: user.company_id,
      });

      console.log('Ticket creation response:', response.data);

      if (response.data) {
        navigate('/tickets');
      }
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Ошибка при создании тикета');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Создание тикета
      </Typography>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Заголовок"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
              disabled={loading}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Категория</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleSelectChange}
                label="Категория"
                disabled={loading}
              >
                <MenuItem value="bug">Ошибка</MenuItem>
                <MenuItem value="feature">Функционал</MenuItem>
                <MenuItem value="task">Задача</MenuItem>
                <MenuItem value="other">Другое</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Срочность</InputLabel>
              <Select
                name="urgency"
                value={formData.urgency}
                onChange={handleSelectChange}
                label="Срочность"
                disabled={loading}
              >
                <MenuItem value="low">Низкая</MenuItem>
                <MenuItem value="medium">Средняя</MenuItem>
                <MenuItem value="high">Высокая</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Назначить на</InputLabel>
              <Select
                name="assigned_role"
                value={formData.assigned_role}
                onChange={handleSelectChange}
                label="Назначить на"
                disabled={loading}
              >
                <MenuItem value="admin">Администратор</MenuItem>
                <MenuItem value="tech_admin">Технический администратор</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Создать'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/tickets')}
                disabled={loading}
              >
                Отмена
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateTicket; 