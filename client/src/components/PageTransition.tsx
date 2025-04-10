import React from 'react';
import { Fade, Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PageTransitionProps {
  children: React.ReactNode;
  isDashboard?: boolean;
  isEditPage?: boolean;
}

const AnimatedContainer = styled(Box)<{
  isDashboard?: boolean;
  isEditPage?: boolean;
}>(({ theme, isDashboard, isEditPage }) => ({
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transform: 'translateY(0)',
  opacity: 1,
  transition: `transform ${isDashboard ? 1500 : isEditPage ? 800 : 300}ms cubic-bezier(0.4, 0, 0.2, 1), 
               opacity ${isDashboard ? 1500 : isEditPage ? 800 : 300}ms cubic-bezier(0.4, 0, 0.2, 1)`,
}));

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isDashboard = false,
  isEditPage = false,
}) => {
  return (
    <Container maxWidth={false} disableGutters sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      bgcolor: 'transparent',
      zIndex: 1
    }}>
      <Fade in timeout={isDashboard ? 1500 : isEditPage ? 800 : 300}>
        <AnimatedContainer isDashboard={isDashboard} isEditPage={isEditPage}>
          {children}
        </AnimatedContainer>
      </Fade>
    </Container>
  );
};

export default PageTransition; 