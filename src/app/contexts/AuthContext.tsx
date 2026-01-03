import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useClerk, useSession } from '@clerk/clerk-react';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  clerkOrgRole?: string; // Admin, basic_member, etc from Clerk
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  clerkOrgRole: string | null;
  getToken: (options?: { skipCache?: boolean }) => Promise<string | null>; // NEW: Method to get Clerk JWT token
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Wraps the application and provides authentication context
 * Uses Clerk for authentication and JWT token management
 * 
 * @component
 * @param props - Component props
 * @param props.children - Child components to render
 * @returns React element with auth context provider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const { session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync Clerk user with our local state, including organization role
    if (clerkLoaded) {
      if (clerkUser) {
        const mappedUser: User = {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          name: clerkUser.fullName || clerkUser.username || clerkUser.firstName || 'User',
          avatar: clerkUser.imageUrl,
          clerkOrgRole: null, // Organization role is not available in this context
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [clerkUser, clerkLoaded]);

  const login = async (email: string, password: string) => {
    // Clerk handles login through its components
    // This is kept for compatibility but should redirect to Clerk's sign-in
    logger.info('Use Clerk sign-in component for authentication');
  };

  const loginWithGoogle = async () => {
    // Clerk handles OAuth through its components
    logger.info('Use Clerk OAuth for Google authentication');
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  /**
   * Gets a fresh JWT token for API authentication
   * Uses the "supabase" template configured in Clerk Dashboard
   * @param options - Optional config, use { skipCache: true } for fresh token
   * @returns Promise<string | null> - JWT token or null if not authenticated
   */
  const getToken = async (options?: { skipCache?: boolean }): Promise<string | null> => {
    try {
      if (!session) {
        logger.warn('No active Clerk session - user not authenticated');
        return null;
      }
      
      // Get token from the "supabase" JWT template
      const token = await session.getToken({ template: 'supabase', skipCache: options?.skipCache });
      
      if (!token) {
        logger.error('Failed to get Clerk token from supabase template');
        return null;
      }
      
      return token;
    } catch (error) {
      logger.error('Error getting Clerk token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        loading,
        clerkOrgRole: null, // Organization role is not available in this context
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 * Provides user info, auth state, and token management
 * @returns AuthContextType with user, loading state, and auth functions
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}