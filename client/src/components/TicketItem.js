import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    Divider,
} from '@mui/material';

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

const TicketItem = ({ ticket }) => {
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {ticket.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {ticket.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                        label={getCategoryLabel(ticket.category)}
                        color="primary"
                        size="small"
                    />
                    <Chip 
                        label={ticket.urgency.toUpperCase()}
                        color={getUrgencyColor(ticket.urgency)}
                        size="small"
                    />
                    {ticket.assigned_role && (
                        <Chip 
                            label={`Роль: ${ticket.assigned_role}`}
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Компания:
                        </Typography>
                        <Typography variant="body2">
                            {ticket.company_name || `ID: ${ticket.company_id}`}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Создал:
                        </Typography>
                        <Typography variant="body2">
                            {ticket.creator_name || ticket.creator_email || `ID: ${ticket.created_by}`}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TicketItem;