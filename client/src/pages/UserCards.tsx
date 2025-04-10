import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company_id: number;
  company_name?: string;
}

const UserCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(
    location.pathname === '/users/cards' ? 'cards' : 'table'
  );

  const handleViewModeChange = (mode: 'table' | 'cards') => {
    setViewMode(mode);
    navigate(mode === 'cards' ? '/users/cards' : '/users');
  };

  const fetchData = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTable = () => (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Пользователь</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Роль</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Компания</th>
          </tr>
        </thead>
        <tbody>
          {users.map((userItem) => (
            <tr 
              key={userItem.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/users/${userItem.id}`)}
            >
              <td style={{ padding: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar>{userItem.full_name?.[0]}</Avatar>
                  <span>{userItem.full_name}</span>
                </Box>
              </td>
              <td style={{ padding: '8px' }}>{userItem.email}</td>
              <td style={{ padding: '8px' }}>{userItem.role}</td>
              <td style={{ padding: '8px' }}>{userItem.company_name || `ID: ${userItem.company_id}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );

  const renderCards = () => (
    <Grid container spacing={2}>
      {users.map((userItem) => (
        <Grid item xs={12} sm={6} md={4} key={userItem.id}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
            onClick={() => navigate(`/users/${userItem.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>{userItem.full_name?.[0]}</Avatar>
                <Box>
                  <Typography variant="h6">{userItem.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userItem.email}
                  </Typography>
                  <Typography variant="body2">
                    Роль: {userItem.role}
                  </Typography>
                  <Typography variant="body2">
                    Компания: {userItem.company_name || `ID: ${userItem.company_id}`}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Пользователи
          </Typography>
          <IconButton 
            onClick={() => handleViewModeChange(viewMode === 'cards' ? 'table' : 'cards')} 
            color="primary"
          >
            {viewMode === 'cards' ? <TableChartIcon /> : <ViewModuleIcon />}
          </IconButton>
        </Box>

        {viewMode === 'table' ? renderTable() : renderCards()}
      </Container>
    </PageTransition>
  );
};

export default UserCards; 