import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  ReactNode,
} from 'react';
import { apiClient } from '@restaurant-monorepo/api-client';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.login({ email, password });

      if (response.success && response.data) {
        const { token: authToken, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Set API client token
        apiClient.setAuthToken(authToken);

        // Update state
        setToken(authToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      setLoading(true);
      const response = await apiClient.register(userData);

      if (response.success && response.data) {
        const { token: authToken, user: userInfo } = response.data;

        // Store in localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user', JSON.stringify(userInfo));

        // Set API client token
        apiClient.setAuthToken(authToken);

        // Update state
        setToken(authToken);
        setUser(userInfo);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint FIRST while token exists
      await apiClient.logout();
    } catch (error) {
      // Ignore logout endpoint errors
      console.warn('Logout endpoint failed:', error);
    }
    
    // Then clear local storage and state
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    // Clear API client auth token
    apiClient.setAuthToken('');
  };

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Set API client token
        apiClient.setAuthToken(storedToken);

        // Verify token is still valid
        try {
          await apiClient.getProfile();
        } catch (error) {
          // Token is invalid, clear storage
          logout();
        }
      }
    } catch (error) {
      // Clear invalid data
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for unauthorized events from API client
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
