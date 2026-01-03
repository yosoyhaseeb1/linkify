import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider, useOrganizationContext } from './contexts/OrganizationContext';
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { DashboardLayout } from './components/DashboardLayout';
import { SessionTimeoutModal } from './components/SessionTimeoutModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PageLoader } from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { useState, useEffect, lazy, Suspense } from 'react';
import { clerkPublishableKey } from '../../utils/clerk/info';
import { logger } from './utils/logger';
import { logEnvironmentInfo, validateEnvironment } from './utils/environment';
import { initConsoleFilters } from './utils/consoleFilter';

// Initialize console filters early to suppress known warnings
initConsoleFilters();

// App version: 2.0.1
// Production-ready lazy loading for optimal performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })).catch(() => ({ default: () => <PageLoader /> })));
const Runs = lazy(() => import('./pages/Runs').then(m => ({ default: m.Runs })).catch(() => ({ default: () => <PageLoader /> })));
const RunDetail = lazy(() => import('./pages/RunDetail').then(m => ({ default: m.RunDetail })).catch(() => ({ default: () => <PageLoader /> })));
const NewRun = lazy(() => import('./pages/NewRun').then(m => ({ default: m.NewRun })).catch(() => ({ default: () => <PageLoader /> })));
const Pipeline = lazy(() => import('./pages/Pipeline').then(m => ({ default: m.Pipeline })).catch(() => ({ default: () => <PageLoader /> })));
const Contacts = lazy(() => import('./pages/Contacts').then(m => ({ default: m.Contacts })).catch(() => ({ default: () => <PageLoader /> })));
const Tasks = lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })).catch(() => ({ default: () => <PageLoader /> })));
const Jobs = lazy(() => import('./pages/Jobs').then(m => ({ default: m.Jobs })).catch(() => ({ default: () => <PageLoader /> })));
const JobDetail = lazy(() => import('./pages/JobDetail').then(m => ({ default: m.JobDetail })).catch(() => ({ default: () => <PageLoader /> })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })).catch(() => ({ default: () => <PageLoader /> })));
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })).catch(() => ({ default: () => <PageLoader /> })));
const TeamPerformance = lazy(() => import('./pages/TeamPerformance').then(m => ({ default: m.TeamPerformance })).catch(() => ({ default: () => <PageLoader /> })));
const DailyStandup = lazy(() => import('./pages/DailyStandup').then(m => ({ default: m.DailyStandup })).catch(() => ({ default: () => <PageLoader /> })));
const Blacklist = lazy(() => import('./pages/Blacklist').then(m => ({ default: m.Blacklist })).catch(() => ({ default: () => <PageLoader /> })));
const TargetAccounts = lazy(() => import('./pages/TargetAccounts').then(m => ({ default: m.TargetAccounts })).catch(() => ({ default: () => <PageLoader /> })));
const Integrations = lazy(() => import('./pages/Integrations').then(m => ({ default: m.Integrations })).catch(() => ({ default: () => <PageLoader /> })));
const Team = lazy(() => import('./pages/Team').then(m => ({ default: m.Team })).catch(() => ({ default: () => <PageLoader /> })));
const Billing = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })).catch(() => ({ default: () => <PageLoader /> })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })).catch(() => ({ default: () => <PageLoader /> })));
const Help = lazy(() => import('./pages/Help').then(m => ({ default: m.Help })).catch(() => ({ default: () => <PageLoader /> })));

/**
 * Chrome Extension Auth Handler Component
 * Handles authentication callbacks from Chrome Extension
 */
function ExtensionAuthHandler() {
  const { user, isAuthenticated, getToken } = useAuth();
  const { currentOrg } = useOrganizationContext();

  useEffect(() => {
    // Check if this is an extension auth request
    const urlParams = new URLSearchParams(window.location.search);
    const isExtensionAuth = urlParams.get('extension_auth') === 'true';
    
    if (isExtensionAuth && user && isAuthenticated) {
      // Get token and send to extension
      getToken().then(token => {
        if (token && (window as any).chrome?.runtime?.sendMessage) {
          // Send auth data to extension
          (window as any).chrome.runtime.sendMessage(
            // Extension ID - will work for unpacked extension
            undefined,
            {
              action: 'auth_success',
              token: token,
              user: {
                id: user.id,
                name: user.fullName || user.firstName || 'User',
                email: user.primaryEmailAddress?.emailAddress
              },
              org: currentOrg ? {
                id: currentOrg.id,
                name: currentOrg.name
              } : null
            }
          );
          
          // Show success message
          console.log('✅ Extension authenticated!');
          
          // Close this tab after a delay (extension will have the token)
          setTimeout(() => {
            window.close();
          }, 2000);
        }
      }).catch(err => {
        console.error('❌ Extension auth error:', err);
      });
    }
  }, [user, isAuthenticated, getToken, currentOrg]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/sign-up" element={isAuthenticated ? <Navigate to="/" replace /> : <SignUp />} />
        {/* Clerk SSO callback routes */}
        <Route path="/login/sso-callback" element={<Navigate to="/" replace />} />
        <Route path="/sign-up/sso-callback" element={<Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="runs" element={<Runs />} />
          <Route path="runs/new" element={<NewRun />} />
          <Route path="runs/:id" element={<RunDetail />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="messages" element={<Messages />} />
          <Route path="team-performance" element={<TeamPerformance />} />
          <Route path="daily-standup" element={<DailyStandup />} />
          <Route path="blacklist" element={<Blacklist />} />
          <Route path="target-accounts" element={<TargetAccounts />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="team" element={<Team />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get Clerk publishable key from centralized config
  const PUBLISHABLE_KEY = clerkPublishableKey;

  // Validate environment and log info (development only)
  useEffect(() => {
    validateEnvironment();
    logEnvironmentInfo();
  }, []);

  // Debug logging
  logger.debug('Clerk Key Available:', !!PUBLISHABLE_KEY);
  if (PUBLISHABLE_KEY) {
    logger.debug('Clerk Key (first 20 chars):', PUBLISHABLE_KEY.substring(0, 20) + '...');
  }

  // If no Clerk key is provided, show setup instructions
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass-card p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Lynqio
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Clerk Setup Required
            </p>
          </div>

          <div className="space-y-4 text-foreground">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="font-semibold mb-2">⚠️ Missing Clerk Publishable Key</p>
              <p className="text-sm text-muted-foreground">
                The VITE_CLERK_PUBLISHABLE_KEY environment variable is not loaded.
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
              <p className="font-semibold mb-2">🔄 Just Provided the Key?</p>
              <p className="text-sm text-muted-foreground mb-2">
                Environment variables in Figma Make require a page refresh to load:
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full mt-2 px-4 py-3 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors"
              >
                🔄 Refresh Page to Load Key
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">First Time Setup:</h3>
              
              <div className="space-y-2">
                <p className="font-medium">1. Create a Clerk Account</p>
                <p className="text-sm text-muted-foreground ml-4">
                  Go to <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">clerk.com</a> and sign up for free
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">2. Get Your Publishable Key</p>
                <p className="text-sm text-muted-foreground ml-4">
                  • Go to <a href="https://dashboard.clerk.com/last-active?path=api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Clerk Dashboard → API Keys</a>
                </p>
                <p className="text-sm text-muted-foreground ml-4">
                  • Copy your Publishable Key (starts with pk_test_ or pk_live_)
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">3. Add Key via Figma Make Modal</p>
                <p className="text-sm text-muted-foreground ml-4">
                  A modal should appear asking for VITE_CLERK_PUBLISHABLE_KEY
                </p>
                <p className="text-sm text-muted-foreground ml-4">
                  If you don't see it, check the Figma Make settings panel
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">4. Enable Authentication</p>
                <p className="text-sm text-muted-foreground ml-4">
                  In Clerk Dashboard → User & Authentication:
                </p>
                <p className="text-sm text-muted-foreground ml-4">
                  ✓ Enable "Email address" and "Password"
                </p>
                <p className="text-sm text-muted-foreground ml-4">
                  ✓ (Optional) Enable Google, GitHub, etc.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">5. Refresh This Page</p>
                <p className="text-sm text-muted-foreground ml-4">
                  After providing the key, refresh this page to load it
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for global search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Ctrl+Shift+T to trigger session timeout (testing only)
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setSessionTimeout(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Session timeout after 30 minutes of inactivity (1800000ms)
    // For testing: Change to 60000 (1 minute) to see the modal quickly
    const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
    
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSessionTimeout(true);
      }, SESSION_DURATION);
    };

    // Initialize timer
    resetTimer();

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!sessionTimeout) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [sessionTimeout]);

  return (
    <BrowserRouter>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        afterSignOutUrl="/"
        telemetry={false}
        navigate={(to) => window.location.href = to}
        appearance={{
          // Suppress development mode warnings in console and UI
          layout: {
            unsafe_disableDevelopmentModeWarnings: true,
          },
        }}
      >
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <OrganizationProvider>
                <FeatureFlagsProvider>
                  <ErrorBoundary>
                    {/* Chrome Extension Auth Handler */}
                    <ExtensionAuthHandler />
                    
                    {/* Skip to main content for keyboard navigation */}
                    <a href="#main-content" className="skip-link">
                      Skip to main content
                    </a>
                    
                    <AppRoutes />
                    <Toaster position="top-right" richColors />
                    <SessionTimeoutModal 
                      isOpen={sessionTimeout} 
                      onClose={() => setSessionTimeout(false)} 
                    />
                    <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                  </ErrorBoundary>
                </FeatureFlagsProvider>
              </OrganizationProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </ClerkProvider>
    </BrowserRouter>
  );
}