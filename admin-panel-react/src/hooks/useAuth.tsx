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

  // Initialize auth state from localStorage and Telegram WebApp
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Auth initialization started');
      
      try {
        // CRITICAL: Check if we're in Telegram WebApp FIRST
        // Even if we have stored tokens, we should re-authenticate via Telegram in TWA
        const savedInitData = localStorage.getItem('telegram_initData');
        const savedUser = localStorage.getItem('telegram_user');
        const isInTelegramWebApp = !!(savedInitData && savedUser) || !!(window as any).Telegram?.WebApp;
        
        console.log('🔍 Initial check:', {
          isInTelegramWebApp: isInTelegramWebApp,
          hasSavedInitData: !!savedInitData,
          hasSavedUser: !!savedUser,
          hasTelegramAPI: !!(window as any).Telegram?.WebApp
        });
        
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        
        console.log('🔍 Stored auth check:', {
          hasStoredUser: !!storedUser,
          hasStoredToken: !!storedToken
        });
        
        // CRITICAL: If tokens were just saved by wrapper page, use them immediately
        // Wrapper page already authenticated and saved tokens, so we don't need to auth again
        if (storedUser && storedToken) {
          console.log('✅ Found stored tokens - using them immediately');
          try {
            const userData = JSON.parse(storedUser);
            
            // CRITICAL: Set user and token immediately without validation
            // Wrapper page just authenticated, so tokens are guaranteed fresh
            setUser(userData);
            setToken(storedToken);
            console.log('✅ User authenticated with tokens from wrapper page');
            
            // Validate token in background (non-blocking)
            // This doesn't block the UI, but helps verify token is still valid
            setTimeout(async () => {
              try {
                await apiClient.getDashboardStats();
                console.log('✅ Token validation successful (background)');
              } catch (error: any) {
                console.log('⚠️ Token validation failed (background):', error.message);
                // Don't clear tokens on background validation failure
                // User is already logged in, validation can fail due to network issues
              }
            }, 100);
            
            // Don't proceed to Telegram auth - we already have valid tokens
            setIsLoading(false);
            return; // Exit early - user is authenticated
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            // Continue to Telegram auth below
          }
        }
        
        // Telegram WebApp auto-login (only if no stored tokens)
        // If tokens exist, they were saved by wrapper page and we should use them
        if (!storedUser || !storedToken) {
          console.log('⚠️ No stored auth data - attempting Telegram WebApp auto-login');
          
          // CRITICAL: Check localStorage FIRST (saved by wrapper page)
          const savedInitData = localStorage.getItem('telegram_initData');
          const savedUser = localStorage.getItem('telegram_user');
          
          console.log('🔍 Checking localStorage for Telegram data:', {
            hasSavedInitData: !!savedInitData,
            hasSavedUser: !!savedUser,
            savedInitDataLength: savedInitData?.length || 0
          });
          
          // CRITICAL: Wait for Telegram WebApp API to fully load
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try multiple times to get Telegram WebApp API
          let tg = (window as any).Telegram?.WebApp;
          let attempts = 0;
          const maxAttempts = 10; // Increased attempts
          
          while (!tg && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            tg = (window as any).Telegram?.WebApp;
            attempts++;
            console.log(`🔍 Attempt ${attempts}/${maxAttempts} to get Telegram WebApp API...`);
          }
          
          let telegramLoginSuccess = false;
          
          console.log('🔍 Checking Telegram WebApp:', {
            hasTelegram: !!(window as any).Telegram,
            hasWebApp: !!tg,
            hasInitData: !!tg?.initData,
            hasUser: !!tg?.initDataUnsafe?.user,
            platform: tg?.platform,
            version: tg?.version,
            attempts: attempts,
            savedInitDataInLocalStorage: !!savedInitData
          });
          
          if (tg) {
            try {
              // Initialize WebApp if not already done
              if (tg.ready) {
                tg.ready();
                console.log('✅ Telegram WebApp ready() called');
              }
              if (tg.expand) {
                tg.expand();
                console.log('✅ Telegram WebApp expand() called');
              }
              
              // Wait a bit more for initData to be available
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Try to get initData from Telegram WebApp API first
              let initData = tg.initData;
              let telegramUser = tg.initDataUnsafe?.user;
              
              // FALLBACK: If initData not available from API, try localStorage (saved by wrapper)
              if (!initData) {
                console.log('⚠️ initData not in Telegram API, checking localStorage...');
                const savedInitData = localStorage.getItem('telegram_initData');
                const savedUser = localStorage.getItem('telegram_user');
                
                if (savedInitData) {
                  initData = savedInitData;
                  console.log('✅ Found initData in localStorage');
                }
                
                if (savedUser) {
                  try {
                    telegramUser = JSON.parse(savedUser);
                    console.log('✅ Found telegram user in localStorage');
                  } catch (e) {
                    console.error('❌ Failed to parse saved telegram user:', e);
                  }
                }
              }
              
              console.log('🔐 Telegram WebApp data:', {
                hasInitData: !!initData,
                initDataLength: initData?.length || 0,
                initDataPreview: initData ? initData.substring(0, 50) + '...' : null,
                hasUser: !!telegramUser,
                userId: telegramUser?.id,
                username: telegramUser?.username,
                firstName: telegramUser?.first_name
              });
              
              // If we have initData OR saved data, try to login
              if (initData && telegramUser) {
                console.log('🔐 Attempting Telegram WebApp auto-login...');
                console.log('🔐 Sending request to /auth/telegram-login with:', {
                  telegramId: telegramUser.id,
                  username: telegramUser.username,
                  firstName: telegramUser.first_name,
                  hasInitData: !!initData,
                  initDataSource: tg.initData ? 'Telegram API' : 'localStorage'
                });
                
                try {
                  const response = await apiClient.telegramLogin(initData, telegramUser);
                  console.log('✅ Telegram login response received:', {
                    userId: response.user.id,
                    email: response.user.email,
                    role: response.user.role
                  });
                  setUser(response.user);
                  setToken(response.accessToken);
                  toast.success('Авторизация через Telegram успешна');
                  console.log('✅ Telegram WebApp auto-login successful');
                  telegramLoginSuccess = true;
                  
                  // Clean up saved data after successful login
                  localStorage.removeItem('telegram_initData');
                  localStorage.removeItem('telegram_user');
                } catch (telegramLoginError: any) {
                  console.error('❌ Telegram auto-login failed:', {
                    message: telegramLoginError.message,
                    status: telegramLoginError.response?.status,
                    data: telegramLoginError.response?.data,
                    error: telegramLoginError
                  });
                  // If Telegram login fails, user will see login page
                  // This is expected if user is not linked to an admin account
                }
              } else if (savedInitData && savedUser) {
                // We have saved data but Telegram API not available - use saved data
                console.log('🔐 Using saved Telegram data from localStorage for auto-login...');
                try {
                  const parsedUser = JSON.parse(savedUser);
                  console.log('🔐 Sending request to /auth/telegram-login with saved data:', {
                    telegramId: parsedUser.id,
                    username: parsedUser.username,
                    hasInitData: !!savedInitData
                  });
                  
                  const response = await apiClient.telegramLogin(savedInitData, parsedUser);
                  console.log('✅ Telegram login response received:', {
                    userId: response.user.id,
                    email: response.user.email,
                    role: response.user.role
                  });
                  setUser(response.user);
                  setToken(response.accessToken);
                  toast.success('Авторизация через Telegram успешна');
                  console.log('✅ Telegram WebApp auto-login successful (using saved data)');
                  telegramLoginSuccess = true;
                  
                  // Clean up saved data after successful login
                  localStorage.removeItem('telegram_initData');
                  localStorage.removeItem('telegram_user');
                } catch (telegramLoginError: any) {
                  console.error('❌ Telegram auto-login failed (saved data):', {
                    message: telegramLoginError.message,
                    status: telegramLoginError.response?.status,
                    data: telegramLoginError.response?.data,
                    error: telegramLoginError
                  });
                }
              } else {
                console.warn('⚠️ Telegram WebApp data incomplete:', {
                  hasInitData: !!initData,
                  hasUser: !!telegramUser,
                  hasSavedInitData: !!savedInitData,
                  hasSavedUser: !!savedUser,
                  initDataValue: initData,
                  userValue: telegramUser
                });
              }
            } catch (error) {
              console.error('❌ Telegram WebApp initialization error:', error);
            }
          } else {
            console.warn('⚠️ Telegram WebApp not available after', maxAttempts, 'attempts');
            
            // CRITICAL: If we have saved data but Telegram API not available, try using saved data
            if (savedInitData && savedUser && !telegramLoginSuccess) {
              console.log('🔐 Telegram API not available, but we have saved data - trying auto-login with saved data...');
              try {
                const parsedUser = JSON.parse(savedUser);
                console.log('🔐 Sending request to /auth/telegram-login with saved data:', {
                  telegramId: parsedUser.id,
                  username: parsedUser.username,
                  hasInitData: !!savedInitData
                });
                
                const response = await apiClient.telegramLogin(savedInitData, parsedUser);
                console.log('✅ Telegram login response received:', {
                  userId: response.user.id,
                  email: response.user.email,
                  role: response.user.role
                });
                setUser(response.user);
                setToken(response.accessToken);
                toast.success('Авторизация через Telegram успешна');
                console.log('✅ Telegram WebApp auto-login successful (using saved data, no API)');
                telegramLoginSuccess = true;
                
                // Clean up saved data after successful login
                localStorage.removeItem('telegram_initData');
                localStorage.removeItem('telegram_user');
              } catch (telegramLoginError: any) {
                console.error('❌ Telegram auto-login failed (saved data, no API):', {
                  message: telegramLoginError.message,
                  status: telegramLoginError.response?.status,
                  data: telegramLoginError.response?.data,
                  error: telegramLoginError
                });
              }
            } else {
              console.warn('⚠️ Window.Telegram:', (window as any).Telegram);
            }
          }
          
          // If no Telegram auth or it failed, user is not authenticated
          if (!telegramLoginSuccess) {
            console.log('⚠️ No Telegram auto-login, user will see login page');
            setUser(null);
            setToken(null);
          }
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
