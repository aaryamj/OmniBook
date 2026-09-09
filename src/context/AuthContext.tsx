import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { applyTheme } from '../utils/themeUtils';
import { setAndBroadcastOrgType } from '../utils/organizationTerms';

export interface AuthUser {
  id?: number;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  profilePicture?: string | null;
  organizationName?: string | null;
  organizationType?: string | null;
  organizationLogo?: string | null;
  primaryAccentColor?: string | null;
  tenantId?: number | null;
  tenantRoleName?: string | null;
  accessScope?: string | null;
  privilegeLevel?: string | null;
  permissionsJson?: string | null;
  twoStepEnabled?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, initialUserData?: Partial<AuthUser>) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8080';

// Specific session keys to remove on logout without wiping user UI theme or system preferences
const AUTH_STORAGE_KEYS = [
  'token',
  'role',
  'fullName',
  'profilePicture',
  'phone',
  'organizationName',
  'organizationType',
  'tenantRoleName',
  'permissionsJson',
  'accessScope',
  'privilegeLevel',
  'adminFullName',
  'superAdminFullName',
  'superAdminProfilePicture',
  'userId',
  'providerId'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Syncs branding, accent colors, and organization terms when user identity updates
  const applyUserBranding = useCallback((userData: AuthUser) => {
    if (userData.primaryAccentColor) {
      applyTheme(userData.primaryAccentColor);
      localStorage.setItem('primaryAccentColor', userData.primaryAccentColor);
    }
    if (userData.organizationType) {
      setAndBroadcastOrgType(userData.organizationType);
      localStorage.setItem('organizationType', userData.organizationType);
    }
    if (userData.organizationName) {
      localStorage.setItem('organizationName', userData.organizationName);
    }
    if (userData.tenantRoleName) {
      localStorage.setItem('tenantRoleName', userData.tenantRoleName);
    }
    if (userData.permissionsJson) {
      localStorage.setItem('permissionsJson', userData.permissionsJson);
    }
  }, []);

  // Fetch the latest authenticated user information freshly from backend
  const fetchCurrentUser = useCallback(async (authToken: string): Promise<AuthUser | null> => {
    try {
      const response = await axios.get<AuthUser>(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.data && response.data.email) {
        const fetchedUser = response.data;
        setUser(fetchedUser);

        // Keep localStorage synchronised for legacy components during transition
        localStorage.setItem('fullName', fetchedUser.fullName);
        localStorage.setItem('role', fetchedUser.role);
        if (fetchedUser.profilePicture) {
          localStorage.setItem('profilePicture', fetchedUser.profilePicture);
        } else {
          localStorage.removeItem('profilePicture');
        }

        applyUserBranding(fetchedUser);
        return fetchedUser;
      }
      return null;
    } catch (err: any) {
      console.warn('AuthContext: Failed to fetch current user profile:', err?.response?.status || err.message);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        // Token expired or invalid
        AUTH_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
        setToken(null);
        setUser(null);
      }
      return null;
    }
  }, [applyUserBranding]);

  // Initial hydration on application load or page refresh
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        await fetchCurrentUser(savedToken);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  // Synchronize authenticated user state when profile is updated from anywhere in the app
  useEffect(() => {
    const handleProfileUpdate = async (e: any) => {
      if (e?.detail) {
        setUser(prev => prev ? {
          ...prev,
          fullName: e.detail.fullName ?? prev.fullName,
          profilePicture: e.detail.profilePicture !== undefined ? e.detail.profilePicture : prev.profilePicture
        } : prev);
      }
      const savedToken = token || localStorage.getItem('token');
      if (savedToken) {
        await fetchCurrentUser(savedToken);
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, [token, fetchCurrentUser]);

  // Called after successful login or 2FA verification
  const login = useCallback(async (newToken: string, initialUserData?: Partial<AuthUser>): Promise<AuthUser | null> => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    if (initialUserData && initialUserData.fullName) {
      // Optimistic temporary state
      setUser(prev => ({
        email: initialUserData.email || '',
        fullName: initialUserData.fullName || '',
        role: initialUserData.role || 'user',
        ...initialUserData
      } as AuthUser));
    }

    const fetched = await fetchCurrentUser(newToken);
    return fetched;
  }, [fetchCurrentUser]);

  // Safe logout: invalidates backend session and clears only auth keys, preserving UI themes and preferences
  const logout = useCallback(async () => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      try {
        await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
      } catch (e) {
        // Ignore network errors during logout
      }
    }

    // Clean only authentication session keys
    AUTH_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    setToken(null);
    setUser(null);

    // Notify any external listeners
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: null }));
  }, [token]);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return null;
    return await fetchCurrentUser(currentToken);
  }, [token, fetchCurrentUser]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
