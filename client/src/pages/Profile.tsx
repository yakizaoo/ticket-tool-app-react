import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Button,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EditProfile from './EditProfile';
import PageTransition from '../components/PageTransition';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <EditProfile onCancel={() => setIsEditing(false)} />;
  }

  return (
    <PageTransition>
      <Container maxWidth="lg">
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Профиль
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
            >
              Редактировать
            </Button>
          </Box>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                    }}
                  >
                    {user?.full_name?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {user?.full_name}
                  </Typography>
                  <Typography color="textSecondary">
                    {user?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Информация о пользователе
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Имя
                      </Typography>
                      <Typography variant="body1">
                        {user?.full_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user?.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Компания
                      </Typography>
                      <Typography variant="body1">
                        {user?.company_name || 'Не указана'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Роль
                      </Typography>
                      <Typography variant="body1">
                        {user?.role || 'Пользователь'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </PageTransition>
  );
};

export default Profile; 