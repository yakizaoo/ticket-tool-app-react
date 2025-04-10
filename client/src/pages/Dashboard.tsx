import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  Fade,
  Container,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { styled } from '@mui/material/styles';
import axios from '../config/axios';
import PageTransition from '../components/PageTransition';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: theme.palette.mode === 'light'
    ? 'rgba(255, 255, 255, 0.95)'
    : 'rgba(18, 18, 18, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: theme.palette.mode === 'light'
    ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
    : '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
  border: `1px solid ${theme.palette.mode === 'light'
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(255, 255, 255, 0.08)'}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)'
      : '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '20px',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
    : 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  color: theme.palette.mode === 'light' ? '#1976d2' : '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: 140,
  boxShadow: theme.palette.mode === 'light'
    ? '0 8px 32px rgba(33, 150, 243, 0.15), 0 2px 8px rgba(33, 150, 243, 0.1)'
    : '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 12px 40px rgba(33, 150, 243, 0.2), 0 4px 12px rgba(33, 150, 243, 0.15)'
      : '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
  },
}));

const COLORS = ['#2196f3', '#f50057', '#4caf50', '#ff9800', '#9c27b0'];

interface TicketStats {
  stats: {
    total: number;
    byStatus: {
      open: number;
      in_progress: number;
      closed: number;
      hidden: number;
    };
    byCategory: {
      [key: string]: number;
    };
    byUrgency: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  recentTickets: Array<{
    id: number;
    title: string;
    status: string;
    created_at: string;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/tickets/stats');
        if (response.data && response.data.stats) {
          setStats(response.data);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Некорректный формат данных от сервера');
        }
      } catch (err) {
        setError('Ошибка при загрузке статистики');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'info';
      case 'hidden':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const statusData = stats ? Object.entries(stats.stats.byStatus).map(([status, count]) => ({
    name: status,
    value: count,
  })) : [];

  const categoryData = stats ? Object.entries(stats.stats.byCategory).map(([category, count]) => ({
    name: category,
    value: count,
  })) : [];

  const urgencyData = stats ? Object.entries(stats.stats.byUrgency).map(([urgency, count]) => ({
    name: urgency,
    value: count,
  })) : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <PageTransition isDashboard={true}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 700,
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
              : 'linear-gradient(45deg, #64b5f6 30%, #90caf9 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Дашборд
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StatCard>
              <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                {stats.stats.total}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Всего тикетов
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatCard>
              <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                {stats.stats.byStatus.open}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Открытых
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatCard>
              <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                {stats.stats.byStatus.in_progress}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                В работе
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatCard>
              <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                {stats.stats.byStatus.closed}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Закрытых
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Статусы тикетов
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Категории тикетов
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Срочность тикетов
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={urgencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f50057" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Последние тикеты
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats.recentTickets.map((ticket) => (
                  <Box
                    key={ticket.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Typography variant="body1">{ticket.title}</Typography>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </Box>
                ))}
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </PageTransition>
  );
};

export default Dashboard; 