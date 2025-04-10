import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoutes from './components/ProtectedRoutes';
import './styles.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <ProtectedRoutes />
                </PrivateRoute>
              }
            />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
