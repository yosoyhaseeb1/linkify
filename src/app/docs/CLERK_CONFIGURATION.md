# Clerk Configuration Guide

This guide explains Clerk authentication setup, configuration, and the development vs. production key warning.

---

## ⚠️ **About the "Development Keys" Warning**

### **What You're Seeing:**
```
Clerk: Clerk has been loaded with development keys. 
Development instances have strict usage limits and should not be used 
when deploying your application to production.
```

### **Is This An Error?**
**NO!** This is just an **informational warning**, not an error. Here's what it means:

#### **During Development (What you have now):**
- ✅ Using `pk_test_...` keys is **correct and expected**
- ✅ The warning is **normal** - Clerk is just reminding you
- ✅ Everything works perfectly for development
- ✅ You can safely ignore this message while building

#### **For Production (When you deploy):**
- ⚠️ You'll need to upgrade to production keys (`pk_live_...`)
- ⚠️ Development keys have usage limits (not suitable for real users)
- ⚠️ Production keys require a paid Clerk plan

---

## 🔑 **Clerk Key Types**

### **Development Keys** (Current Setup)
```
pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Characteristics:**
- Free tier
- Usage limits (100 MAU - Monthly Active Users)
- Perfect for development
- Shows the warning message
- Not for production use

### **Production Keys** (For Deployment)
```
pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Characteristics:**
- Paid plan required
- No usage limits (based on plan)
- No warning messages
- For production deployments
- Requires verified domain

---

## 🚀 **Current Setup (Development)**

Your Lynqio app is correctly configured with:

1. **Environment Variable:** `VITE_CLERK_PUBLISHABLE_KEY`
2. **Key Type:** Development key (`pk_test_...`)
3. **Status:** ✅ Working correctly
4. **Warning:** Expected and normal

### **What's Working:**
- ✅ User authentication (login/signup)
- ✅ Organization management
- ✅ Session handling
- ✅ Role-based access control
- ✅ Social login (if configured)

---

## 📝 **When to Upgrade to Production Keys**

You should switch to production keys when:

1. **Deploying to production** (e.g., Vercel, Netlify)
2. **Expecting real users** (not just testing)
3. **Exceeding 100 MAU** (Monthly Active Users)
4. **Need custom domain** for authentication

---

## 🔧 **How to Get Production Keys**

### **Step 1: Upgrade Clerk Plan**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your application
3. Click "Upgrade" in the top-right
4. Choose a paid plan (Pro, Enterprise)

### **Step 2: Get Production Keys**
1. Go to **API Keys** in dashboard
2. Look for **Production** section
3. Copy your `pk_live_...` key

### **Step 3: Add Production Domain**
1. Go to **Domains** in dashboard
2. Add your production domain (e.g., `app.lynqio.com`)
3. Verify domain ownership

### **Step 4: Update Environment Variables**
Replace development key with production key:

```bash
# Old (Development)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXX...

# New (Production)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_XXXX...
```

### **Step 5: Deploy**
Deploy your app with the new environment variable.

---

## 🛠️ **Configuration in Lynqio**

### **Current Configuration**

**File:** `/utils/clerk/info.tsx`
```typescript
export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
```

**File:** `/src/app/App.tsx`
```typescript
import { clerkPublishableKey } from '../../utils/clerk/info';

const PUBLISHABLE_KEY = clerkPublishableKey;

<ClerkProvider 
  publishableKey={PUBLISHABLE_KEY} 
  afterSignOutUrl="/"
  telemetry={false}
  navigate={(to) => window.location.href = to}
>
```

### **Why This Warning Appears**
Clerk automatically detects when you're using a `pk_test_...` key and shows this informational message to ensure developers don't accidentally deploy with development keys.

---

## ✅ **Best Practices**

### **During Development:**
1. ✅ Use `pk_test_...` keys
2. ✅ Ignore the warning message
3. ✅ Test all authentication flows
4. ✅ Configure authentication methods

### **Before Production:**
1. ⚠️ Upgrade to paid Clerk plan
2. ⚠️ Switch to `pk_live_...` keys
3. ⚠️ Configure production domains
4. ⚠️ Test with production keys in staging
5. ⚠️ Monitor usage limits

### **Security:**
1. 🔒 Never commit keys to git
2. 🔒 Use environment variables only
3. 🔒 Rotate keys if compromised
4. 🔒 Different keys for staging/production

---

## 🔍 **Clerk Dashboard Setup**

### **Authentication Methods**
Enable in Dashboard → User & Authentication:

- ✅ **Email address** - Required
- ✅ **Password** - Required
- ✅ **Google** - Optional (Social login)
- ✅ **GitHub** - Optional (Social login)
- ✅ **Microsoft** - Optional (SSO)

### **Organization Settings**
Enable in Dashboard → Organizations:

- ✅ **Organizations** - Enabled
- ✅ **Roles** - Admin, Member
- ✅ **Domains** - Optional (for team invites)

### **Session Settings**
Configure in Dashboard → Sessions:

- ⏱️ **Session duration** - 7 days (default)
- 🔄 **Refresh token** - Enabled
- 🔒 **Multi-session** - Enabled

---

## 🚨 **Troubleshooting**

### **Warning Message Won't Go Away**
**This is normal!** The warning will always appear with development keys. It will only disappear when you:
1. Switch to production keys (`pk_live_...`)
2. Have a paid Clerk plan
3. Deploy to production

### **Key Not Loading**
If you see "Missing Clerk Publishable Key":
1. Check environment variable is set
2. Refresh the page (env vars need page reload)
3. Verify key starts with `pk_test_` or `pk_live_`
4. Check for typos in variable name

### **Authentication Not Working**
1. Verify key is correct in Clerk Dashboard
2. Check authentication methods are enabled
3. Ensure domain is configured (for production)
4. Check browser console for errors

---

## 📊 **Development vs Production Comparison**

| Feature | Development (`pk_test_`) | Production (`pk_live_`) |
|---------|-------------------------|------------------------|
| **Cost** | Free | Paid plan required |
| **Warning** | Shows warning message | No warning |
| **MAU Limit** | 100 users | Based on plan |
| **Custom Domain** | Not required | Required |
| **Usage** | Development/Testing | Production/Real users |
| **Setup Time** | Instant | Requires upgrade |

---

## 💡 **FAQ**

### **Q: Do I need to fix this warning?**
**A:** No! It's informational only. You can safely develop with this warning present.

### **Q: When should I upgrade?**
**A:** When you're ready to deploy to production with real users.

### **Q: Can I test with development keys?**
**A:** Yes! Development keys are perfect for building and testing.

### **Q: How much does production cost?**
**A:** Clerk Pro starts at $25/month for up to 10,000 MAU. Check [Clerk Pricing](https://clerk.com/pricing) for details.

### **Q: Can I suppress the warning?**
**A:** The warning appears in the console only. It doesn't affect functionality and users won't see it.

### **Q: What if I exceed 100 MAU in development?**
**A:** Upgrade to a paid plan to continue. Development keys stop working after limit.

---

## 🎯 **Summary**

### **For Now (Development):**
✅ Warning is **normal** and **expected**  
✅ Your setup is **correct**  
✅ Everything is **working properly**  
✅ No action needed

### **For Production (Later):**
⚠️ Upgrade to paid Clerk plan  
⚠️ Switch to production keys  
⚠️ Configure production domain  
⚠️ Test before deploying

---

## 📚 **Additional Resources**

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Pricing](https://clerk.com/pricing)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Clerk API Keys](https://clerk.com/docs/deployments/api-keys)
- [Clerk Organizations](https://clerk.com/docs/organizations/overview)

---

**Last Updated:** December 28, 2024  
**Status:** Development keys configured correctly ✅
