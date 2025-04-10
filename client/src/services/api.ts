import axios from '../config/axios';

export const api = {
  // Компании
  getCompanies: () => axios.get('/api/companies'),
  getCompany: (id: string) => axios.get(`/api/companies/${id}`),
  createCompany: (data: { name: string }) => axios.post('/api/companies', data),
  updateCompany: (id: string, data: { name: string }) => axios.put(`/api/companies/${id}`, data),
  deleteCompany: (id: string) => axios.delete(`/api/companies/${id}`),
  getCompanyUsers: (companyId: string) => axios.get(`/api/companies/${companyId}/users`),

  // Пользователи
  getUsers: () => axios.get('/api/users'),
  getUser: (id: string) => axios.get(`/api/users/${id}`),
  createUser: (data: any) => axios.post('/api/users', data),
  updateUser: (id: string, data: any) => axios.put(`/api/users/${id}`, data),
  deleteUser: (id: string) => axios.delete(`/api/users/${id}`),
  updateProfile: (data: any) => axios.put('/api/users/profile', data),

  // Тикеты
  getTickets: () => axios.get('/api/tickets'),
  getTicket: (id: string) => axios.get(`/api/tickets/${id}`),
  createTicket: (data: any) => axios.post('/api/tickets', data),
  updateTicket: (id: string, data: any) => axios.put(`/api/tickets/${id}`, data),
  deleteTicket: (id: string) => axios.delete(`/api/tickets/${id}`),
  updateTicketStatus: (id: string, data: any) => axios.patch(`/api/tickets/${id}/status`, data),
  getTicketHistory: (id: string) => axios.get(`/api/tickets/${id}/history`),
  getTicketComments: (id: string) => axios.get(`/api/tickets/${id}/comments`),
  addTicketComment: (id: string, data: any) => axios.post(`/api/tickets/${id}/comments`, data),
  getTicketStats: () => axios.get('/api/tickets/stats'),
}; 