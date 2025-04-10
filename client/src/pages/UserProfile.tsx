import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import StickerDialog from '../components/StickerDialog';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company_id: number;
  company_name?: string;
  is_active: boolean;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

interface UserUpdateData {
  full_name?: string;
  email?: string;
  role?: string;
  company_id?: number;
}

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

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [editData, setEditData] = useState<UserUpdateData>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openStickerDialog, setOpenStickerDialog] = useState(false);
  const [stickerMessage, setStickerMessage] = useState('не надо дядя');

  // Проверяем права на редактирование
  const canEditFullInfo = user?.role === 'owner';
  const canEditName = ['owner', 'admin'].includes(user?.role || '');
  const canEditRole = ['owner', 'admin'].includes(user?.role || '');
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${id}`);
      setUserData(response.data);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке данных пользователя');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    if (!canEditFullInfo || loadingCompanies) return;
    
    try {
      setLoadingCompanies(true);
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
      
      if (userData?.company_id) {
        const currentCompany = response.data.find((c: Company) => c.id === userData.company_id);
        setSelectedCompany(currentCompany || null);
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  useEffect(() => {
    // Если диалог открыт и есть данные пользователя, загружаем компании
    if (openEditDialog && userData && canEditFullInfo) {
      fetchCompanies();
    }
  }, [openEditDialog, userData]);

  const handleDelete = async () => {
    if (!userData) return;

    try {
      setError(null);
      await axios.delete(`/api/users/${userData.id}`);
      setOpenDeleteDialog(false);
      navigate('/users');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.error || 'Ошибка при удалении пользователя');
    }
  };

  const handleOpenEditDialog = () => {
    if (!userData) return;
    
    setEditData({
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      company_id: userData.company_id
    });
    setEditErrors({});
    setError(null);
    setOpenEditDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    
    // Очищаем ошибку при изменении поля
    if (editErrors[name]) {
      setEditErrors({ ...editErrors, [name]: '' });
    }
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    setEditData({ ...editData, role: e.target.value });
  };

  const handleCompanyChange = (company: Company | null) => {
    setSelectedCompany(company);
    setEditData({ 
      ...editData, 
      company_id: company ? company.id : undefined 
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!editData.full_name?.trim()) {
      errors.full_name = 'Имя обязательно для заполнения';
    }
    
    if (canEditFullInfo) {
      if (!editData.email?.trim()) {
        errors.email = 'Email обязателен для заполнения';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editData.email)) {
        errors.email = 'Некорректный формат email';
      }
      
      if (!editData.role) {
        errors.role = 'Роль обязательна для заполнения';
      }
      
      if (!editData.company_id) {
        errors.company_id = 'Компания обязательна для заполнения';
      }
    }
    
    // Валидация для админа, если он меняет роль
    if (user?.role === 'admin' && !canEditFullInfo) {
      if (!editData.role) {
        errors.role = 'Роль обязательна для заполнения';
      } else if (editData.role === 'owner') {
        errors.role = 'Админ не может назначать роль Владельца';
      }
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Если пользователь пытается изменить свою роль, показываем стикер
    if (Number(id) === user?.id && editData.role !== userData?.role) {
      setStickerMessage('не надо менять свою роль, дядя');
      setOpenStickerDialog(true);
      return;
    }

    setOpenConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      setError(null);
      let dataToSend: UserUpdateData = {};
      
      // Если админ, отправляем имя и возможно роль
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
      }
      
      const response = await axios.put(`/api/users/${id}`, dataToSend);
      setUserData(response.data);
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

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleDeleteClick = () => {
    // Если пользователь пытается удалить себя, показываем стикер
    if (Number(id) === user?.id) {
      setStickerMessage('не надо удалять свой аккаунт, дядя');
      setOpenStickerDialog(true);
      return;
    }
    
    setOpenDeleteDialog(true);
  };

  const handleActivateUser = async () => {
    try {
      setError(null);
      console.log(`Активация пользователя ${id}, отправка данных:`, { is_active: true });
      
      // Используем метод PUT /api/users/:id вместо POST /api/users/:id/activate
      const response = await axios.put(`/api/users/${id}`, { is_active: true });
      console.log('Ответ сервера при активации:', response.data);
      
      setSuccessMessage('Пользователь успешно активирован');
      fetchUserData(); // Обновляем данные пользователя
    } catch (err: any) {
      console.error('Error activating user:', err);
      setError(err.response?.data?.error || 'Ошибка при активации пользователя');
    }
  };

  const handleDeactivateUser = async () => {
    if (!userData) return;

    // Если пользователь пытается деактивировать себя, показываем стикер
    if (Number(id) === user?.id) {
      setStickerMessage('не надо деактивировать свой аккаунт, дядя');
      setOpenStickerDialog(true);
      return;
    }

    try {
      setError(null);
      console.log(`Деактивация пользователя ${id}, отправка данных:`, { is_active: false });
      
      // Используем метод PUT /api/users/:id вместо POST /api/users/:id/deactivate
      const response = await axios.put(`/api/users/${id}`, { is_active: false });
      console.log('Ответ сервера при деактивации:', response.data);
      
      setSuccessMessage('Пользователь успешно деактивирован');
      fetchUserData(); // Обновляем данные пользователя
    } catch (err: any) {
      console.error('Error deactivating user:', err);
      setError(err.response?.data?.error || 'Ошибка при деактивации пользователя');
    }
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

  if (!userData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Пользователь не найден</Alert>
      </Container>
    );
  }

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/users')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Профиль пользователя
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120,
                    mb: 2,
                    bgcolor: (theme) => {
                      switch (userData.role) {
                        case 'owner':
                          return theme.palette.error.main;
                        case 'admin':
                          return theme.palette.primary.main;
                        case 'tech_admin':
                          return theme.palette.info.main;
                        case 'user':
                          return theme.palette.success.main;
                        default:
                          return theme.palette.grey[500];
                      }
                    },
                    fontSize: '3rem',
                    fontWeight: 500,
                  }}
                >
                  {userData.full_name?.charAt(0)?.toUpperCase() || userData.email?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Chip 
                  label={getRoleLabel(userData.role)} 
                  color={getRoleColor(userData.role)} 
                  size="medium"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {canEditName && (
                    <Tooltip title="Редактировать">
                      <IconButton color="primary" onClick={handleOpenEditDialog}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {user?.role === 'owner' && (
                    <Tooltip title="Удалить">
                      <IconButton color="error" onClick={handleDeleteClick}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Обновить">
                    <IconButton color="primary" onClick={fetchUserData}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Имя
                    </Typography>
                    <Typography variant="body1">
                      {userData.full_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Статус учетной записи
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                      <Chip
                        label={userData.is_active ? 'Активна' : 'Деактивирована'}
                        color={userData.is_active ? 'success' : 'error'}
                      />
                    </Stack>
                    {canEditFullInfo && userData.id !== user?.id && (
                      <>
                        {userData.is_active ? (
                          <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={handleDeactivateUser}
                            startIcon={<BlockIcon />}
                            size="small"
                          >
                            Деактивировать
                          </Button>
                        ) : (
                          <Button 
                            variant="outlined" 
                            color="success" 
                            onClick={handleActivateUser}
                            startIcon={<CheckCircleIcon />}
                            size="small"
                          >
                            Активировать
                          </Button>
                        )}
                      </>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {userData.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID
                    </Typography>
                    <Typography variant="body1">
                      {userData.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Компания
                    </Typography>
                    <Typography variant="body1">
                      {userData.company_name || `ID: ${userData.company_id}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Дата регистрации
                    </Typography>
                    <Typography variant="body1">
                      {new Date(userData.created_at).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Роль
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        label={getRoleLabel(userData.role)}
                        color={getRoleColor(userData.role)}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>

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
              
              {canEditFullInfo && (
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
                    value={selectedCompany}
                    onChange={(_, newValue) => handleCompanyChange(newValue)}
                    loading={loadingCompanies}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Компания"
                        required
                        error={!!editErrors.company_id}
                        helperText={editErrors.company_id}
                      />
                    )}
                  />
                </>
              )}
              
              {user?.role === 'admin' && !canEditFullInfo && (
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

        {/* Диалог подтверждения удаления учетной записи пользователя */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              borderTop: '4px solid',
              borderColor: 'error.dark',
              borderRadius: 1
            }
          }}
        >
          <DialogTitle sx={{ bgcolor: 'error.dark', color: 'white' }}>
            Подтверждение удаления учетной записи
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}
              <Typography variant="body1">
                Вы действительно хотите удалить учетную запись пользователя?
              </Typography>
              {userData && (
                <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                  <Box sx={{ 
                    bgcolor: '#731c24', // Тёмно-красный фон
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60,
                      bgcolor: (theme) => {
                        switch (userData.role) {
                          case 'owner': return theme.palette.error.main;
                          case 'admin': return theme.palette.primary.main;
                          case 'tech_admin': return theme.palette.info.main;
                          case 'user': return theme.palette.success.main;
                          default: return theme.palette.grey[500];
                        }
                      },
                      fontSize: '1.5rem',
                      fontWeight: 500
                    }}>
                      {userData.full_name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={500}>
                        {userData.full_name}
                      </Typography>
                      <Typography variant="body2">
                        {userData.email}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={getRoleLabel(userData.role)}
                          color={getRoleColor(userData.role)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Компания:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {userData.company_name || `ID: ${userData.company_id}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">ID пользователя:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {userData.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Дата регистрации:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date(userData.created_at).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="error.main" sx={{ 
                      fontWeight: 500, 
                      display: 'block', 
                      mt: 2,
                      p: 1,
                      bgcolor: 'error.lighter',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      Это действие нельзя отменить. Пользователь будет удален окончательно.
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              startIcon={<CancelIcon />} 
              onClick={handleCloseDeleteDialog}
              color="inherit"
            >
              Отмена
            </Button>
            <Button 
              startIcon={<DeleteIcon />} 
              onClick={handleDelete}
              color="error"
              variant="contained"
              sx={{ 
                bgcolor: 'error.dark',
                '&:hover': {
                  bgcolor: 'error.darker',
                }
              }}
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог подтверждения при сохранении изменений пользователя */}
        <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog} maxWidth="md" fullWidth>
          <DialogTitle>Подтверждение сохранения изменений</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}
              <Typography variant="body1">
                Вы действительно хотите сохранить изменения?
              </Typography>
              
              {userData && (
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Было */}
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      flex: 1, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)'
                    }}
                  >
                    <Box sx={{ bgcolor: 'grey.600', p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="white">
                        Было:
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: (theme) => {
                            switch (userData.role) {
                              case 'owner': return theme.palette.error.main;
                              case 'admin': return theme.palette.primary.main;
                              case 'tech_admin': return theme.palette.info.main;
                              case 'user': return theme.palette.success.main;
                              default: return theme.palette.grey[500];
                            }
                          }
                        }}>
                          {userData.full_name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {userData.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {userData.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Роль:</Typography>
                          <Chip 
                            label={getRoleLabel(userData.role)} 
                            color={getRoleColor(userData.role)} 
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        {canEditFullInfo && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Компания:</Typography>
                            <Typography variant="body1">
                              {userData.company_name || `ID: ${userData.company_id}`}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                  
                  {/* Стрелка */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'primary.main',
                    p: 1
                  }}>
                    <Box component="span" sx={{ 
                      transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' },
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      display: 'flex'
                    }}>
                      →
                    </Box>
                  </Box>
                  
                  {/* Станет */}
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      flex: 1, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    <Box sx={{ bgcolor: 'primary.main', p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="white">
                        Станет:
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: (theme) => {
                            const role = editData.role || userData.role;
                            switch (role) {
                              case 'owner': return theme.palette.error.main;
                              case 'admin': return theme.palette.primary.main;
                              case 'tech_admin': return theme.palette.info.main;
                              case 'user': return theme.palette.success.main;
                              default: return theme.palette.grey[500];
                            }
                          }
                        }}>
                          {editData.full_name?.charAt(0)?.toUpperCase() || userData.full_name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="h6" 
                            color={userData.full_name !== editData.full_name ? 'primary.main' : 'text.primary'}
                            fontWeight={userData.full_name !== editData.full_name ? 'bold' : 'normal'}
                          >
                            {editData.full_name}
                          </Typography>
                          {canEditFullInfo && (
                            <Typography 
                              variant="body2" 
                              color={userData.email !== editData.email ? 'primary.main' : 'text.secondary'}
                              fontWeight={userData.email !== editData.email ? 'bold' : 'normal'}
                            >
                              {editData.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {canEditRole && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Роль:</Typography>
                            <Chip 
                              label={getRoleLabel(editData.role || userData.role)} 
                              color={getRoleColor(editData.role || userData.role)} 
                              size="small"
                              sx={{ 
                                mt: 0.5,
                                fontWeight: userData.role !== editData.role ? 'bold' : 'normal',
                                boxShadow: userData.role !== editData.role ? 2 : 0
                              }}
                            />
                          </Box>
                        )}
                        {canEditFullInfo && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Компания:</Typography>
                            <Typography 
                              variant="body1"
                              color={userData.company_id !== editData.company_id ? 'primary.main' : 'text.primary'}
                              fontWeight={userData.company_id !== editData.company_id ? 'bold' : 'normal'}
                            >
                              {selectedCompany?.name || `ID: ${editData.company_id || 'Не выбрана'}`}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
              <Typography variant="caption" color="info.main" sx={{ mt: 1, textAlign: 'center' }}>
                *Синим цветом и жирным шрифтом выделены поля, которые будут изменены
              </Typography>
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

        {/* Добавляем диалог со стикером */}
        <StickerDialog 
          open={openStickerDialog} 
          onClose={() => setOpenStickerDialog(false)}
          message={stickerMessage}
        />
      </Container>
    </PageTransition>
  );
};

export default UserProfile; 