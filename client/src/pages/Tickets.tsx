import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  Container,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  DeleteForever as DeleteForeverIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import PageTransition from '../components/PageTransition';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  category: string;
  urgency: string;
  created_at: string;
  company_name?: string;
  company_id?: number;
  creator_name?: string;
  creator_email?: string;
  created_by?: number;
  company?: {
    name: string;
  };
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&.updating': {
    opacity: 0.7,
    transform: 'scale(0.98)',
  },
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: -12,
  marginLeft: -12,
  zIndex: 1,
}));

const Tickets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [deleteComment, setDeleteComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user?.role]);

  const fetchTickets = async () => {
    try {
      setIsUpdating(true);
      let url = '/api/tickets';
      
      const response = await axios.get(url);
      console.log('Tickets data from server:', response.data);
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Ошибка при загрузке тикетов');
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
  };

  const handlePermanentDeleteClick = (id: number) => {
    setSelectedTicketId(id);
    setPermanentDeleteDialogOpen(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!selectedTicketId) return;

    try {
      await axios.delete(`/api/tickets/${selectedTicketId}/permanent`);

      setTickets(tickets.filter(t => t.id !== selectedTicketId));
      setPermanentDeleteDialogOpen(false);
      setSelectedTicketId(null);
      setSuccess('Тикет успешно удален');
    } catch (error) {
      console.error('Error permanently deleting ticket:', error);
      setError('Ошибка при удалении тикета');
    }
  };

  const handleDeleteCancel = () => {
    setPermanentDeleteDialogOpen(false);
    setDeleteComment('');
    setSelectedTicketId(null);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';      // красный
      case 'in_progress':
        return 'warning';    // оранжевый
      case 'closed':
        return 'success';    // зеленый
      case 'hidden':
        return 'secondary';  // фиолетовый
      default:
        return 'default';    // серый
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getFilteredTickets = () => {
    switch (currentTab) {
      case 0: // Открытые
        return tickets.filter(ticket => ticket.status === 'open');
      case 1: // В работе
        return tickets.filter(ticket => ticket.status === 'in_progress');
      case 2: // Закрытые
        return tickets.filter(ticket => ticket.status === 'closed');
      case 3: // Скрытые
        return tickets.filter(ticket => ticket.status === 'hidden');
      default:
        return tickets;
    }
  };

  const handleStatusClick = (id: number, status: string) => {
    setSelectedTicketId(id);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedTicketId || !statusComment.trim()) return;

    try {
      const response = await axios.patch(`/api/tickets/${selectedTicketId}/status`, {
        status: newStatus,
        comment: statusComment
      });

      const updatedTicket = response.data;
      setTickets(tickets.map(ticket =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
      setStatusDialogOpen(false);
      setStatusComment('');
      setSelectedTicketId(null);
      setNewStatus('');
      setSuccess(`Статус тикета успешно изменен на "${newStatus}"`);
      
      // Обновляем список тикетов после изменения статуса
      await fetchTickets();
    } catch (error) {
      console.error('Error changing ticket status:', error);
      setError('Ошибка при изменении статуса тикета');
    }
  };

  const handleStatusCancel = () => {
    setStatusDialogOpen(false);
    setStatusComment('');
    setSelectedTicketId(null);
    setNewStatus('');
  };

  const handleEdit = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleStatusChange = (id: number, status: string) => {
    handleStatusClick(id, status);
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
      <Container maxWidth="lg">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <PageTransition>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Обновить список">
              <IconButton 
                onClick={fetchTickets} 
                color="primary" 
                disabled={isUpdating}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/tickets/create')}
            >
              Создать тикет
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: (theme) => theme.palette.primary.main,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 100,
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                color: (theme) => theme.palette.primary.main,
              },
              '&.Mui-selected': {
                color: (theme) => theme.palette.primary.main,
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab 
            label={`Открытые (${tickets.filter(t => t.status === 'open').length})`}
            sx={{
              '&.Mui-selected': {
                color: (theme) => theme.palette.error.main,
              },
              '&:hover': {
                color: (theme) => theme.palette.error.main,
              },
            }}
          />
          <Tab 
            label={`В работе (${tickets.filter(t => t.status === 'in_progress').length})`}
            sx={{
              '&.Mui-selected': {
                color: (theme) => theme.palette.warning.main,
              },
              '&:hover': {
                color: (theme) => theme.palette.warning.main,
              },
            }}
          />
          <Tab 
            label={`Закрытые (${tickets.filter(t => t.status === 'closed').length})`}
            sx={{
              '&.Mui-selected': {
                color: (theme) => theme.palette.success.main,
              },
              '&:hover': {
                color: (theme) => theme.palette.success.main,
              },
            }}
          />
          {user?.role === 'owner' && (
            <Tab 
              label={`Скрытые (${tickets.filter(t => t.status === 'hidden').length})`}
              sx={{
                '&.Mui-selected': {
                  color: (theme) => theme.palette.text.secondary,
                },
                '&:hover': {
                  color: (theme) => theme.palette.text.secondary,
                },
              }}
            />
          )}
        </Tabs>

        <Box sx={{ position: 'relative' }}>
          <StyledTableContainer 
            sx={{ width: '100%', overflow: 'hidden' }}
            className={isUpdating ? 'updating' : ''}
          >
            {isUpdating && <StyledCircularProgress size={24} />}
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Компания</TableCell>
                  <TableCell>Создатель</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Срочность</TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTickets().map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {ticket.company_name || `ID: ${ticket.company_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {ticket.company_id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {ticket.creator_name || ticket.creator_email || `ID: ${ticket.created_by}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {ticket.created_by}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.urgency}
                        color={getUrgencyColor(ticket.urgency)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {ticket.status === 'open' && userRole !== 'user' && (
                          <Tooltip title="Взять в работу">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                              color="warning"
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {ticket.status === 'in_progress' && userRole !== 'user' && (
                          <Tooltip title="Вернуть в открытые">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(ticket.id, 'open')}
                              color="error"
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {ticket.status === 'closed' && userRole !== 'user' && (
                          <>
                            <Tooltip title="Вернуть в открытые">
                              <IconButton
                                size="small"
                                onClick={() => handleStatusChange(ticket.id, 'open')}
                                color="error"
                              >
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Вернуть в работу">
                              <IconButton
                                size="small"
                                onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                                color="warning"
                              >
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {(ticket.status === 'in_progress' || ticket.status === 'open') && (
                          <Tooltip title="Закрыть">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(ticket.id, 'closed')}
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(ticket.status === 'open' || ticket.status === 'in_progress' || ticket.status === 'closed') && 
                         (userRole === 'owner' || userRole === 'admin' || userRole === 'tech_admin') && (
                          <Tooltip title="Скрыть">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(ticket.id, 'hidden')}
                              color="default"
                            >
                              <ArchiveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {userRole !== 'user' && (
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(ticket)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {userRole === 'owner' && (
                          <Tooltip title="Удалить навсегда">
                            <IconButton
                              size="small"
                              onClick={() => handlePermanentDeleteClick(ticket.id)}
                              color="error"
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>

        {/* Диалог перманентного удаления тикета */}
        <Dialog
          open={permanentDeleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Удалить тикет навсегда</DialogTitle>
          <DialogContent>
            <Typography color="error" gutterBottom>
              Внимание! Это действие нельзя отменить. Тикет будет полностью удален из базы данных.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Отмена</Button>
            <Button 
              onClick={handlePermanentDeleteConfirm} 
              color="error"
            >
              Удалить навсегда
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог изменения статуса тикета */}
        <Dialog open={statusDialogOpen} onClose={handleStatusCancel}>
          <DialogTitle>
            {newStatus === 'in_progress' ? 'Взять тикет в работу' : 
             newStatus === 'closed' ? 'Закрыть тикет' : 
             newStatus === 'hidden' ? 'Скрыть тикет' : 'Изменить статус тикета'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Комментарий"
              type="text"
              fullWidth
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStatusCancel}>Отмена</Button>
            <Button 
              onClick={handleStatusConfirm} 
              color={
                newStatus === 'in_progress' ? 'warning' : 
                newStatus === 'closed' ? 'success' : 
                newStatus === 'hidden' ? 'inherit' : 'primary'
              }
            >
              {newStatus === 'in_progress' ? 'Взять в работу' : 
               newStatus === 'closed' ? 'Закрыть' : 
               newStatus === 'hidden' ? 'Скрыть' : 'Изменить'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={error ? 'error' : 'success'}>
            {error || success}
          </Alert>
        </Snackbar>
      </Container>
    </PageTransition>
  );
};

export default Tickets; 