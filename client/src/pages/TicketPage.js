import React, { useState, useEffect } from 'react';
import TicketList from '../components/TicketList';
import { 
    Container, 
    Typography, 
    Box, 
    Paper,
    Grid,
    Chip,
    Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const TicketPage = () => {
    const { user } = useAuth();
    const [companyInfo, setCompanyInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                // Получаем информацию о компании
                const companyResponse = await axios.get(`${API_URL}/api/companies/${user.company_id}`, {
                    headers: { 'user-id': user.id }
                });
                setCompanyInfo(companyResponse.data);

                // Получаем информацию о пользователе
                const userResponse = await axios.get(`${API_URL}/api/users/${user.id}`, {
                    headers: { 'user-id': user.id }
                });
                setUserInfo(userResponse.data);
            } catch (error) {
                console.error('Error fetching info:', error);
            }
        };

        fetchInfo();
    }, [user]);

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>
                                Информация о компании
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6">
                                    {companyInfo?.name || 'Загрузка...'}
                                </Typography>
                                <Chip 
                                    label={`ID: ${user.company_id}`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>
                                Информация о пользователе
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6">
                                    {userInfo?.full_name || 'Загрузка...'}
                                </Typography>
                                <Chip 
                                    label={userInfo?.role || 'Загрузка...'}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Список тикетов
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Здесь отображаются все тикеты, доступные для вашей компании
                    </Typography>
                </Paper>
                <TicketList />
            </Box>
        </Container>
    );
};

export default TicketPage;