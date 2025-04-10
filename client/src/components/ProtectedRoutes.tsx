import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import Dashboard from '../pages/Dashboard';
import Tickets from '../pages/Tickets';
import EditTicket from '../pages/EditTicket';
import CreateTicket from '../pages/CreateTicket';
import Profile from '../pages/Profile';
import Users from '../pages/Users';
import UserProfile from '../pages/UserProfile';
import CompanyProfile from '../pages/CompanyProfile';
import Companies from '../pages/Companies';
import CompanyUsers from '../pages/CompanyUsers';
import Settings from '../pages/Settings';

const ProtectedRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<EditTicket />} />
        <Route path="/tickets/create" element={<CreateTicket />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />
        {user.role === 'owner' && (
          <Route path="/companies" element={<Companies />} />
        )}
        <Route path="/company-users" element={<CompanyUsers />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/cards" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default ProtectedRoutes; 