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
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Avatar,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  SelectChangeEvent,
  Divider,
  Switch,
  FormControlLabel,
  ButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import { useNavigate, useLocation } from 'react-router-dom';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import axios from '../config/axios';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company_id: number;
  company_name?: string;
  is_active: boolean | number | string;
}

interface Company {
  id: number;
  name: string;
}

const CompanyUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<number | ''>('');
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'user',
    company_id: user?.company_id || 1
  });
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const savedViewMode = localStorage.getItem('usersViewMode');
    return (savedViewMode as 'table' | 'cards') || 'table';
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('usersViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    console.log('CompanyUsers: useEffect triggered, user:', user);
    if (user) {
      console.log('CompanyUsers: Fetching data for user:', user.id);
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(user => {
        const matchesSearch = 
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = selectedRole ? user.role === selectedRole : true;
        const matchesCompany = selectedCompany ? user.company_id === selectedCompany : true;
        
        return matchesSearch && matchesRole && matchesCompany;
      });
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm, selectedRole, selectedCompany]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for company:', user?.company_id);
      const [usersResponse, companiesResponse] = await Promise.all([
        user?.role === 'owner' ? axios.get('/api/users') : axios.get(`/api/companies/${user?.company_id}/users`),
        user?.role === 'owner' ? axios.get('/api/companies') : Promise.resolve({ data: [] })
      ]);

      // Нормализуем данные о статусе пользователей
      const normalizedUsers = usersResponse.data.map((user: User) => ({
        ...user,
        is_active: Boolean(user.is_active)
      }));

      console.log('Normalized users data:', normalizedUsers);
      setUsers(normalizedUsers);
      
      if (user?.role === 'owner') {
        setCompanies(companiesResponse.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleCreateUser = async () => {
    try {
      setCreateUserError(null);
      
      // Проверяем, что все обязательные поля заполнены
      if (!newUser.email || !newUser.full_name || !newUser.password) {
        setCreateUserError('Пожалуйста, заполните все обязательные поля');
        return;
      }

      // Если пользователь не owner, устанавливаем company_id текущего пользователя
      if (user?.role !== 'owner') {
        newUser.company_id = user?.company_id || 1;
      }

      const response = await axios.post('/api/users', newUser);
      setUsers([...users, response.data]);
      setNewUser({
        email: '',
        full_name: '',
        password: '',
        role: 'user',
        company_id: user?.company_id || 1
      });
      setCreateUserDialog(false);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setCreateUserError(err.response?.data?.message || 'Ошибка при создании пользователя');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`/api/users/${userToDelete.id}`);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Ошибка при удалении пользователя');
    }
  };

  const handleActivateUser = async (userId: number, isActive: boolean) => {
    try {
      const response = await axios.patch(`/api/users/${userId}/activate`, {
        is_active: isActive
      });
      
      // Обновляем данные пользователя в локальном состоянии
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: response.data.is_active } : user
      ));
      
      setSuccessMessage(`Пользователь успешно ${isActive ? 'активирован' : 'деактивирован'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error changing user status:', err);
      setError('Ошибка при изменении статуса пользователя');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'error';
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
      case 'owner':
        return 'Владелец';
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

  const getStatusColor = (isActive: boolean | number | string) => {
    return Boolean(isActive) ? 'success' : 'error';
  };

  const getStatusLabel = (isActive: boolean | number | string) => {
    return Boolean(isActive) ? 'Активен' : 'Неактивен';
  };

  const handleViewModeChange = (mode: 'table' | 'cards') => {
    setViewMode(mode);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setSelectedRole(event.target.value);
  };

  const handleCompanyChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedCompany(event.target.value as number | '');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedCompany('');
  };

  const renderUserRow = (user: User) => (
    <TableRow key={user.id}>
      <TableCell>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2 }}>
            {user.full_name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{user.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip 
          label={getRoleLabel(user.role)} 
          color={getRoleColor(user.role) as any}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Chip 
          label={getStatusLabel(user.is_active)} 
          color={getStatusColor(user.is_active) as any}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <Tooltip title={user.is_active ? "Деактивировать" : "Активировать"}>
          <IconButton 
            onClick={() => handleActivateUser(user.id, !user.is_active)}
            color={user.is_active ? "error" : "success"}
          >
            {user.is_active ? <BlockIcon /> : <CheckCircleIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton 
            onClick={() => {
              setUserToDelete(user);
              setOpenDeleteDialog(true);
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  const renderCards = (users: User[]) => (
    <Grid container spacing={2}>
      {users.map((userItem) => (
        <Grid item xs={12} sm={6} md={4} key={userItem.id}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2 }}>
                  {userItem.full_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{userItem.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{userItem.email}</Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip 
                  label={getRoleLabel(userItem.role)} 
                  color={getRoleColor(userItem.role) as any}
                  size="small"
                />
                <Chip 
                  label={getStatusLabel(userItem.is_active)} 
                  color={getStatusColor(userItem.is_active) as any}
                  size="small"
                />
              </Box>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Tooltip title={userItem.is_active ? "Деактивировать" : "Активировать"}>
                  <IconButton 
                    onClick={() => handleActivateUser(userItem.id, !userItem.is_active)}
                    color={userItem.is_active ? "error" : "success"}
                  >
                    {userItem.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton 
                    onClick={() => {
                      setUserToDelete(userItem);
                      setOpenDeleteDialog(true);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSearchBar = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Поиск"
            value={searchTerm}
            onChange={handleSearchChange}
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
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              value={selectedRole}
              onChange={handleRoleChange}
              label="Роль"
            >
              <MenuItem value="">Все роли</MenuItem>
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
              <MenuItem value="tech_admin">Тех. администратор</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
            fullWidth
          >
            Сбросить фильтры
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            onClick={() => setCreateUserDialog(true)}
            startIcon={<AddIcon />}
            fullWidth
          >
            Новый пользователь
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderCreateUserDialog = () => (
    <Dialog open={createUserDialog} onClose={() => setCreateUserDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Создать нового пользователя</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Полное имя"
            value={newUser.full_name}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
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
          {user?.role === 'owner' && (
            <FormControl fullWidth>
              <InputLabel>Компания</InputLabel>
              <Select
                value={newUser.company_id}
                onChange={(e) => setNewUser({ ...newUser, company_id: Number(e.target.value) })}
                label="Компания"
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {createUserError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createUserError}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateUserDialog(false)}>Отмена</Button>
        <Button onClick={handleCreateUser} variant="contained" color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDeleteDialog = () => (
    <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
      <DialogTitle>Удалить пользователя</DialogTitle>
      <DialogContent>
        <Typography>Вы уверены, что хотите удалить этого пользователя?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
        <Button onClick={handleDeleteUser} color="error">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
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
            Пользователи
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Переключить вид">
              <IconButton 
                onClick={() => handleViewModeChange(viewMode === 'cards' ? 'table' : 'cards')} 
                color="primary"
              >
                {viewMode === 'cards' ? <TableChartIcon /> : <ViewModuleIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Обновить список">
              <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateUserDialog(true)}
            >
              Добавить пользователя
            </Button>
          </Box>
        </Box>

        {renderSearchBar()}

        {/* Информация о результатах поиска */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Найдено пользователей: {filteredUsers.length}
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {viewMode === 'cards' ? renderCards(filteredUsers) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Статус</TableCell>
                    {user?.role === 'owner' && <TableCell>Компания</TableCell>}
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(renderUserRow)}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {renderCreateUserDialog()}
        {renderDeleteDialog()}
      </Container>
    </PageTransition>
  );
};

export default CompanyUsers;