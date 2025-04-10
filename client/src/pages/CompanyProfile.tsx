import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { 
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ViewModule as ViewModuleIcon,
  TableChart as TableChartIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { api } from '../services/api';

interface Company {
  id: number;
  name: string;
  created_at: string;
  user_count?: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id: number;
  is_active: boolean;
}

const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'user',
    company_id: Number(id)
  });
  const [user] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching company data for ID:', id);
      
      const [companyResponse, usersResponse] = await Promise.all([
        api.getCompany(id!),
        api.getCompanyUsers(id!)
      ]);
      
      console.log('Company data received:', companyResponse.data);
      console.log('Users data received:', usersResponse.data);
      
      setCompany({
        ...companyResponse.data,
        user_count: usersResponse.data.length
      });
      
      // Преобразуем is_active в булево значение и делаем глубокую копию объектов
      const processedUsers = usersResponse.data.map((user: any) => ({
        ...JSON.parse(JSON.stringify(user)),
        id: user.id.toString(),
        is_active: Boolean(user.is_active)
      }));
      
      console.log('Processed users data:', processedUsers);
      
      // Используем функциональную форму setState для гарантии работы с актуальным состоянием
      setUsers(processedUsers);
      setFilteredUsers(processedUsers);
      setEditName(companyResponse.data.name);
    } catch (err: any) {
      console.error('Error fetching company:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке данных компании');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(user => {
        const matchesSearch = 
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = selectedRole ? user.role === selectedRole : true;
        
        return matchesSearch && matchesRole;
      });
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm, selectedRole]);

  const handleEdit = async () => {
    try {
      await api.updateCompany(id!, { name: editName });
      setOpenEditDialog(false);
      fetchCompanyData();
    } catch (err: any) {
      console.error('Error updating company:', err);
      setError(err.response?.data?.error || 'Ошибка при обновлении компании');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteCompany(id!);
      navigate('/companies');
    } catch (err: any) {
      console.error('Error deleting company:', err);
      setError(err.response?.data?.error || 'Ошибка при удалении компании');
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await api.createUser(newUser);
      setUsers([...users, response.data]);
      setNewUser({
        email: '',
        full_name: '',
        password: '',
        role: 'user',
        company_id: Number(id)
      });
      setOpenCreateUserDialog(false);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.error || 'Ошибка при создании пользователя');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.error || 'Ошибка при удалении пользователя');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      console.log(`Activating user with ID: ${userId}`);
      await api.updateUser(userId, { is_active: true });
      
      // Обновляем локальный массив пользователей
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, is_active: true } : user
      );
      setUsers(updatedUsers);
      
      // Обновляем отфильтрованный массив
      const updatedFilteredUsers = filteredUsers.map(user => 
        user.id === userId ? { ...user, is_active: true } : user
      );
      setFilteredUsers(updatedFilteredUsers);
      
      setSuccessMessage('Пользователь успешно активирован');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Повторно загружаем данные с сервера для обновления
      setTimeout(() => {
        console.log("Refreshing data after activation");
        fetchCompanyData();
      }, 500);
    } catch (err: any) {
      console.error('Error activating user:', err);
      setError(err.response?.data?.error || 'Ошибка при активации пользователя');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      console.log(`Deactivating user with ID: ${userId}`);
      await api.updateUser(userId, { is_active: false });
      
      // Обновляем локальный массив пользователей
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, is_active: false } : user
      );
      setUsers(updatedUsers);
      
      // Обновляем отфильтрованный массив
      const updatedFilteredUsers = filteredUsers.map(user => 
        user.id === userId ? { ...user, is_active: false } : user
      );
      setFilteredUsers(updatedFilteredUsers);
      
      setSuccessMessage('Пользователь успешно деактивирован');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Повторно загружаем данные с сервера для обновления
      setTimeout(() => {
        console.log("Refreshing data after deactivation");
        fetchCompanyData();
      }, 500);
    } catch (err: any) {
      console.error('Error deactivating user:', err);
      setError(err.response?.data?.error || 'Ошибка при деактивации пользователя');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'tech_admin':
        return 'info';
      case 'user':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'tech_admin':
        return 'Тех. администратор';
      case 'user':
        return 'Пользователь';
      default:
        return role;
    }
  };

  const renderUsersSection = () => (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Пользователи компании
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateUserDialog(true)}
            >
              Добавить пользователя
            </Button>
            <Button
              variant="outlined"
              startIcon={viewMode === 'table' ? <ViewModuleIcon /> : <TableChartIcon />}
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            >
              {viewMode === 'table' ? 'Карточки' : 'Таблица'}
            </Button>
          </Box>
        </Box>

        {/* Панель поиска и фильтров */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Поиск"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Роль</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e: SelectChangeEvent) => setSelectedRole(e.target.value)}
                  label="Роль"
                >
                  <MenuItem value="">Все роли</MenuItem>
                  <MenuItem value="user">Пользователь</MenuItem>
                  <MenuItem value="admin">Администратор</MenuItem>
                  <MenuItem value="tech_admin">Тех. администратор</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {viewMode === 'table' ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>ФИО</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map(userItem => (
                  <TableRow 
                    key={userItem.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/users/${userItem.id}`)}
                  >
                    <TableCell>{userItem.id}</TableCell>
                    <TableCell>{userItem.full_name}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(userItem.role)}
                        color={getRoleColor(userItem.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={userItem.is_active ? "Активен" : "Деактивирован"}
                        color={userItem.is_active ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {(user?.role === 'owner' || user?.role === 'admin') && (
                          <Tooltip title={userItem.is_active ? "Деактивировать" : "Активировать"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                userItem.is_active ? handleDeactivateUser(userItem.id) : handleActivateUser(userItem.id);
                              }}
                              color={userItem.is_active ? "warning" : "success"}
                            >
                              {userItem.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${userItem.id}`);
                            }}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user?.role === 'owner' && (
                          <Tooltip title="Удалить">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(userItem.id);
                              }}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={2}>
            {filteredUsers.map((userItem) => (
              <Grid item xs={12} sm={6} md={4} key={userItem.id}>
                <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} 
                      onClick={() => navigate(`/users/${userItem.id}`)}
                    >
                      <Avatar>{userItem.full_name[0]}</Avatar>
                      <Box>
                        <Typography variant="h6">{userItem.full_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userItem.email}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={getRoleLabel(userItem.role)}
                            color={getRoleColor(userItem.role)}
                            size="small"
                          />
                          <Chip
                            label={userItem.is_active ? "Активен" : "Деактивирован"}
                            color={userItem.is_active ? "success" : "error"}
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid #eee', pt: 1 }}>
                      {(user?.role === 'owner' || user?.role === 'admin') && (
                        <Tooltip title={userItem.is_active ? "Деактивировать" : "Активировать"}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              userItem.is_active ? handleDeactivateUser(userItem.id) : handleActivateUser(userItem.id);
                            }}
                            color={userItem.is_active ? "warning" : "success"}
                          >
                            {userItem.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Профиль">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${userItem.id}`);
                          }}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user?.role === 'owner' && (
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(userItem.id);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Компания не найдена</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Заголовок с кнопками действий */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Вернуться к списку">
              <IconButton onClick={() => navigate('/companies')} color="primary">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" component="h1">
              Профиль компании
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Обновить">
              <IconButton onClick={fetchCompanyData} color="primary" sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {user?.role === 'owner' && (
              <>
                <Tooltip title="Редактировать">
                  <IconButton onClick={() => setOpenEditDialog(true)} color="primary" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton onClick={() => setOpenDeleteDialog(true)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Основная информация */}
        <Grid container spacing={4}>
          {/* Аватар и название */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                <BusinessIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {company.name}
                </Typography>
                <Chip 
                  label="Компания" 
                  color="primary" 
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={`ID: ${company.id}`} 
                  variant="outlined" 
                  size="small"
                />
              </Box>
            </Box>
          </Grid>

          {/* Детальная информация */}
          <Grid item xs={12}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Дата создания
                  </Typography>
                  <Typography variant="body1">
                    {new Date(company.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Количество пользователей
                  </Typography>
                  <Typography variant="body1">
                    {company.user_count || 'Нет данных'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {renderUsersSection()}

      {/* Диалог редактирования */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Редактировать компанию</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название компании"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Удалить компанию</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить компанию "{company.name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания пользователя */}
      <Dialog open={openCreateUserDialog} onClose={() => setOpenCreateUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создание нового пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="ФИО"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Пароль"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                label="Роль"
              >
                <MenuItem value="user">Пользователь</MenuItem>
                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <MenuItem value="admin">Администратор</MenuItem>
                )}
                <MenuItem value="tech_admin">Тех. администратор</MenuItem>
                {user?.role === 'owner' && <MenuItem value="owner">Владелец</MenuItem>}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateUserDialog(false)}>Отмена</Button>
          <Button onClick={handleCreateUser} variant="contained" color="primary">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyProfile; 