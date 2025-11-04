import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient, User, AuthResponse } from '../services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedUser && storedToken) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(storedToken);
            
            // Verify token is still valid by making a test request with timeout
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 3000)
            );
            
            try {
              await Promise.race([
                apiClient.getDashboardStats(),
                timeoutPromise
              ]);
              // Token is valid
            } catch (error: any) {
              console.log('Token validation failed:', error.message);
              
              // If it's a network error or timeout, don't try to refresh - just keep user logged in
              const isNetworkError = error.message === 'Request timeout' || 
                                    error.message?.includes('Failed to fetch') || 
                                    error.message?.includes('NetworkError');
              
              if (!isNetworkError) {
                // Token is invalid (not network error), try to refresh
                try {
                  const refreshTimeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Refresh timeout')), 3000)
                  );
                  
                  await Promise.race([
                    apiClient.refreshToken(),
                    refreshTimeoutPromise
                  ]);
                  // Token refreshed successfully, keep user logged in
                } catch (refreshError: any) {
                  console.log('Token refresh failed:', refreshError.message);
                  
                  // If refresh also timed out, keep user logged in
                  const isRefreshNetworkError = refreshError.message === 'Refresh timeout' || 
                                                refreshError.message?.includes('Failed to fetch');
                  
                  if (!isRefreshNetworkError) {
                    // Refresh failed for other reasons (invalid token), clear auth state
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setUser(null);
                    setToken(null);
                  }
                  // If network error, keep user logged in
                }
              }
              // If network error during validation, keep user logged in
            }
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // No stored auth data, user is not authenticated
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        // Always set loading to false, even if there were errors
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
      setToken(response.accessToken);
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
      setToken(response.accessToken);
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
    // Clear all authentication data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear API client token
    apiClient.logout();
    
    // Clear user state and token
    setUser(null);
    setToken(null);
    
    toast.info('Logged out successfully');
  };

  const refreshToken = async () => {
    try {
      await apiClient.refreshToken();
      // Update token from localStorage after refresh
      const newToken = localStorage.getItem('accessToken');
      if (newToken) {
        setToken(newToken);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Sync token from localStorage when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('accessToken');
      setToken(storedToken);
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (in case token was updated in same window)
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken !== token) {
        setToken(storedToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
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
