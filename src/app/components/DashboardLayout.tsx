import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { UserMenu } from './UserMenu';
import {
  LayoutDashboard,
  Briefcase,
  UserCircle,
  ListTodo,
  MessageSquare,
  Trophy,
  Zap,
  TrendingUp,
  Plug,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Building,
  Contact,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Coffee,
  Shield,
  Target
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ParticleBackgroundSafe } from './ParticleBackgroundSafe';
import { Logo } from './Logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingModal } from './Onboarding/OnboardingModal';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { currentOrg, organizations, switchOrganization } = useOrganization();
  const navigate = useNavigate();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Zap, label: 'Runs', path: '/runs' },
    { icon: TrendingUp, label: 'Pipeline', path: '/pipeline' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: UserCircle, label: 'Contacts', path: '/contacts' },
    { icon: ListTodo, label: 'Tasks', path: '/tasks' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ];

  const teamItems = [
    { icon: Trophy, label: 'Team', path: '/team' },
    { icon: BarChart3, label: 'Performance', path: '/team-performance' },
    { icon: Coffee, label: 'Daily Standup', path: '/daily-standup' },
    { icon: Target, label: 'Target Accounts', path: '/target-accounts' },
    { icon: Shield, label: 'Blacklist', path: '/blacklist' },
  ];

  const settingsItems = [
    { icon: Plug, label: 'Integrations', path: '/integrations' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' }
  ];

  // On mobile, always show expanded view
  const showExpanded = !isCollapsed || isMobileMenuOpen;

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Particle Background */}
      <ParticleBackgroundSafe />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg flex items-center gap-2"
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="main-navigation"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        <span className="text-sm font-medium">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        id="main-navigation"
        aria-label="Main navigation"
        role="navigation"
        className={`
          ${isCollapsed ? 'w-16' : 'w-52'} 
          glass-card border-r border-sidebar-border flex flex-col sticky top-0 h-screen relative z-40 
          transition-all duration-300
          max-lg:fixed max-lg:!w-72 max-lg:top-20 max-lg:right-4 max-lg:bottom-4 max-lg:h-auto max-lg:max-h-[calc(100vh-7rem)] max-lg:rounded-xl max-lg:shadow-2xl
          ${isMobileMenuOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-[calc(100%+2rem)]'}
        `}
      >
        {/* Logo */}
        <div className={`p-6 border-b border-sidebar-border ${isCollapsed && !isMobileMenuOpen ? 'px-3' : ''}`}>
          <Logo size="md" showText={showExpanded} />
        </div>

        {/* Organization Selector */}
        {showExpanded && currentOrg && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="relative">
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-hover transition-colors"
                aria-label="Select organization"
                aria-expanded={showOrgDropdown}
                aria-haspopup="menu"
                aria-controls="organization-menu"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm truncate">{currentOrg.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${showOrgDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {showOrgDropdown && (
                <div 
                  id="organization-menu"
                  role="menu"
                  aria-label="Organization list"
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      role="menuitem"
                      onClick={() => {
                        switchOrganization(org.id);
                        setShowOrgDropdown(false);
                      }}
                      aria-current={currentOrg.id === org.id ? 'true' : undefined}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-sidebar-hover transition-colors ${
                        currentOrg.id === org.id ? 'bg-sidebar-hover' : ''
                      }`}
                    >
                      {org.name}
                      {currentOrg.id === org.id && (
                        <span className="sr-only"> (current organization)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsed Organization Indicator - Desktop only */}
        {isCollapsed && !isMobileMenuOpen && currentOrg && (
          <div className="px-2 py-3 border-b border-sidebar-border flex justify-center max-lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <TooltipProvider delayDuration={0}>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto" role="list">
            {/* Workspace Section */}
            <div>
              {showExpanded && (
                <h3 className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspace
                </h3>
              )}
              <div className="space-y-1 mt-1" role="list">
                {navigationItems.map((item) => {
                  const navContent = (isActive: boolean) => (
                    <motion.div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-hover'
                      } ${isCollapsed && !isMobileMenuOpen ? 'justify-center' : ''}`}
                      whileHover={isCollapsed && !isMobileMenuOpen ? { scale: 1.15 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      {showExpanded && <span className="text-sm">{item.label}</span>}
                      {isActive && <span className="sr-only"> (current page)</span>}
                    </motion.div>
                  );

                  return isCollapsed && !isMobileMenuOpen ? (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.path}
                          end={item.path === '/'}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-label={item.label}
                        >
                          {({ isActive }) => (
                            <div role="listitem" aria-current={isActive ? 'page' : undefined}>
                              {navContent(isActive)}
                            </div>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label={item.label}
                    >
                      {({ isActive }) => (
                        <div role="listitem" aria-current={isActive ? 'page' : undefined}>
                          {navContent(isActive)}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Team Tools Section */}
            <div>
              {showExpanded && (
                <h3 className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Team Tools
                </h3>
              )}
              <div className="space-y-1 mt-1" role="list">
                {teamItems.map((item) => {
                  const navContent = (isActive: boolean) => (
                    <motion.div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-hover'
                      } ${isCollapsed && !isMobileMenuOpen ? 'justify-center' : ''}`}
                      whileHover={isCollapsed && !isMobileMenuOpen ? { scale: 1.15 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      {showExpanded && <span className="text-sm">{item.label}</span>}
                      {isActive && <span className="sr-only"> (current page)</span>}
                    </motion.div>
                  );

                  return isCollapsed && !isMobileMenuOpen ? (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-label={item.label}
                        >
                          {({ isActive }) => (
                            <div role="listitem" aria-current={isActive ? 'page' : undefined}>
                              {navContent(isActive)}
                            </div>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label={item.label}
                    >
                      {({ isActive }) => (
                        <div role="listitem" aria-current={isActive ? 'page' : undefined}>
                          {navContent(isActive)}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Settings Section */}
            <div>
              {showExpanded && (
                <h3 className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Settings
                </h3>
              )}
              <div className="space-y-1 mt-1" role="list">
                {settingsItems.map((item) => {
                  const navContent = (isActive: boolean) => (
                    <motion.div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-hover'
                      } ${isCollapsed && !isMobileMenuOpen ? 'justify-center' : ''}`}
                      whileHover={isCollapsed && !isMobileMenuOpen ? { scale: 1.15 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      {showExpanded && <span className="text-sm">{item.label}</span>}
                      {isActive && <span className="sr-only"> (current page)</span>}
                    </motion.div>
                  );

                  return isCollapsed && !isMobileMenuOpen ? (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-label={item.label}
                        >
                          {({ isActive }) => (
                            <div role="listitem" aria-current={isActive ? 'page' : undefined}>
                              {navContent(isActive)}
                            </div>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label={item.label}
                    >
                      {({ isActive }) => (
                        <div role="listitem" aria-current={isActive ? 'page' : undefined}>
                          {navContent(isActive)}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </TooltipProvider>

        {/* User section */}
        <div className={`p-4 border-t border-sidebar-border ${isCollapsed && !isMobileMenuOpen ? 'px-2' : ''}`}>
          {showExpanded ? (
            <UserMenu showName={true} />
          ) : (
            <div className="flex justify-center">
              <UserMenu showName={false} />
            </div>
          )}
        </div>

        {/* Collapse/Expand Button - Desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-popover border border-border rounded-full shadow-lg hover:bg-sidebar-hover transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          aria-controls="main-navigation"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" aria-hidden="true" /> : <ChevronLeft className="w-3 h-3" aria-hidden="true" />}
        </button>
      </nav>

      {/* Main content */}
      <main id="main-content" role="main" aria-label="Page content" className="flex-1 relative z-10 overflow-hidden">
        <Outlet />
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </div>
  );
}