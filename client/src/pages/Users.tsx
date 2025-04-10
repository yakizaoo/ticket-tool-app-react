import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  InputAdornment,
  ClickAwayListener,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Tooltip,
  ButtonGroup,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company_id: number;
  is_active: boolean | number | string;
}

interface Company {
  id: number;
  name: string;
}

const Users = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    company_id: user?.company_id || null
  });
  
  // Новые состояния для фильтрации
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<Company | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [editData, setEditData] = useState<{
    id?: number,
    full_name?: string,
    email?: string,
    role?: string,
    company_id?: number | null
  }>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Только владелец может загружать список всех компаний
      if (user?.role === 'owner') {
      const [usersResponse, companiesResponse] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/companies')
      ]);

        if (usersResponse.data.length === 0) {
          console.log('No users returned from API');
        } else {
          console.log(`Received ${usersResponse.data.length} users from API`);
        }

      setUsers(usersResponse.data);
      setCompanies(companiesResponse.data);
      } else {
        // Для других ролей загружаем только пользователей своей компании
        const usersResponse = await axios.get('/api/users');
        
        if (usersResponse.data.length === 0) {
          console.log('No users returned from API');
        } else {
          console.log(`Received ${usersResponse.data.length} users from API`);
        }
        
        setUsers(usersResponse.data);
        
        // Для non-owner создаем массив с одной своей компанией
        if (user?.company_id) {
          setCompanies([{ id: user.company_id, name: user?.company_name || 'Моя компания' }]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      if (err.response && err.response.status === 403) {
        setError('У вас нет прав для просмотра этой страницы');
      } else {
        setError('Ошибка при загрузке данных');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getFilteredUsers = () => {
    if (!searchTerm) return [];
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user => 
      user.id.toString().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      companies.find(c => c.id === user.company_id)?.name.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  };

  const getDisplayedUsers = () => {
    let filtered = users;
    
    // Текстовый фильтр
    if (activeFilter) {
      const filterLower = activeFilter.toLowerCase();
      filtered = filtered.filter(user => 
        user.id.toString().includes(filterLower) ||
        user.email.toLowerCase().includes(filterLower) ||
        user.full_name.toLowerCase().includes(filterLower) ||
        user.role.toLowerCase().includes(filterLower) ||
        companies.find(c => c.id === user.company_id)?.name.toLowerCase().includes(filterLower)
      );
    }
    
    // Фильтр по роли
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Фильтр по компании
    if (companyFilter) {
      filtered = filtered.filter(user => user.company_id === companyFilter.id);
    }
    
    return filtered;
  };

  const handleSearch = () => {
    setActiveFilter(searchTerm);
    setShowSuggestions(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return '#f44336';
      case 'admin': return '#2196f3';
      case 'tech_admin': return '#00bcd4';
      case 'user': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setActiveFilter('');
    setShowSuggestions(false);
  };

  const getCompanyName = (companyId: number) => {
    if (user?.role === 'owner') {
      const company = companies.find(c => c.id === companyId);
      return company ? company.name : 'Неизвестно';
    }
    
    return user?.company_id === companyId ? 'Текущая компания' : '-';
  };

  const handleOpenCreateDialog = () => {
    // Для всех ролей кроме owner, установим company_id автоматически
    if (user?.role !== 'owner') {
      setNewUser(prev => ({
        ...prev,
        company_id: user?.company_id || null
      }));
    }
    setOpenCreateDialog(true);
  };

  const handleCreateUser = async () => {
    // Для владельца требуется выбрать компанию, для остальных она уже задана
    if (user?.role === 'owner' && !newUser.company_id) {
      setError('Выберите компанию');
      return;
    }
    
    try {
      const userData = { ...newUser };
      
      // Убедимся, что для не-owner ролей компания всегда установлена
      if (user?.role !== 'owner') {
        userData.company_id = user?.company_id ? user.company_id : null;
      }
      
      const response = await axios.post('/api/users', userData);
      setUsers([...users, response.data]);
      setOpenCreateDialog(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'user',
        company_id: user?.company_id || null
      });
      setError(null);
    } catch (err: any) {
      console.error('Error creating user:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ошибка при создании пользователя');
      }
    }
  };

  const getAvailableRoles = () => {
    switch (user?.role) {
      case 'owner':
        return [
          { value: 'owner', label: 'Владелец' },
          { value: 'admin', label: 'Администратор' },
          { value: 'tech_admin', label: 'Тех. администратор' },
          { value: 'user', label: 'Пользователь' }
        ];
      case 'admin':
        return [
          { value: 'admin', label: 'Администратор' },
          { value: 'tech_admin', label: 'Тех. администратор' },
          { value: 'user', label: 'Пользователь' }
        ];
      case 'tech_admin':
        return [
          { value: 'user', label: 'Пользователь' }
        ];
      default:
        return [];
    }
  };

  const canCreateUser = () => {
    return ['owner', 'admin', 'tech_admin'].includes(user?.role || '');
  };

  const clearFilters = () => {
    setRoleFilter(null);
    setCompanyFilter(null);
              setSearchTerm('');
    setActiveFilter('');
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    try {
      await axios.delete(`/api/users/${selectedUserId}`);
      setUsers(users.filter(user => user.id !== selectedUserId));
      setOpenDeleteDialog(false);
      setSelectedUserId(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ошибка при удалении пользователя');
      }
    }
  };

  const handleActivateUser = async (userId: number, isActive: boolean) => {
    try {
      await axios.put(`/api/users/${userId}`, { is_active: isActive });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (err: any) {
      console.error('Error updating user status:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ошибка при изменении статуса пользователя');
      }
    }
  };

  const handleEditUserDialog = (userId: number) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    setEditData({
      id: userToEdit.id,
      full_name: userToEdit.full_name,
      email: userToEdit.email,
      role: userToEdit.role,
      company_id: userToEdit.company_id
    });
    setEditErrors({});
    setError(null);
    setOpenEditDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку для этого поля при изменении
    if (editErrors[name]) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    setEditData(prev => ({ ...prev, role: value }));
    
    if (editErrors.role) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.role;
        return newErrors;
      });
    }
  };

  const handleCompanyChange = (newCompany: Company | null) => {
    setEditData(prev => ({ ...prev, company_id: newCompany ? newCompany.id : null }));
    
    if (editErrors.company_id) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.company_id;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!editData.full_name?.trim()) {
      errors.full_name = 'Имя обязательно';
    }
    
    // Владелец может редактировать все поля
    if (user?.role === 'owner') {
      if (!editData.email?.trim()) {
        errors.email = 'Email обязателен';
      } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
        errors.email = 'Введите корректный email';
      }
      
      if (!editData.role) {
        errors.role = 'Выберите роль';
      }
      
      if (editData.company_id === null || editData.company_id === undefined) {
        errors.company_id = 'Выберите компанию';
      }
    }
    
    // Администратор редактирует только имя и роль (кроме owner)
    if (user?.role === 'admin') {
      if (!editData.role) {
        errors.role = 'Выберите роль';
      }
      if (editData.role === 'owner') {
        errors.role = 'Администратор не может назначать роль владельца';
      }
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setOpenConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!editData.id) return;
    
    try {
      setError(null);
      let dataToSend: any = {};
      
      // Определяем, какие данные отправлять в зависимости от роли
      if (user?.role === 'admin') {
        dataToSend = { full_name: editData.full_name };
        
        // Админ может менять роль, но не на owner
        if (editData.role && editData.role !== 'owner') {
          dataToSend.role = editData.role;
        }
      } else if (user?.role === 'owner') {
        // Владелец может изменить все поля
        dataToSend = {
          full_name: editData.full_name,
          email: editData.email,
          role: editData.role,
          company_id: editData.company_id
        };
      } else if (user?.role === 'tech_admin') {
        // Тех. админ может менять только имя
        dataToSend = { full_name: editData.full_name };
      }
      
      const response = await axios.put(`/api/users/${editData.id}`, dataToSend);
      
      // Обновляем список пользователей
      setUsers(users.map(u => u.id === editData.id ? { ...u, ...dataToSend } : u));
      
      setOpenEditDialog(false);
      setOpenConfirmDialog(false);
      setSuccessMessage('Данные пользователя успешно обновлены');
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Ошибка при обновлении данных пользователя');
      }
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditErrors({});
    setError(null);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleEditUser = (userId: number) => {
    // Вместо перехода на страницу профиля открываем диалог редактирования
    handleEditUserDialog(userId);
  };

  const handleRowClick = (event: React.MouseEvent, userId: number) => {
    // Предотвращаем переход на страницу пользователя при клике на кнопки действий
    if ((event.target as HTMLElement).closest('.action-button')) {
      event.stopPropagation();
      return;
    }
    handleUserClick(userId);
  };

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

  const filteredUsers = getFilteredUsers();
  const displayedUsers = getDisplayedUsers();

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Пользователи
          </Typography>
        </Box>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ position: 'relative', flexGrow: 1 }}>
              <TextField
                fullWidth
                placeholder="Поиск пользователей..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {searchTerm && (
                        <IconButton
                          onClick={handleClear}
                          edge="end"
                          size="small"
                          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={handleSearch} edge="end" color="primary" size="small">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, pr: 0.5 }
                }}
              />
              {showSuggestions && (
                <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                  <Paper
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      zIndex: 1000,
                      mt: 0.5,
                      borderRadius: 2,
                      boxShadow: 3,
                      maxHeight: 350,
                      overflow: 'auto'
                    }}
                  >
                    <List dense>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <ListItem
                            button
                            key={user.id}
                            onClick={() => handleUserClick(user.id)}
                            sx={{ py: 1 }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
                                {user.full_name.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={user.full_name}
                              secondary={
                                <React.Fragment>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    {user.email} • {user.role}
                                    {user?.role === 'owner' && (
                                      <>
                                        {' • '}
                                        <Typography component="span" variant="body2" color="primary">
                                          {companies.find(c => c.id === user.company_id)?.name}
                                        </Typography>
                                      </>
                                    )}
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem sx={{ py: 1 }}>
                          <ListItemText primary="Ничего не найдено" />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </ClickAwayListener>
              )}
            </Box>
            {canCreateUser() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{ borderRadius: 2, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Добавить пользователя
            </Button>
            )}
          </Box>

          {user?.role === 'owner' && (
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              flexWrap: 'wrap',
              borderBottom: '1px solid', 
              borderColor: 'divider' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterListIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={roleFilter || ''}
                    onChange={(e) => setRoleFilter(e.target.value || null)}
                    displayEmpty
                    sx={{ 
                      '& .MuiSelect-select': { py: 0.6 },
                      borderRadius: 2 
                    }}
                  >
                    <MenuItem value="">Все роли</MenuItem>
                    <MenuItem value="owner">Владелец</MenuItem>
                    <MenuItem value="admin">Администратор</MenuItem>
                    <MenuItem value="tech_admin">Тех. администратор</MenuItem>
                    <MenuItem value="user">Пользователь</MenuItem>
                  </Select>
                </FormControl>
        </Box>

              <Autocomplete
                options={companies}
                getOptionLabel={(option) => option.name}
                value={companyFilter}
                onChange={(_, newValue) => setCompanyFilter(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Фильтр по компании"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: 2 }
                    }}
                  />
                )}
                sx={{ width: 250 }}
                disablePortal
                blurOnSelect
                clearOnBlur
                handleHomeEndKeys
                selectOnFocus
              />
              
              {(roleFilter || companyFilter) && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={clearFilters}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    py: 0.6,
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      borderColor: 'primary.dark'
                    }
                  }}
                >
                  Сбросить
                </Button>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                Найдено: {displayedUsers.length}
              </Typography>
            </Box>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  {user?.role === 'owner' && <TableCell>Компания</TableCell>}
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((userItem) => (
                    <TableRow
                      key={userItem.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={(e) => handleRowClick(e, userItem.id)}
                    >
                      <TableCell>{userItem.id}</TableCell>
                      <TableCell>{userItem.full_name}</TableCell>
                      <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                        <Box
                          sx={{
                            backgroundColor: getRoleColor(userItem.role),
                            color: 'white',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {userItem.role}
                        </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={!userItem.is_active ? 'Деактивирована' : 'Активна'}
                        color={!userItem.is_active ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                      {user?.role === 'owner' && (
                    <TableCell>
                          {getCompanyName(userItem.company_id)}
                    </TableCell>
                      )}
                    <TableCell>
                      <ButtonGroup size="small" className="action-button">
                        {/* Редактирование доступно для всех админских ролей */}
                        {['owner', 'admin', 'tech_admin'].includes(user?.role || '') && (
                          <Tooltip title="Редактировать">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(userItem.id);
                              }}
                              color="primary"
                              className="action-button"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* Активация/деактивация доступна для owner и admin */}
                        {['owner', 'admin'].includes(user?.role || '') && (
                          <Tooltip title={!userItem.is_active ? "Активировать" : "Деактивировать"}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivateUser(userItem.id, !userItem.is_active);
                              }}
                              color={!userItem.is_active ? "success" : "warning"}
                              className="action-button"
                            >
                              {!userItem.is_active ? 
                                <CheckCircleIcon fontSize="small" /> : 
                                <BlockIcon fontSize="small" />
                              }
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* Удаление доступно только для owner */}
                        {user?.role === 'owner' && (
                          <Tooltip title="Удалить">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserId(userItem.id);
                                setOpenDeleteDialog(true);
                              }}
                              color="error"
                              className="action-button"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={user?.role === 'owner' ? 7 : 6} align="center">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Пароль"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="ФИО"
              fullWidth
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              required
            />

            <FormControl fullWidth margin="dense" required>
              <InputLabel>Роль</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                label="Роль"
              >
                {getAvailableRoles().map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {user?.role === 'owner' && (
              <Autocomplete
                options={companies}
                getOptionLabel={(option) => option.name}
                value={companies.find(company => company.id === newUser.company_id) || null}
                onChange={(_, newValue) => {
                  setNewUser({ ...newUser, company_id: newValue ? newValue.id : null });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Компания"
                    required
                    error={!newUser.company_id && !!error}
                    helperText={!newUser.company_id && !!error ? 'Обязательное поле' : ''}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography>{option.name}</Typography>
                  </li>
                )}
                fullWidth
                disablePortal
                blurOnSelect
                clearOnBlur
                handleHomeEndKeys
                selectOnFocus
              />
            )}
            
            {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
          )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Отмена</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить этого пользователя? Это действие невозможно отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомление об успешном обновлении */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000, boxShadow: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Диалог редактирования пользователя */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование пользователя</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Имя"
              name="full_name"
              value={editData.full_name || ''}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!editErrors.full_name}
              helperText={editErrors.full_name}
            />
            
            {user?.role === 'owner' && (
              <>
                <TextField
                  label="Email"
                  name="email"
                  value={editData.email || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!editErrors.email}
                  helperText={editErrors.email}
                />
                
                <FormControl fullWidth required error={!!editErrors.role}>
                  <InputLabel>Роль</InputLabel>
                  <Select
                    name="role"
                    value={editData.role || ''}
                    onChange={handleRoleChange}
                    label="Роль"
                  >
                    <MenuItem value="owner">Владелец</MenuItem>
                    <MenuItem value="admin">Администратор</MenuItem>
                    <MenuItem value="tech_admin">Тех. администратор</MenuItem>
                    <MenuItem value="user">Пользователь</MenuItem>
                  </Select>
                  {editErrors.role && <FormHelperText>{editErrors.role}</FormHelperText>}
                </FormControl>
                
                <Autocomplete
                  options={companies}
                  getOptionLabel={(option) => option.name}
                  value={companies.find(company => company.id === editData.company_id) || null}
                  onChange={(_, newValue) => handleCompanyChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Компания"
                      required
                      error={!!editErrors.company_id}
                      helperText={editErrors.company_id}
                    />
                  )}
                  fullWidth
                />
              </>
            )}
            
            {user?.role === 'admin' && (
              <FormControl fullWidth required error={!!editErrors.role}>
                <InputLabel>Роль</InputLabel>
                <Select
                  name="role"
                  value={editData.role || ''}
                  onChange={handleRoleChange}
                  label="Роль"
                >
                  <MenuItem value="admin">Администратор</MenuItem>
                  <MenuItem value="tech_admin">Тех. администратор</MenuItem>
                  <MenuItem value="user">Пользователь</MenuItem>
                </Select>
                {editErrors.role && <FormHelperText>{editErrors.role}</FormHelperText>}
              </FormControl>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<CancelIcon />} 
            onClick={handleCloseEditDialog}
            color="inherit"
          >
            Отмена
          </Button>
          <Button 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            color="primary"
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения сохранения */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Подтверждение сохранения изменений</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            <Typography variant="body1">
              Вы действительно хотите изменить данные пользователя?
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Данные пользователя */}
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  width: '100%',
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Данные пользователя
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Имя:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {editData.full_name}
                    </Typography>
                  </Box>
                  
                  {user?.role === 'owner' && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Email:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {editData.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Роль:</Typography>
                        <Chip 
                          label={editData.role} 
                          size="small" 
                          sx={{ 
                            bgcolor: getRoleColor(editData.role || 'user'),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Компания:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {companies.find(c => c.id === editData.company_id)?.name || 'Не указана'}
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Роль:</Typography>
                      <Chip 
                        label={editData.role} 
                        size="small" 
                        sx={{ 
                          bgcolor: getRoleColor(editData.role || 'user'),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }} 
                      />
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<CancelIcon />} 
            onClick={handleCloseConfirmDialog}
            color="inherit"
          >
            Отмена
          </Button>
          <Button 
            startIcon={<SaveIcon />} 
            onClick={handleConfirmSave}
            color="primary"
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  </PageTransition>
);
};

export default Users; 