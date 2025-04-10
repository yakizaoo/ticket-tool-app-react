import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Animation as AnimationIcon,
  MenuOpen as MenuOpenIcon
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';

const Settings = () => {
  const { settings, loading, error, updateTheme, updateNotifications, updateLanguage, updateShowParticles, updateAutoCollapseNavbar } = useSettings();

  console.log('Settings component rendering with showParticles:', settings?.showParticles);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !settings) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h5" sx={{ mb: 3 }}>
        Настройки
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <DarkModeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Тёмная тема" 
              secondary="Переключить между светлой и тёмной темой"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings?.theme === 'dark'}
                onChange={() => updateTheme(settings?.theme === 'light' ? 'dark' : 'light')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Уведомления" 
              secondary="Управление push-уведомлениями"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings?.notifications}
                onChange={() => updateNotifications(!settings?.notifications)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Язык" 
              secondary={settings?.language === 'ru' ? 'Русский' : 'English'}
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings?.language === 'en'}
                onChange={() => updateLanguage(settings?.language === 'ru' ? 'en' : 'ru')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemIcon>
              <AnimationIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Анимированный фон" 
              secondary="Отображение анимации частиц на фоне"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings?.showParticles}
                onChange={() => updateShowParticles(!settings?.showParticles)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemIcon>
              <MenuOpenIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Автосворачивание меню" 
              secondary="Боковое меню будет автоматически сворачиваться и разворачиваться при наведении"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings?.autoCollapseNavbar}
                onChange={() => updateAutoCollapseNavbar(!settings?.autoCollapseNavbar)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default Settings; 