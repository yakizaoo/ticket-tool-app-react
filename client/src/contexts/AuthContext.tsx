import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company_id: number;
  company_name?: string;
  is_active: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // При загрузке приложения проверяем наличие пользователя в localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('AuthContext: Checking stored data:', { storedUser, storedToken });
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthContext: Setting user:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    if (!userData || !token) {
      console.error('Invalid login data:', { userData, token });
      return;
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: User) => {
    if (!userData) {
      console.error('Invalid user data for update');
      return;
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 