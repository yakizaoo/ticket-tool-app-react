import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Grid,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  created_at: string;
  updated_at: string;
  company_id: number;
  company_name: string;
  created_by: number;
  creator_email: string;
  creator_name: string;
  updated_by: number;
  updater_email: string;
  updater_name: string;
  assigned_role: string;
  comment: string;
}

interface TicketHistory {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action_type: 'title_change' | 'category_change' | 'urgency_change' | 'role_change' | 'comment_added' | 'status_change';
  old_value?: string;
  new_value?: string;
  comment?: string;
  created_at: string;
}

interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  comment: string;
  created_at: string;
}

const EditTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: '',
    assigned_role: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTicket = async () => {
      try {
        const response = await axios.get(`/api/tickets/${id}`);
        const ticketData = response.data;
        setTicket(ticketData);
        setFormData({
          title: ticketData.title || '',
          description: ticketData.description || '',
          category: ticketData.category || '',
          urgency: ticketData.urgency || '',
          assigned_role: ticketData.assigned_role || '',
        });
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Ошибка при загрузке тикета');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, user, navigate]);

  const fetchHistory = async () => {
    if (!id) return;
    
    setHistoryLoading(true);
    try {
      const response = await axios.get(`/api/tickets/${id}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Ошибка при загрузке истории');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    
    setCommentsLoading(true);
    try {
      const response = await axios.get(`/api/tickets/${id}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Ошибка при загрузке комментариев');
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (historyDialogOpen) {
      fetchHistory();
    }
  }, [historyDialogOpen, id]);

  useEffect(() => {
    if (commentDialogOpen) {
      fetchComments();
    }
  }, [commentDialogOpen, id]);

  const getActionDescription = (action: TicketHistory) => {
    switch (action.action_type) {
      case 'title_change':
        return `Изменен заголовок с "${action.old_value}" на "${action.new_value}"`;
      case 'category_change':
        return `Изменена категория с "${action.old_value}" на "${action.new_value}"`;
      case 'urgency_change':
        return `Изменена срочность с "${action.old_value}" на "${action.new_value}"`;
      case 'role_change':
        return `Изменено назначение с "${action.old_value || 'не назначен'}" на "${action.new_value || 'не назначен'}"`;
      case 'comment_added':
        return `Добавлен комментарий: ${action.new_value}`;
      case 'status_change':
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={action.old_value || ''}
              color={getStatusColor(action.old_value || '')}
              size="small"
            />
            <Typography variant="body2">→</Typography>
            <Chip
              label={action.new_value || ''}
              color={getStatusColor(action.new_value || '')}
              size="small"
            />
            {action.comment && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({action.comment})
              </Typography>
            )}
          </Box>
        );
      default:
        return 'Неизвестное действие';
    }
  };

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
    setSuccess('');

    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    try {
      const response = await axios.put(`/api/tickets/${id}`, {
        ...formData,
        updated_by: user.id,
      });
      setTicket(response.data);
      setSuccess('Тикет успешно обновлен');
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError('Ошибка при обновлении тикета');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    try {
      const response = await axios.post(`/api/tickets/${id}/comments`, {
        comment: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment('');
      setSuccess('Комментарий добавлен');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Ошибка при добавлении комментария');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'success';
      case 'hidden':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleHistoryTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setHistoryTab(newValue);
  };

  const getFilteredHistory = () => {
    if (historyTab === 0) return history;
    
    const actionTypes = [
      'title_change',
      'category_change',
      'urgency_change',
      'role_change',
      'comment_added',
      'status_change'
    ];
    
    return history.filter(item => item.action_type === actionTypes[historyTab - 1]);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box p={3}>
        <Alert severity="error">Тикет не найден</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/tickets')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Редактирование тикета #{ticket.id}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Информационная панель */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Информация о тикете
              </Typography>
              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <BusinessIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Компания: {ticket.company_name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Создатель: {ticket.creator_name || ticket.creator_email}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTimeIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Создан: {new Date(ticket.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {ticket.updated_at && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Обновлен: {new Date(ticket.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {ticket.updater_name && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Обновил: {ticket.updater_name || ticket.updater_email}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={ticket.status}
                  color={getStatusColor(ticket.status)}
                  size="small"
                />
                <Chip
                  label={ticket.urgency}
                  color={getUrgencyColor(ticket.urgency)}
                  size="small"
                />
                <Chip
                  label={ticket.category}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box display="flex" gap={1}>
                <Tooltip title="История изменений">
                  <IconButton onClick={() => setHistoryDialogOpen(true)}>
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Добавить комментарий">
                  <IconButton onClick={() => setCommentDialogOpen(true)}>
                    <CommentIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Форма редактирования */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Редактирование
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Заголовок"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  margin="normal"
                  required
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
                />

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Категория</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleSelectChange}
                        label="Категория"
                        required
                      >
                        <MenuItem value="bug">Ошибка</MenuItem>
                        <MenuItem value="feature">Функционал</MenuItem>
                        <MenuItem value="task">Задача</MenuItem>
                        <MenuItem value="other">Другое</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Срочность</InputLabel>
                      <Select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleSelectChange}
                        label="Срочность"
                        required
                      >
                        <MenuItem value="low">Низкая</MenuItem>
                        <MenuItem value="medium">Средняя</MenuItem>
                        <MenuItem value="high">Высокая</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Назначить на роль</InputLabel>
                      <Select
                        name="assigned_role"
                        value={formData.assigned_role}
                        onChange={handleSelectChange}
                        label="Назначить на роль"
                      >
                        <MenuItem value="admin">Администратор</MenuItem>
                        <MenuItem value="tech_admin">Технический администратор</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог истории */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>История изменений</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={historyTab} onChange={handleHistoryTabChange}>
              <Tab label="Все" />
              <Tab label="Заголовок" />
              <Tab label="Категория" />
              <Tab label="Срочность" />
              <Tab label="Назначение" />
              <Tab label="Комментарии" />
              <Tab label="Статус" />
            </Tabs>
          </Box>
          {historyLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : getFilteredHistory().length > 0 ? (
            <Box>
              {getFilteredHistory().map((item) => (
                <Box key={item.id} mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" component="span">
                      {item.user_name || item.user_email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {getActionDescription(item)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              История изменений пуста
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог комментариев */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Комментарии к тикету #{ticket.id}</DialogTitle>
        <DialogContent>
          <Box sx={{ height: '400px', overflowY: 'auto', mb: 2 }}>
            {commentsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : comments.length > 0 ? (
              <Box>
                {comments.map((comment) => (
                  <Box key={comment.id} mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" component="span">
                        {comment.user_name || comment.user_email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body1">{comment.comment}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Комментариев пока нет
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Новый комментарий"
              multiline
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Отправить
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Кнопка открытия комментариев */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CommentIcon />}
          onClick={() => setCommentDialogOpen(true)}
        >
          Комментарии ({comments.length})
        </Button>
      </Box>

      {/* Отображение текущего комментария */}
      {ticket.comment && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Текущий комментарий:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1">{ticket.comment}</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default EditTicket; 