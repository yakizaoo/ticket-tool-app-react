import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  People as UsersIcon,
  Business as CompanyIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { styled } from '@mui/material/styles';
import { useSettings } from '../contexts/SettingsContext';
import ParticlesBackground from './ParticlesBackground';

const drawerWidth = 240;
const drawerCollapsedWidth = 70;

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isCollapsed'
})<{ isCollapsed?: boolean }>(({ theme, isCollapsed }) => ({
  width: isCollapsed ? drawerCollapsedWidth : drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  '& .MuiDrawer-paper': {
    width: isCollapsed ? drawerCollapsedWidth : drawerWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    background: theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(18, 18, 18, 0.9)',
    backdropFilter: 'blur(8px)',
    borderRight: `1px solid ${theme.palette.mode === 'light'
      ? 'rgba(0, 0, 0, 0.1)'
      : 'rgba(255, 255, 255, 0.1)'}`,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'light'
      ? 'rgba(33, 150, 243, 0.1)'
      : 'rgba(144, 202, 249, 0.1)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light'
        ? 'rgba(33, 150, 243, 0.2)'
        : 'rgba(144, 202, 249, 0.2)',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
  },
}));

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { mode } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  
  // Состояние для форсированного обновления при изменении настройки частиц
  const [particlesKey, setParticlesKey] = useState(Date.now());
  
  // Обновляем ключ при изменении настройки частиц
  useEffect(() => {
    setParticlesKey(Date.now());
    console.log('Settings changed, particlesKey updated:', settings?.showParticles);
  }, [settings?.showParticles]);

  // Автоматическое сворачивание навбара при изменении настройки
  useEffect(() => {
    if (settings?.autoCollapseNavbar) {
      setIsCollapsed(true);
    }
  }, [settings?.autoCollapseNavbar]);

  // Debug log
  console.log('Layout rendered with showParticles:', settings?.showParticles);
  console.log('Layout rendered with autoCollapseNavbar:', settings?.autoCollapseNavbar);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    // Если включен режим автосворачивания, то игнорируем ручное сворачивание
    if (!settings?.autoCollapseNavbar) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleDrawerMouseEnter = () => {
    if (settings?.autoCollapseNavbar) {
      setIsHovered(true);
    }
  };

  const handleDrawerMouseLeave = () => {
    if (settings?.autoCollapseNavbar) {
      setIsHovered(false);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Определяем актуальное состояние свернутости меню
  const actualCollapsed = settings?.autoCollapseNavbar ? (!isHovered && isCollapsed) : isCollapsed;

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
    { text: 'Тикеты', icon: <TicketIcon />, path: '/tickets' },
    { text: 'Пользователи', icon: <UsersIcon />, path: '/users' },
    ...(user?.role === 'owner' ? [{ text: 'Компании', icon: <CompanyIcon />, path: '/companies' }] : []),
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Профиль', icon: <Avatar sx={{ width: 24, height: 24 }}>{user?.full_name?.[0]?.toUpperCase() || 'U'}</Avatar>, path: '/profile' },
  ];

  const drawer = (
    <div 
      ref={drawerRef}
      onMouseEnter={handleDrawerMouseEnter}
      onMouseLeave={handleDrawerMouseLeave}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        minHeight: '64px !important'
      }}>
        {!actualCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Service Task
          </Typography>
        )}
        {!settings?.autoCollapseNavbar && (
          <IconButton onClick={handleDrawerCollapse}>
            {actualCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={actualCollapsed ? item.text : ""} placement="right">
              <StyledListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  justifyContent: actualCollapsed ? 'center' : 'flex-start',
                  px: actualCollapsed ? 2.5 : 3,
                }}
              >
                <ListItemIcon sx={{ minWidth: actualCollapsed ? 0 : 40, mr: actualCollapsed ? 0 : 2 }}>
                  {item.icon}
                </ListItemIcon>
                {!actualCollapsed && <ListItemText primary={item.text} />}
              </StyledListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {settings?.showParticles && <ParticlesBackground key={particlesKey} />}
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.1)'
            : 'rgba(255, 255, 255, 0.1)'}`,
          color: theme.palette.text.primary,
          zIndex: theme.zIndex.drawer + 1,
          width: { 
            xs: '100%',
            sm: `calc(100% - ${actualCollapsed ? drawerCollapsedWidth : drawerWidth}px)` 
          },
          ml: { 
            xs: 0,
            sm: actualCollapsed ? `${drawerCollapsedWidth}px` : `${drawerWidth}px` 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Service Task'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 2 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              TransitionComponent={Fade}
            >
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                <ListItemIcon>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={user?.full_name || 'Пользователь'} />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Выйти" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <StyledDrawer
        variant="permanent"
        isCollapsed={actualCollapsed}
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {drawer}
      </StyledDrawer>
      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth 
          },
        }}
      >
        {drawer}
      </StyledDrawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%',
            sm: `calc(100% - ${actualCollapsed ? drawerCollapsedWidth : drawerWidth}px)` 
          },
          mt: '64px',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 