# Clerk Integration Guide for Lynqio

## Overview
Lynqio now uses [Clerk](https://clerk.com/) for authentication, providing secure, production-ready user management with support for email/password and OAuth providers (Google, GitHub, etc.).

## Setup Instructions

### 1. Create a Clerk Account
1. Go to [clerk.com](https://clerk.com/) and sign up for a free account
2. Create a new application in your Clerk Dashboard

### 2. Get Your Publishable Key
1. In your Clerk Dashboard, navigate to **API Keys** page
2. Select **React** from the framework dropdown
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 3. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and replace `YOUR_PUBLISHABLE_KEY` with your actual Clerk publishable key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

### 4. Enable Authentication Methods
In your Clerk Dashboard:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address** (required for email/password login)
3. Enable **Password** authentication

For OAuth (Optional but recommended):
1. Go to **User & Authentication** → **Social Connections**
2. Enable providers like:
   - **Google** - For Google Sign-In
   - **GitHub** - For GitHub Sign-In
   - **Microsoft** - For Microsoft Sign-In
3. Follow Clerk's documentation to set up OAuth credentials for each provider

## Features

### Authentication Methods
- ✅ Email/Password Authentication
- ✅ OAuth (Google, GitHub, Microsoft, etc.)
- ✅ Magic Links (email-based passwordless)
- ✅ Multi-factor Authentication (optional)

### Clerk Components Used
- `<ClerkProvider>` - Wraps the entire app in `App.tsx`
- `<SignIn>` - Login page with Lynqio theme styling
- `<SignUp>` - Registration page with Lynqio theme styling
- `useUser()` - Hook to access current user data
- `useClerk()` - Hook for sign-out and other Clerk methods

### Custom Styling
The Clerk components are styled to match Lynqio's premium black aesthetic with cyan accents. The styling is applied via the `appearance` prop in the SignIn and SignUp components.

## Integration Details

### App Architecture
```
<ClerkProvider> ← Provides Clerk authentication context
  └── <BrowserRouter> ← React Router for navigation
      └── <ThemeProvider> ← Dark theme management
          └── <AuthProvider> ← Bridges Clerk with existing auth context
              └── <OrganizationProvider> ← Organization/team management
                  └── <FeatureFlagsProvider> ← Feature flags
                      └── <AppRoutes> ← Application routes
```

### AuthContext Bridge
The `AuthContext` has been updated to integrate with Clerk:
- Uses `useUser()` from Clerk to get current user state
- Maps Clerk user data to the existing User interface
- Maintains backward compatibility with existing components
- Logout now uses Clerk's `signOut()` method

### Protected Routes
Routes are protected using the `ProtectedRoute` component which checks:
1. Clerk authentication state (via `useUser()`)
2. Loading state while Clerk initializes
3. Redirects to `/login` if not authenticated

## Development

### Testing Authentication
1. Start the development server
2. Navigate to `/login` or `/sign-up`
3. Sign up with a test email or use an OAuth provider
4. You'll be redirected to the dashboard upon successful authentication

### User Data Access
Access authenticated user data anywhere in the app:

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <img src={user.avatar} alt="Avatar" />
    </div>
  );
}
```

### Clerk Hooks (Alternative)
You can also use Clerk hooks directly:

```tsx
import { useUser, useClerk } from '@clerk/clerk-react';

function MyComponent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Hello, {user?.firstName}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Production Deployment

### Environment Variables
Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in your production environment.

### Clerk Production Instance
1. Create a production instance in Clerk Dashboard
2. Configure your production domain
3. Set up production OAuth credentials (if using)
4. Use the production publishable key in your environment

## Troubleshooting

### "Missing Clerk Publishable Key" Error
- Ensure `.env.local` exists and contains `VITE_CLERK_PUBLISHABLE_KEY`
- Restart your development server after adding the key
- Verify the key starts with `pk_test_` or `pk_live_`

### Authentication Not Working
1. Check Clerk Dashboard → User & Authentication settings
2. Ensure email and password authentication are enabled
3. Check browser console for Clerk errors
4. Verify your publishable key is correct

### OAuth Issues
1. Follow Clerk's OAuth setup guide for each provider
2. Ensure redirect URLs are configured in provider settings
3. Check Clerk Dashboard → Social Connections for provider status

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Clerk Discord Community](https://clerk.com/discord)

## Security Notes

- ✅ Publishable keys are safe to expose in client-side code
- ✅ Never commit your `.env.local` file to version control
- ✅ Use production keys only in production environments
- ✅ Enable MFA for enhanced security (optional)
- ✅ Clerk handles all password security and token management

## Migration from localStorage Auth

The previous localStorage-based authentication has been replaced with Clerk. Key changes:
- No more mock login credentials
- Real user accounts with email verification
- Secure session management
- Professional authentication UI
- Built-in security features

All existing components continue to work through the `AuthContext` bridge.
