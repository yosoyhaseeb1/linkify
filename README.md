# Lynqio - LinkedIn Automation SaaS Platform

> Production-ready LinkedIn automation tool for recruiters with multi-tenant organization support, team collaboration, and comprehensive campaign management.

---

## 🚀 **Overview**

Lynqio is a comprehensive SaaS platform designed for recruiting teams to automate LinkedIn outreach campaigns. The platform takes a LinkedIn job post URL, automatically finds the top decision makers, drafts personalized messages, and creates HeyReach campaigns with intelligent fallback logic.

### **Key Highlights**

- ✅ **92% Production-Ready** - Full authentication, billing, team management
- ✅ **Multi-Tenant Architecture** - Clerk organizations with role-based access control
- ✅ **Mobile-First Design** - Responsive across all devices with glassmorphism UI
- ✅ **Team-Focused** - Minimum 3 seats, designed for collaboration
- ✅ **3-Tier Architecture** - Frontend → Hono Edge Functions → Database

---

## 📚 **Tech Stack**

### **Frontend**
- **Framework:** React 18 with TypeScript
- **State Management:** TanStack Query v5 (React Query)
- **Routing:** React Router v6 with lazy loading
- **Styling:** CSS Variables with dark theme + glassmorphism effects
- **UI Components:** Custom components with shadcn/ui patterns

### **Backend**
- **Runtime:** Supabase Edge Functions (Deno)
- **Framework:** Hono (Fast web framework)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage for file uploads

### **Authentication**
- **Provider:** Clerk (multi-tenant organizations)
- **JWT:** Custom Supabase template with org_id claim
- **Roles:** Admin, Member (Clerk organization roles)

### **External Integrations**
- **HeyReach:** Campaign automation
- **PhantomBuster:** LinkedIn data scraping
- **Stripe:** Payment processing

---

## 📁 **Project Structure**

```
lynqio/
├── src/app/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components (Button, Input, etc.)
│   │   ├── DashboardLayout.tsx
│   │   ├── Pagination.tsx
│   │   ├── ErrorBanner.tsx
│   │   └── ...
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx        # Clerk authentication
│   │   ├── OrganizationContext.tsx # Multi-tenant org management
│   │   ├── ThemeContext.tsx       # Dark theme toggle
│   │   └── FeatureFlagsContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useRuns.ts    # Runs data with React Query
│   │   ├── useProspects.ts
│   │   └── useMessages.ts
│   ├── pages/            # Route page components
│   │   ├── Dashboard.tsx
│   │   ├── Runs.tsx
│   │   ├── Pipeline.tsx
│   │   ├── Team.tsx
│   │   ├── Billing.tsx
│   │   └── ...
│   ├── services/         # API service layer
│   │   ├── apiService.ts        # Main API calls
│   │   └── userDataService.ts   # User-scoped data
│   ├── utils/            # Utilities
│   │   ├── logger.ts            # Centralized logging
│   │   ├── accessibility.ts     # A11y helpers
│   │   └── tableKeyboardNav.ts  # Keyboard navigation
│   ├── docs/             # Documentation
│   │   ├── CLERK_CONFIGURATION.md
│   │   ├── MODAL_KEYBOARD_NAV.md
│   │   └── ACCESSIBILITY.md
│   └── App.tsx           # Main app component
├── supabase/functions/server/
│   ├── index.tsx         # Hono server entry point
│   ├── kv_store.tsx      # Key-value database utilities
│   └── ...               # Route handlers
└── utils/
    ├── supabase/info.tsx # Supabase config
    └── clerk/info.tsx    # Clerk config
```

---

## 🔑 **Key Features**

### **1. Multi-Tenant Organization Management**
- Clerk organizations as primary source of truth
- Automatic org switching with JWT token refresh
- Member sync between Clerk and backend
- Role-based access control (Admin, Member)

### **2. Run Management**
- Create LinkedIn outreach campaigns from job URLs
- Track prospects through pipeline stages
- View detailed analytics and metrics
- Pagination with server-side support

### **3. Pipeline Tracking**
- Drag-and-drop Kanban board
- Prospect cards with detailed information
- Stage transitions with automatic updates
- Keyboard-accessible drag & drop alternative

### **4. Team Collaboration**
- Real-time member management
- Task assignment and tracking
- Team performance analytics
- Daily standup summaries

### **5. Integrations**
- HeyReach campaign creation
- PhantomBuster data import
- Stripe billing and subscriptions
- LinkedIn API integration

### **6. Analytics Dashboard**
- Response rate tracking
- Conversion funnel visualization
- Team performance metrics
- Custom date range filtering

---

## 🔐 **Authentication Flow**

### **Architecture**
```
User → Clerk Sign-In → JWT Token → API Calls
                     ↓
              (org_id claim)
                     ↓
        Backend validates token
                     ↓
          Returns org-scoped data
```

### **Two-Token Authentication**
Every API request requires two headers:

```typescript
// Public Supabase anon key (for edge function access)
Authorization: Bearer ${publicAnonKey}

// User's Clerk JWT (for authentication & authorization)
x-clerk-token: ${clerkJWT}
```

### **JWT Token Structure**
```json
{
  "sub": "user_2abc123",
  "org_id": "org_2xyz789",
  "org_role": "admin",
  "org_permissions": ["manage:members", "create:runs"],
  "exp": 1735689600
}
```

### **Getting a Token**
```typescript
import { useAuth } from './contexts/AuthContext';

const { getToken } = useAuth();
const token = await getToken(); // Uses "supabase" JWT template
```

---

## 🎨 **Design System**

### **Dark Theme with Glassmorphism**
- **Background:** `#0a0a0f` (near black)
- **Primary:** Cyan `#00d9ff`
- **Glass Cards:** `rgba(255, 255, 255, 0.03)` with backdrop blur
- **Borders:** `rgba(255, 255, 255, 0.08)`

### **CSS Variables** (`/src/styles/theme.css`)
```css
:root {
  --background: #0a0a0f;
  --foreground: #e5e7eb;
  --primary: #00d9ff;
  --primary-hover: #00b8d9;
  --card: rgba(255, 255, 255, 0.03);
  --border: rgba(255, 255, 255, 0.08);
}
```

### **Glass Card Pattern**
```tsx
<div className="glass-card rounded-xl p-6">
  {/* Content */}
</div>
```

---

## 📊 **State Management**

### **React Query (TanStack Query v5)**
Used for all server state with caching and optimistic updates.

```typescript
// Fetch runs with pagination
const { runs, isLoading, totalCount } = useRuns({ 
  page: 1, 
  pageSize: 20 
});

// Create run with optimistic update
const { createRun, isCreating } = useCreateRun();
await createRun({ jobUrl, jobTitle, company });
// UI updates immediately, rollback on error
```

### **React Context**
Used for global client state:
- **AuthContext** - User authentication state
- **OrganizationContext** - Current org and members
- **ThemeContext** - Dark/light theme
- **FeatureFlagsContext** - Feature toggles

---

## 🔄 **Data Flow**

### **Example: Creating a Run**

```typescript
// 1. User submits form in NewRun.tsx
const handleSubmit = async (data) => {
  const newRun = await createRun(data);
  navigate(`/runs/${newRun.id}`);
};

// 2. useCreateRun hook (optimistic update)
const { createRun } = useCreateRun();
// - Immediately adds run to UI
// - Calls API in background
// - Rolls back if error

// 3. apiService.ts makes request
export async function createRun(data, getToken) {
  const token = await getToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'x-clerk-token': token,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// 4. Backend (Hono) handles request
app.post('/runs', async (c) => {
  const token = c.req.header('x-clerk-token');
  const { userId, org_id } = await verifyToken(token);
  
  const run = await createRunInDatabase(org_id, data);
  return c.json(run);
});
```

---

## ♿ **Accessibility**

### **WCAG 2.1 Level AA Compliant**
- ✅ Keyboard navigation for all interactive elements
- ✅ Screen reader support with ARIA labels
- ✅ Focus management in modals/dialogs
- ✅ Semantic HTML structure
- ✅ Color contrast ratios meet standards

### **Features**
- **Skip Links** - Jump to main content
- **Focus Trapping** - Modal keyboard navigation
- **Live Regions** - Dynamic content announcements
- **Keyboard Shortcuts** - Cmd/Ctrl+K for search
- **Table Navigation** - Arrow keys, Home, End

### **Testing**
```bash
# Keyboard-only navigation test
# 1. Tab through all elements
# 2. Enter/Space to activate
# 3. Escape to close modals
# 4. Arrow keys in tables

# Screen reader test (macOS)
# VoiceOver: Cmd+F5
```

See [ACCESSIBILITY.md](./src/app/docs/ACCESSIBILITY.md) for details.

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Clerk account (free development keys)
- Supabase project

### **Installation**

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Variables**

Create a `.env` file or use Figma Make's environment variable modal:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database
SUPABASE_DB_URL=postgresql://postgres:...
```

### **First Run**

1. **Sign Up** - Create account at `/sign-up`
2. **Create Organization** - Required for team access
3. **Invite Members** - Minimum 3 seats
4. **Configure Integrations** - HeyReach, PhantomBuster
5. **Create First Run** - Enter LinkedIn job URL

---

## 📦 **API Reference**

### **Base URL**
```
https://{projectId}.supabase.co/functions/v1/make-server-0d5eb2a5
```

### **Headers**
```typescript
{
  'Authorization': `Bearer ${publicAnonKey}`,
  'x-clerk-token': ${clerkJWT},
  'Content-Type': 'application/json'
}
```

### **Endpoints**

#### **Runs**
```typescript
GET    /runs                  # List all runs (paginated)
POST   /runs                  # Create new run
GET    /runs/:id              # Get run details
PATCH  /runs/:id              # Update run
DELETE /runs/:id              # Delete run
```

#### **Organization Members**
```typescript
GET    /org-members/:orgId           # List members
POST   /org-members/:orgId/sync      # Sync from Clerk
POST   /org-members/:orgId/add       # Add member
DELETE /org-members/:orgId/:memberId # Remove member
PATCH  /org-members/:orgId/:memberId # Update role
```

#### **User Data**
```typescript
GET    /user-data/:userId             # Get user data
PUT    /user-data/:userId/contacts    # Save contacts
PUT    /user-data/:userId/tasks       # Save tasks
PUT    /user-data/:userId/jobs        # Save jobs
```

---

## 🧪 **Testing**

### **Manual Testing Checklist**

#### **Authentication**
- [ ] Sign up with email/password
- [ ] Sign in with Google (if configured)
- [ ] Sign out and verify redirect
- [ ] Session timeout modal appears
- [ ] JWT token includes org_id claim

#### **Organization Management**
- [ ] Create new organization
- [ ] Switch between organizations
- [ ] Invite team member
- [ ] Update member role (Admin/Member)
- [ ] Remove team member

#### **Run Management**
- [ ] Create run from LinkedIn URL
- [ ] View run details
- [ ] Update run status
- [ ] Delete run
- [ ] Pagination works correctly

#### **Accessibility**
- [ ] Keyboard-only navigation
- [ ] Tab focus visible on all elements
- [ ] Modals trap focus correctly
- [ ] Escape key closes dialogs
- [ ] Screen reader announces changes

---

## 🎯 **Pricing Tiers**

### **Pilot Plan** (50% off for life)
- 100 runs/month
- 1,000 prospects/month
- 3 team members
- Basic integrations

### **Regular Plan**
- 100 runs/month
- 1,000 prospects/month
- 3 team members
- Basic integrations

### **Pro Plan**
- Unlimited runs
- Unlimited prospects
- Unlimited team members
- All integrations
- Priority support

---

## 📖 **Documentation**

### **For Developers**
- [API Reference](docs/API.md) - Backend endpoint documentation
- [Components](docs/COMPONENTS.md) - UI component guide
- [Clerk Configuration Guide](./src/app/docs/CLERK_CONFIGURATION.md)
- [Modal & Keyboard Nav](./src/app/docs/MODAL_KEYBOARD_NAV.md)
- [Accessibility Guide](./src/app/docs/ACCESSIBILITY.md)

### **Code Examples**

#### **Using Authentication**
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, getToken, logout } = useAuth();
  
  const fetchData = async () => {
    const token = await getToken();
    const response = await fetch(API_URL, {
      headers: {
        'x-clerk-token': token,
      },
    });
  };
}
```

#### **Using Organizations**
```typescript
import { useOrganization } from './contexts/OrganizationContext';

function MyComponent() {
  const { 
    currentOrg, 
    members, 
    isCurrentUserAdmin,
    inviteMember 
  } = useOrganization();
  
  if (isCurrentUserAdmin()) {
    // Show admin features
  }
}
```

#### **Using React Query**
```typescript
import { useRuns, useCreateRun } from './hooks/useRuns';

function RunsPage() {
  const { runs, isLoading, totalCount } = useRuns({ page: 1 });
  const { createRun, isCreating } = useCreateRun();
  
  const handleCreate = async (data) => {
    try {
      const newRun = await createRun(data);
      toast.success('Run created!');
    } catch (error) {
      toast.error('Failed to create run');
    }
  };
}
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **"Missing Clerk Publishable Key"**
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set
- Refresh page after adding environment variable
- Check key starts with `pk_test_` or `pk_live_`

#### **"Token missing org_id claim"**
- Wait a few seconds after org creation
- Call `setActive({ organization: orgId })`
- Use `getToken({ skipCache: true })` for fresh token

#### **"Organization not found"**
- User needs to create or join an organization
- Check Clerk Dashboard for org list
- Verify org_id in JWT token payload

#### **API 401 Unauthorized**
- Token may be expired (get fresh token)
- Verify both headers are present
- Check Clerk JWT template is configured

---

## 🚀 **Deployment**

### **Production Checklist**

1. **Environment Variables**
   - [ ] Switch to production Clerk keys (`pk_live_...`)
   - [ ] Use production Supabase project
   - [ ] Add production domain to Clerk

2. **Clerk Configuration**
   - [ ] Upgrade to paid plan
   - [ ] Configure production domain
   - [ ] Enable social login providers
   - [ ] Set up email templates

3. **Supabase**
   - [ ] Review database indexes
   - [ ] Set up backup schedule
   - [ ] Configure CORS policies
   - [ ] Review rate limits

4. **Monitoring**
   - [ ] Set up error tracking (Sentry)
   - [ ] Configure analytics (PostHog, Mixpanel)
   - [ ] Enable logging service
   - [ ] Set up uptime monitoring

---

## 📝 **License**

Proprietary - All rights reserved

---

## 👥 **Team & Support**

For questions or issues:
- Email: support@lynqio.com
- Slack: #lynqio-help
- Documentation: /help page in app

---

**Built with ❤️ for recruiting teams**

Last Updated: December 28, 2024