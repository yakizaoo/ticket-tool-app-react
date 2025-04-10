import React from 'react';
import { Container, Typography, useTheme } from '@mui/material';
import PageTransition from '../components/PageTransition';

const TicketEdit = () => {
  const theme = useTheme();
  
  return (
    <PageTransition isEditPage={true}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 700,
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
              : 'linear-gradient(45deg, #64b5f6 30%, #90caf9 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Редактирование тикета
        </Typography>

        {/* ... rest of the component ... */}
      </Container>
    </PageTransition>
  );
};

export default TicketEdit; 