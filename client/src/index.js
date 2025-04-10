import React from 'react';
import ReactDOM from 'react-dom/client'; // Измените импорт
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Используйте createRoot
root.render(
    <BrowserRouter>
        <AuthProvider>
            <App />
        </AuthProvider>
    </BrowserRouter>
);