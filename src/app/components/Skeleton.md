# Skeleton Loading Components

Complete guide to using skeleton loading states in Lynqio.

---

## 🎯 Overview

Skeleton components provide instant visual feedback during data loading, improving perceived performance and user experience. Instead of showing spinners or blank screens, users see a preview of the content structure.

**Benefits:**
- ⚡ **Instant Feedback** - Users immediately see something is happening
- 📊 **Better UX** - Content structure previewed before data loads
- 🎨 **Professional Look** - Smooth, branded loading animations
- ♿ **Accessible** - WCAG 2.1 AA compliant with proper ARIA labels
- 📱 **Responsive** - Works perfectly on mobile and desktop

---

## 📦 Available Components

### Core Components
1. **SkeletonText** - Single or multi-line text placeholders
2. **SkeletonCard** - Card-shaped placeholders for list items
3. **SkeletonTable** - Table with skeleton rows
4. **SkeletonAvatar** - Circular placeholders for avatars

### Additional Components
5. **SkeletonButton** - Button-shaped placeholders
6. **SkeletonBadge** - Badge/pill placeholders
7. **SkeletonImage** - Image placeholders with aspect ratios

### Pre-built Patterns
8. **SkeletonRunCard** - Specific pattern for run list items
9. **SkeletonContactCard** - Pattern for contact list items
10. **SkeletonDashboardWidget** - Pattern for stat cards

---

## 🎨 Visual Features

### Shimmer Animation
```css
/* Linear gradient moving left to right */
background: linear-gradient(
  90deg,
  rgba(148, 163, 184, 0.05) 0%,
  rgba(6, 182, 212, 0.15) 40%,    /* Cyan highlight */
  rgba(148, 163, 184, 0.05) 100%
);
animation: shimmer 2s infinite linear;
```

**Effect:**
- Subtle cyan shimmer moving across the skeleton
- 2-second loop, smooth and non-distracting
- Matches Lynqio brand colors (#06B6D4 cyan)
- GPU-accelerated for performance

### Pulse Animation (Static Mode)
```css
/* Subtle opacity pulse */
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

**When to use:**
- Set `animate={false}` for pulse instead of shimmer
- Better for many skeletons (50+) to reduce CPU usage
- Fallback when shimmer causes performance issues

---

## 📖 Component API

### SkeletonText

**Props:**
```typescript
interface SkeletonTextProps {
  width?: string | number;      // Default: '100%'
  height?: string | number;     // Default: 16
  className?: string;
  animate?: boolean;            // Default: true
  lines?: number;               // Default: 1
  lineGap?: number;             // Default: 8 (pixels)
}
```

**Examples:**
```tsx
// Single line
<SkeletonText width="200px" />

// Paragraph (3 lines)
<SkeletonText lines={3} width="100%" />

// Heading
<SkeletonText width="60%" height={32} />

// Static (no animation)
<SkeletonText width="150px" animate={false} />
```

---

### SkeletonCard

**Props:**
```typescript
interface SkeletonCardProps {
  width?: string | number;      // Default: '100%'
  height?: string | number;     // Default: auto
  className?: string;
  animate?: boolean;            // Default: true
  showAvatar?: boolean;         // Default: false
  showTitle?: boolean;          // Default: true
  showDescription?: boolean;    // Default: true
  showFooter?: boolean;         // Default: false
}
```

**Examples:**
```tsx
// Basic card
<SkeletonCard />

// Card with avatar
<SkeletonCard showAvatar />

// Full featured card
<SkeletonCard showAvatar showFooter />

// Custom size
<SkeletonCard width="350px" height="200px" />
```

---

### SkeletonTable

**Props:**
```typescript
interface SkeletonTableProps {
  rows?: number;                // Default: 5
  columns?: number;             // Default: 4
  className?: string;
  animate?: boolean;            // Default: true
  showHeader?: boolean;         // Default: true
  columnWidths?: string[];      // e.g., ['20%', '30%', '25%', '25%']
}
```

**Examples:**
```tsx
// Basic table
<SkeletonTable />

// Large table (10 rows, 6 columns)
<SkeletonTable rows={10} columns={6} />

// Custom column widths
<SkeletonTable 
  columns={3} 
  columnWidths={['40%', '35%', '25%']} 
/>

// Without header
<SkeletonTable showHeader={false} />
```

---

### SkeletonAvatar

**Props:**
```typescript
interface SkeletonAvatarProps {
  size?: number;                // Default: 40 (pixels)
  className?: string;
  animate?: boolean;            // Default: true
  showText?: boolean;           // Default: false
  textWidth?: string | number;  // Default: '100px'
}
```

**Examples:**
```tsx
// Default avatar (40px)
<SkeletonAvatar />

// Large avatar (80px)
<SkeletonAvatar size={80} />

// Avatar with name/text
<SkeletonAvatar size={48} showText textWidth="150px" />

// Small avatar (24px)
<SkeletonAvatar size={24} />
```

---

## 💡 Usage Patterns

### 1. Loading a Page

```tsx
import { SkeletonText, SkeletonCard } from '../components/Skeleton';

function RunsPage() {
  const { runs, isLoading } = useRuns();

  if (isLoading) {
    return (
      <div className="p-8">
        {/* Header */}
        <SkeletonText width="150px" height={32} className="mb-6" />
        
        {/* Cards */}
        <div className="space-y-4">
          <SkeletonCard showAvatar />
          <SkeletonCard showAvatar />
          <SkeletonCard showAvatar />
        </div>
      </div>
    );
  }

  return <div>{/* Actual content */}</div>;
}
```

---

### 2. Loading a List

```tsx
function RunsList({ runs, isLoading }) {
  return (
    <div className="space-y-4">
      {isLoading ? (
        // Show skeletons while loading
        Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRunCard key={i} />
        ))
      ) : (
        // Show actual data
        runs.map(run => (
          <RunCard key={run.id} run={run} />
        ))
      )}
    </div>
  );
}
```

---

### 3. Loading a Table

```tsx
function DataTable({ data, isLoading }) {
  if (isLoading) {
    return <SkeletonTable rows={10} columns={5} />;
  }

  return (
    <table>
      {/* Actual table */}
    </table>
  );
}
```

---

### 4. Loading Dashboard Widgets

```tsx
function Dashboard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      {isLoading ? (
        <>
          <SkeletonDashboardWidget />
          <SkeletonDashboardWidget />
          <SkeletonDashboardWidget />
          <SkeletonDashboardWidget />
        </>
      ) : (
        stats.map(stat => (
          <StatCard key={stat.id} {...stat} />
        ))
      )}
    </div>
  );
}
```

---

### 5. Loading with React Suspense

```tsx
import { Suspense, lazy } from 'react';
import { SkeletonTable } from '../components/Skeleton';

const DataTable = lazy(() => import('./DataTable'));

function Page() {
  return (
    <Suspense fallback={<SkeletonTable rows={10} />}>
      <DataTable />
    </Suspense>
  );
}
```

---

## 🎭 Pre-built Patterns

### SkeletonRunCard
Pre-built pattern matching the actual RunCard component layout.

```tsx
<SkeletonRunCard />
```

**Structure:**
- Title line (70% width)
- Company line (40% width)
- Status badge (80px)
- 2 description lines
- Footer with 2 metadata items

---

### SkeletonContactCard
Pre-built pattern for contact list items.

```tsx
<SkeletonContactCard />
```

**Structure:**
- 48px circular avatar
- Name line (60% width)
- Role/title line (40% width)
- 2 detail lines

---

### SkeletonDashboardWidget
Pre-built pattern for stat cards.

```tsx
<SkeletonDashboardWidget />
```

**Structure:**
- Label line (40% width)
- Large value line (60% width)
- Trend indicator (30% width)

---

## 📱 Responsive Design

All skeleton components are responsive by default:

```tsx
// Full width on mobile, fixed on desktop
<SkeletonCard width="100%" className="md:w-[350px]" />

// Grid that adapts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <SkeletonCard />
  <SkeletonCard />
  <SkeletonCard />
</div>

// Hide on mobile, show on desktop
<SkeletonText className="hidden md:block" />
```

---

## ♿ Accessibility

All skeleton components include proper ARIA attributes:

```tsx
<div
  role="status"
  aria-hidden="true"
  aria-label="Loading..."
>
  {/* Skeleton content */}
</div>
```

**WCAG 2.1 AA Compliance:**
- ✅ Proper ARIA roles
- ✅ Hidden from screen readers (aria-hidden)
- ✅ Status indication (role="status")
- ✅ Descriptive labels
- ✅ Sufficient color contrast
- ✅ No motion-triggered content

---

## 🎨 Theming

Skeletons automatically adapt to light/dark mode:

**Dark Mode (Default):**
```css
background: linear-gradient(
  90deg,
  rgba(148, 163, 184, 0.05) 0%,
  rgba(6, 182, 212, 0.15) 40%,
  rgba(148, 163, 184, 0.05) 100%
);
```

**Light Mode:**
```css
background: linear-gradient(
  90deg,
  rgba(148, 163, 184, 0.08) 0%,
  rgba(6, 182, 212, 0.18) 40%,
  rgba(148, 163, 184, 0.08) 100%
);
```

**Colors Used:**
- Gray: `rgba(148, 163, 184, ...)` - Slate gray
- Cyan: `rgba(6, 182, 212, ...)` - Lynqio brand color (#06B6D4)

---

## 🚀 Performance

### Optimization Tips

**1. Disable Animation for Many Skeletons**
```tsx
// 50+ skeletons? Disable shimmer
{Array.from({ length: 100 }).map((_, i) => (
  <SkeletonCard key={i} animate={false} />
))}
```

**2. Use Virtualization**
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      {isLoading ? <SkeletonCard /> : <ActualCard />}
    </div>
  )}
</FixedSizeList>
```

**3. Match Skeleton to Content**
```tsx
// Good: Skeleton matches content dimensions
<SkeletonText width="200px" height={20} />
<Title>Actual Title</Title>

// Bad: Mismatched dimensions cause layout shift
<SkeletonText width="100%" height={40} />
<Title>Short Title</Title>
```

**4. Lazy Load Skeletons**
```tsx
// Only show skeleton after 200ms delay
const [showSkeleton, setShowSkeleton] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowSkeleton(true), 200);
  return () => clearTimeout(timer);
}, []);

if (isLoading && showSkeleton) {
  return <SkeletonCard />;
}
```

---

## 📊 Comparison: Skeleton vs Spinner

### Loading Spinner
```tsx
{isLoading && (
  <div className="flex justify-center">
    <Loader2 className="animate-spin" />
  </div>
)}
```

**Problems:**
- ❌ No content structure preview
- ❌ Feels slow (waiting with no context)
- ❌ Can cause layout shift
- ❌ Boring, generic UX

---

### Skeleton Loading
```tsx
{isLoading ? (
  <SkeletonCard showAvatar />
) : (
  <ActualCard />
)}
```

**Benefits:**
- ✅ Shows content structure
- ✅ Feels faster (context provided)
- ✅ No layout shift (same dimensions)
- ✅ Professional, branded UX

---

## 🎯 When to Use Each Component

| Component | Use For | Don't Use For |
|-----------|---------|---------------|
| **SkeletonText** | Titles, descriptions, paragraphs | Cards, tables |
| **SkeletonCard** | List items, grid items, widgets | Simple text, tables |
| **SkeletonTable** | Data tables, multi-column lists | Simple lists, cards |
| **SkeletonAvatar** | User photos, profile pics | Logos, icons, images |
| **SkeletonButton** | Action buttons, CTAs | Links, text buttons |
| **SkeletonBadge** | Status tags, pills | Buttons, labels |
| **SkeletonImage** | Photos, thumbnails, banners | Avatars, icons |

---

## 🔧 Customization

### Custom Width/Height
```tsx
<SkeletonText width="250px" height={24} />
<SkeletonCard width="100%" height="200px" />
```

### Custom Classes
```tsx
<SkeletonText 
  className="mb-4 md:w-1/2" 
/>
```

### Disable Animation
```tsx
<SkeletonCard animate={false} />
```

### Custom Rounded Corners
The `BaseSkeleton` component supports:
- `rounded="sm"` - Small radius
- `rounded="md"` - Medium radius (default)
- `rounded="lg"` - Large radius
- `rounded="full"` - Fully rounded (circles)
- `rounded="none"` - No rounding

---

## 📚 Real-World Examples

### Example 1: Runs Page
```tsx
function RunsPage() {
  const { runs, isLoading } = useRuns();

  if (isLoading) {
    return (
      <div className="p-8">
        <SkeletonText width="120px" height={32} className="mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRunCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1>Runs</h1>
      <div className="space-y-4">
        {runs.map(run => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>
    </div>
  );
}
```

---

### Example 2: Dashboard
```tsx
function Dashboard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mt-6">
        {isLoading ? (
          <>
            <SkeletonDashboardWidget />
            <SkeletonDashboardWidget />
            <SkeletonDashboardWidget />
            <SkeletonDashboardWidget />
          </>
        ) : (
          stats.map(stat => (
            <StatCard key={stat.id} {...stat} />
          ))
        )}
      </div>
    </div>
  );
}
```

---

### Example 3: Contact List
```tsx
function ContactList() {
  const { contacts, isLoading } = useContacts();

  return (
    <div className="grid grid-cols-3 gap-4">
      {isLoading ? (
        Array.from({ length: 9 }).map((_, i) => (
          <SkeletonContactCard key={i} />
        ))
      ) : (
        contacts.map(contact => (
          <ContactCard key={contact.id} contact={contact} />
        ))
      )}
    </div>
  );
}
```

---

## ✨ Summary

**Skeleton Components Provide:**
- ⚡ Instant visual feedback during loading
- 🎨 Professional shimmer animations
- 📱 Fully responsive design
- ♿ WCAG 2.1 AA accessibility
- 🎯 Pre-built patterns for common use cases
- 🔧 Highly customizable
- 🚀 Performance optimized

**Result:** Users perceive your app as faster and more responsive, even when data is still loading! 🎉
