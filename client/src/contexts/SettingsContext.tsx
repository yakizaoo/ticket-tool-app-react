import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../config/axios';
import { useAuth } from './AuthContext';
import { useTheme as useCustomTheme } from './ThemeContext';

// Типы для настроек
interface UserSettings {
  id?: number;
  user_id?: number;
  theme: 'light' | 'dark';
  notifications: boolean;
  language: 'ru' | 'en';
  showParticles: boolean;
  autoCollapseNavbar: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateTheme: (theme: 'light' | 'dark') => Promise<void>;
  updateNotifications: (enabled: boolean) => Promise<void>;
  updateLanguage: (language: 'ru' | 'en') => Promise<void>;
  updateShowParticles: (show: boolean) => Promise<void>;
  updateAutoCollapseNavbar: (enabled: boolean) => Promise<void>;
}

// Начальные значения по умолчанию
const defaultSettings: UserSettings = {
  theme: 'light',
  notifications: true,
  language: 'ru',
  showParticles: false,
  autoCollapseNavbar: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toggleTheme: toggleThemeContext, mode } = useCustomTheme();

  // Загрузка настроек пользователя при входе в систему
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setSettings(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/settings');
        
        // Преобразуем данные, чтобы гарантировать правильные типы
        const settingsData = {
          ...response.data,
          showParticles: Boolean(response.data.show_particles),
          autoCollapseNavbar: Boolean(response.data.auto_collapse_navbar),
          theme: response.data.theme || 'light',
          notifications: Boolean(response.data.notifications),
          language: response.data.language || 'ru'
        };
        
        console.log('Fetched settings from server:', response.data);
        console.log('Processed settings for frontend:', settingsData);
        
        setSettings(settingsData);
        
        // Синхронизируем тему с ThemeContext
        if (settingsData.theme && settingsData.theme !== mode) {
          toggleThemeContext();
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user settings:', err);
        setError('Не удалось загрузить настройки');
        // Используем настройки по умолчанию
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, toggleThemeContext, mode]);

  // Обновление всех настроек
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axiosInstance.put('/api/settings', newSettings);
      setSettings(response.data);
      
      // Если изменилась тема, синхронизируем с ThemeContext
      if (newSettings.theme && newSettings.theme !== mode) {
        toggleThemeContext();
      }
      
      setError(null);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Не удалось обновить настройки');
    } finally {
      setLoading(false);
    }
  };

  // Обновление темы
  const updateTheme = async (theme: 'light' | 'dark') => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axiosInstance.patch('/api/settings/theme', { theme });
      setSettings(response.data);
      
      // Синхронизируем с ThemeContext если тема отличается
      if (theme !== mode) {
        toggleThemeContext();
      }
      
      setError(null);
    } catch (err) {
      console.error('Error updating theme:', err);
      setError('Не удалось обновить тему');
    } finally {
      setLoading(false);
    }
  };

  // Обновление уведомлений
  const updateNotifications = async (notifications: boolean) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axiosInstance.patch('/api/settings/notifications', { notifications });
      setSettings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error updating notifications:', err);
      setError('Не удалось обновить настройки уведомлений');
    } finally {
      setLoading(false);
    }
  };

  // Обновление языка
  const updateLanguage = async (language: 'ru' | 'en') => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axiosInstance.patch('/api/settings/language', { language });
      setSettings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error updating language:', err);
      setError('Не удалось обновить язык');
    } finally {
      setLoading(false);
    }
  };

  // Обновление настройки частиц
  const updateShowParticles = async (showParticles: boolean) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Немедленно обновляем локальное состояние для лучшего UX
      if (settings) {
        const updatedSettings = { ...settings, showParticles };
        console.log('Immediately updating particles settings to:', updatedSettings);
        setSettings(updatedSettings);
      }
      
      // Отправляем запрос на сервер
      console.log('Sending particles update to server:', { showParticles });
      const response = await axiosInstance.patch('/api/settings/particles', { showParticles });
      console.log('Server response for particles update:', response.data);
      
      // Обновляем локальное состояние данными с сервера
      const updatedSettings = {
        ...response.data,
        showParticles: Boolean(response.data.show_particles || showParticles)
      };
      console.log('Final settings after server response:', updatedSettings);
      setSettings(updatedSettings);
      
      setError(null);
    } catch (err) {
      console.error('Error updating particles setting:', err);
      setError('Не удалось обновить настройки анимации');
      // Настройка уже обновлена выше, поэтому не нужно дублировать здесь
    } finally {
      setLoading(false);
    }
  };

  // Обновление настройки автосворачивания меню
  const updateAutoCollapseNavbar = async (autoCollapseNavbar: boolean) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Немедленно обновляем локальное состояние для лучшего UX
      if (settings) {
        const updatedSettings = { ...settings, autoCollapseNavbar };
        console.log('Immediately updating navbar settings to:', updatedSettings);
        setSettings(updatedSettings);
      }
      
      // Отправляем запрос на сервер
      console.log('Sending navbar update to server:', { autoCollapseNavbar });
      const response = await axiosInstance.patch('/api/settings/navbar', { autoCollapseNavbar });
      console.log('Server response for navbar update:', response.data);
      
      // Обновляем локальное состояние данными с сервера
      const updatedSettings = {
        ...response.data,
        autoCollapseNavbar: Boolean(response.data.auto_collapse_navbar || autoCollapseNavbar)
      };
      console.log('Final settings after server response:', updatedSettings);
      setSettings(updatedSettings);
      
      setError(null);
    } catch (err) {
      console.error('Error updating navbar setting:', err);
      setError('Не удалось обновить настройки навигации');
      // Настройка уже обновлена выше, поэтому не нужно дублировать здесь
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings,
        updateTheme,
        updateNotifications,
        updateLanguage,
        updateShowParticles,
        updateAutoCollapseNavbar
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Хук для использования контекста настроек
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 