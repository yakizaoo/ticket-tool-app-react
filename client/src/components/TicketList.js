import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Alert, 
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const getUrgencyColor = (urgency) => {
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

const getCategoryLabel = (category) => {
    switch (category) {
        case 'bug':
            return 'Ошибка';
        case 'feature':
            return 'Новая функция';
        case 'task':
            return 'Задача';
        default:
            return 'Другое';
    }
};

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/tickets`, {
                    headers: { 'user-id': user.id }
                });
                setTickets(response.data);
            } catch (err) {
                console.error('Error fetching tickets:', err);
                setError('Ошибка при загрузке тикетов');
            }
        };
        fetchTickets();
    }, [user]);

    const handleEdit = (ticketId) => {
        navigate(`/tickets/${ticketId}/edit`);
    };

    const handleDelete = (ticketId) => {
        // TODO: Реализовать удаление
        console.log('Delete ticket:', ticketId);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <TableContainer component={Paper}>
                    <Table>
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
                            {tickets.map((ticket) => (
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
                                            size="small"
                                            color={ticket.status === 'open' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={getCategoryLabel(ticket.category)}
                                            size="small"
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.urgency.toUpperCase()}
                                            size="small"
                                            color={getUrgencyColor(ticket.urgency)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Редактировать">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleEdit(ticket.id)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Удалить">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleDelete(ticket.id)}
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
            </Box>
        </Container>
    );
};

export default TicketList;