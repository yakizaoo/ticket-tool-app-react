import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';

interface Company {
  id: number;
  name: string;
  created_at: string;
  user_count?: number;
}

const Companies: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const savedMode = localStorage.getItem('companiesViewMode') as 'table' | 'cards' | null;
    const urlMode = location.pathname.includes('/cards') ? 'cards' as const : 'table' as const;
    return savedMode || urlMode;
  });

  // Обновляем URL при изменении вида
  useEffect(() => {
    const newPath = viewMode === 'cards' ? '/companies/cards' : '/companies';
    if (location.pathname !== newPath) {
      navigate(newPath);
    }
  }, [viewMode, navigate, location.pathname]);

  // Сохраняем вид в localStorage
  useEffect(() => {
    localStorage.setItem('companiesViewMode', viewMode);
  }, [viewMode]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.getCompanies();
      // Получаем количество пользователей для каждой компании
      const companiesWithUserCount = await Promise.all(
        response.data.map(async (company: Company) => {
          try {
            const usersResponse = await api.getCompanyUsers(company.id.toString());
            return {
              ...company,
              user_count: usersResponse.data.length
            };
          } catch (err) {
            console.error(`Error fetching users for company ${company.id}:`, err);
            return {
              ...company,
              user_count: 0
            };
          }
        })
      );
      setCompanies(companiesWithUserCount);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Ошибка при загрузке компаний');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [user?.id]);

  const handleCreateCompany = async () => {
    try {
      const response = await api.createCompany({ name: newCompanyName });
      setCompanies([...companies, response.data]);
      setNewCompanyName('');
      setOpenDialog(false);
    } catch (err) {
      console.error('Error creating company:', err);
      setError('Ошибка при создании компании');
    }
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;

    try {
      await api.deleteCompany(companyToDelete.id.toString());
      setCompanies(companies.filter(company => company.id !== companyToDelete.id));
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Ошибка при удалении компании');
    }
  };

  // Если пользователь не owner, перенаправляем на страницу компании
  useEffect(() => {
    if (user && user.role !== 'owner') {
      navigate('/company');
    }
  }, [user, navigate]);

  const renderTable = () => (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Компания</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow 
                key={company.id}
                hover
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer'
                }}
                onClick={() => {
                  console.log('Navigating to company profile:', company.id);
                  navigate(`/companies/${company.id}`);
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: '1.2rem'
                      }}
                    >
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" component="div">
                        {company.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {company.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(company.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Удалить компанию">
                    <IconButton 
                      color="error" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(company);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderCards = () => (
    <Grid container spacing={3}>
      {companies.map((company) => (
        <Grid item xs={12} sm={6} md={4} key={company.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
                boxShadow: 3
              }
            }}
            onClick={() => navigate(`/companies/${company.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem'
                  }}
                >
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    {company.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {company.id}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Дата создания: {new Date(company.created_at).toLocaleDateString('ru-RU')}
                </Typography>
                <Typography variant="body2" color="primary">
                  Пользователей: {company.user_count || 0}
                </Typography>
              </Box>
            </CardContent>
            <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Удалить компанию">
                <IconButton 
                  color="error" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(company);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
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
          <Typography variant="h4" component="h1" gutterBottom>
            Компании
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Переключить вид">
              <IconButton 
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} 
                color="primary"
              >
                {viewMode === 'table' ? <ViewModuleIcon /> : <TableChartIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Обновить список">
              <IconButton onClick={fetchCompanies} color="primary" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
            >
              Добавить компанию
            </Button>
          </Box>
        </Box>
        
        {viewMode === 'table' ? renderTable() : renderCards()}

        {/* Диалог создания компании */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Создать новую компанию</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название компании"
              fullWidth
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button onClick={handleCreateCompany} variant="contained" color="primary">
              Создать
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог подтверждения удаления */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Typography>
              Вы действительно хотите удалить компанию "{companyToDelete?.name}"?
              Это действие удалит компанию и всех её пользователей.
              Это действие нельзя отменить.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageTransition>
  );
};

export default Companies; 