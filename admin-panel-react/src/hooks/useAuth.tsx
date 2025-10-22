import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient, User, AuthResponse } from '../services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, organizationName: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verify token is still valid by making a test request
          try {
            await apiClient.getDashboardStats();
          } catch (error) {
            // Token is invalid, try to refresh
            try {
              await apiClient.refreshToken();
              // Token refreshed successfully, keep user logged in
            } catch (refreshError) {
              // Refresh failed, clear auth state
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token every 5 minutes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await apiClient.refreshToken();
        console.log('Token refreshed automatically');
      } catch (error) {
        console.error('Auto token refresh failed:', error);
        // If refresh fails, logout user
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiClient.login(email, password);
      setUser(response.user);
      toast.success('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    organizationName: string
  ) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiClient.register(email, password, name, organizationName);
      setUser(response.user);
      toast.success('Registration successful');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    toast.info('Logged out successfully');
  };

  const refreshToken = async () => {
    try {
      await apiClient.refreshToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login or show login modal
      // For now, we'll handle this in the component that uses this hook
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}
