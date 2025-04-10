export interface User {
  id: number;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'user' | 'tech_admin';
  company_id: number;
  created_at: string;
  updated_at: string;
} 