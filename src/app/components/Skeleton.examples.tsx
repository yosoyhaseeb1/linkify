/**
 * Skeleton Component Usage Examples
 * 
 * This file documents all skeleton variants and usage patterns
 * for the Lynqio platform.
 */

import {
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonBadge,
  SkeletonImage,
  SkeletonRunCard,
  SkeletonContactCard,
  SkeletonDashboardWidget,
} from './Skeleton';

// ============================================================================
// 1. SKELETON TEXT EXAMPLES
// ============================================================================

export function SkeletonTextExamples() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="mb-2">Single Line Text</h3>
        <SkeletonText width="200px" />
      </div>

      <div>
        <h3 className="mb-2">Full Width Text</h3>
        <SkeletonText width="100%" />
      </div>

      <div>
        <h3 className="mb-2">Multiple Lines (Paragraph)</h3>
        <SkeletonText lines={4} width="100%" />
      </div>

      <div>
        <h3 className="mb-2">Custom Height (Heading)</h3>
        <SkeletonText width="60%" height={32} />
      </div>

      <div>
        <h3 className="mb-2">Without Animation</h3>
        <SkeletonText width="150px" animate={false} />
      </div>
    </div>
  );
}

// ============================================================================
// 2. SKELETON CARD EXAMPLES
// ============================================================================

export function SkeletonCardExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <div>
        <h4 className="mb-2">Basic Card</h4>
        <SkeletonCard />
      </div>

      <div>
        <h4 className="mb-2">Card with Avatar</h4>
        <SkeletonCard showAvatar />
      </div>

      <div>
        <h4 className="mb-2">Card with Footer</h4>
        <SkeletonCard showFooter />
      </div>

      <div>
        <h4 className="mb-2">Full Featured Card</h4>
        <SkeletonCard showAvatar showFooter />
      </div>

      <div>
        <h4 className="mb-2">Custom Size</h4>
        <SkeletonCard width="100%" height="250px" />
      </div>

      <div>
        <h4 className="mb-2">Without Animation</h4>
        <SkeletonCard animate={false} />
      </div>
    </div>
  );
}

// ============================================================================
// 3. SKELETON TABLE EXAMPLES
// ============================================================================

export function SkeletonTableExamples() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="mb-2">Basic Table (5 rows, 4 columns)</h3>
        <SkeletonTable />
      </div>

      <div>
        <h3 className="mb-2">Custom Rows and Columns (10 rows, 6 columns)</h3>
        <SkeletonTable rows={10} columns={6} />
      </div>

      <div>
        <h3 className="mb-2">Custom Column Widths</h3>
        <SkeletonTable 
          columns={3} 
          columnWidths={['40%', '35%', '25%']} 
        />
      </div>

      <div>
        <h3 className="mb-2">Without Header</h3>
        <SkeletonTable showHeader={false} rows={3} />
      </div>

      <div>
        <h3 className="mb-2">Compact Table (3 rows)</h3>
        <SkeletonTable rows={3} columns={5} />
      </div>
    </div>
  );
}

// ============================================================================
// 4. SKELETON AVATAR EXAMPLES
// ============================================================================

export function SkeletonAvatarExamples() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="mb-2">Small Avatar (24px)</h3>
        <SkeletonAvatar size={24} />
      </div>

      <div>
        <h3 className="mb-2">Default Avatar (40px)</h3>
        <SkeletonAvatar />
      </div>

      <div>
        <h3 className="mb-2">Medium Avatar (56px)</h3>
        <SkeletonAvatar size={56} />
      </div>

      <div>
        <h3 className="mb-2">Large Avatar (80px)</h3>
        <SkeletonAvatar size={80} />
      </div>

      <div>
        <h3 className="mb-2">Avatar with Text</h3>
        <SkeletonAvatar size={48} showText textWidth="150px" />
      </div>

      <div>
        <h3 className="mb-2">Multiple Avatars (Team List)</h3>
        <div className="flex gap-2">
          <SkeletonAvatar size={32} />
          <SkeletonAvatar size={32} />
          <SkeletonAvatar size={32} />
          <SkeletonAvatar size={32} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. ADDITIONAL SKELETON COMPONENTS
// ============================================================================

export function AdditionalSkeletonExamples() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="mb-2">Skeleton Buttons</h3>
        <div className="flex gap-2">
          <SkeletonButton width="100px" height={36} />
          <SkeletonButton width="120px" height={40} />
          <SkeletonButton width="80px" height={32} />
        </div>
      </div>

      <div>
        <h3 className="mb-2">Skeleton Badges</h3>
        <div className="flex gap-2">
          <SkeletonBadge width="60px" />
          <SkeletonBadge width="80px" />
          <SkeletonBadge width="70px" />
        </div>
      </div>

      <div>
        <h3 className="mb-2">Skeleton Images</h3>
        <div className="grid grid-cols-3 gap-4">
          <SkeletonImage aspectRatio="16/9" />
          <SkeletonImage aspectRatio="4/3" />
          <SkeletonImage aspectRatio="1/1" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. COMPOUND SKELETON PATTERNS (Pre-built Use Cases)
// ============================================================================

export function CompoundSkeletonExamples() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="mb-4">Run Card Skeletons (3 cards)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonRunCard />
          <SkeletonRunCard />
          <SkeletonRunCard />
        </div>
      </div>

      <div>
        <h3 className="mb-4">Contact Card Skeletons (4 cards)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonContactCard />
          <SkeletonContactCard />
          <SkeletonContactCard />
          <SkeletonContactCard />
        </div>
      </div>

      <div>
        <h3 className="mb-4">Dashboard Widget Skeletons (4 widgets)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonDashboardWidget />
          <SkeletonDashboardWidget />
          <SkeletonDashboardWidget />
          <SkeletonDashboardWidget />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. REAL-WORLD PAGE EXAMPLES
// ============================================================================

/**
 * Example: Runs Page Loading State
 */
export function RunsPageLoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonText width="120px" height={32} className="mb-2" />
          <SkeletonText width="250px" height={16} />
        </div>
        <SkeletonButton width="120px" height={44} />
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-3">
          <SkeletonText width="100%" height={44} />
          <SkeletonButton width="100px" height={44} />
        </div>
      </div>

      {/* Run Cards */}
      <div className="grid grid-cols-1 gap-4">
        <SkeletonRunCard />
        <SkeletonRunCard />
        <SkeletonRunCard />
        <SkeletonRunCard />
        <SkeletonRunCard />
      </div>
    </div>
  );
}

/**
 * Example: Dashboard Page Loading State
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <SkeletonText width="200px" height={32} className="mb-2" />
        <SkeletonText width="300px" height={16} />
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SkeletonDashboardWidget />
        <SkeletonDashboardWidget />
        <SkeletonDashboardWidget />
        <SkeletonDashboardWidget />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SkeletonCard height="300px" />
        <SkeletonCard height="300px" />
      </div>

      {/* Recent Activity Table */}
      <div>
        <SkeletonText width="180px" height={24} className="mb-4" />
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}

/**
 * Example: Contacts Page Loading State
 */
export function ContactsPageLoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <SkeletonText width="150px" height={32} />
        <SkeletonButton width="140px" height={44} />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-3">
        <SkeletonText width="100%" height={44} />
        <SkeletonButton width="80px" height={44} />
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonContactCard key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Profile Page Loading State
 */
export function ProfilePageLoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start gap-6 mb-6">
          <SkeletonAvatar size={96} />
          <div className="flex-1">
            <SkeletonText width="200px" height={28} className="mb-2" />
            <SkeletonText width="150px" height={16} className="mb-4" />
            <div className="flex gap-2">
              <SkeletonBadge width="80px" />
              <SkeletonBadge width="100px" />
            </div>
          </div>
          <SkeletonButton width="100px" height={40} />
        </div>
        <SkeletonText lines={3} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SkeletonDashboardWidget />
        <SkeletonDashboardWidget />
        <SkeletonDashboardWidget />
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <SkeletonText width="180px" height={24} className="mb-4" />
        <SkeletonTable rows={4} columns={4} showHeader={false} />
      </div>
    </div>
  );
}

/**
 * Example: Settings Page Loading State
 */
export function SettingsPageLoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <SkeletonText width="120px" height={32} className="mb-8" />

      {/* Settings Sections */}
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section} className="glass-card p-6">
            <SkeletonText width="180px" height={20} className="mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((field) => (
                <div key={field}>
                  <SkeletonText width="100px" height={14} className="mb-2" />
                  <SkeletonText width="100%" height={44} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6 pt-6 border-t border-border">
              <SkeletonButton width="100px" height={40} />
              <SkeletonButton width="80px" height={40} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 8. CONDITIONAL LOADING PATTERNS
// ============================================================================

/**
 * Example: Conditional Skeleton based on Loading State
 */
export function ConditionalSkeletonExample({ isLoading, data }: any) {
  if (isLoading) {
    return <RunsPageLoadingSkeleton />;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return <div>{/* Render actual data */}</div>;
}

/**
 * Example: Skeleton for List Items
 */
export function ListWithSkeleton({ items, isLoading }: any) {
  return (
    <div className="space-y-4">
      {isLoading ? (
        // Show skeletons while loading
        Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRunCard key={i} />
        ))
      ) : (
        // Show actual items
        items.map((item: any) => (
          <div key={item.id}>{/* Render item */}</div>
        ))
      )}
    </div>
  );
}

/**
 * Example: Skeleton for Data Tables
 */
export function TableWithSkeleton({ data, isLoading, columns }: any) {
  if (isLoading) {
    return <SkeletonTable rows={10} columns={columns} />;
  }

  return (
    <table>
      {/* Render actual table */}
    </table>
  );
}

// ============================================================================
// 9. BEST PRACTICES
// ============================================================================

/**
 * WHEN TO USE EACH SKELETON:
 * 
 * SkeletonText:
 * ✓ Loading headings, titles, descriptions
 * ✓ Loading paragraphs (use lines prop)
 * ✓ Loading labels and small text
 * ✗ Don't use for cards or complex layouts
 * 
 * SkeletonCard:
 * ✓ Loading list items
 * ✓ Loading grid items
 * ✓ Loading dashboard widgets
 * ✗ Don't use for tables or simple text
 * 
 * SkeletonTable:
 * ✓ Loading data tables
 * ✓ Loading lists with columns
 * ✓ Loading analytics tables
 * ✗ Don't use for simple lists (use SkeletonCard)
 * 
 * SkeletonAvatar:
 * ✓ Loading user profiles
 * ✓ Loading contact lists
 * ✓ Loading team members
 * ✗ Don't use for logos or icons (use SkeletonImage)
 * 
 * SkeletonButton:
 * ✓ Loading action buttons
 * ✓ Loading CTAs
 * ✗ Don't use for links or text buttons
 * 
 * SkeletonBadge:
 * ✓ Loading status badges
 * ✓ Loading tags
 * ✓ Loading pills
 * ✗ Don't use for buttons
 * 
 * SkeletonImage:
 * ✓ Loading photos
 * ✓ Loading thumbnails
 * ✓ Loading banners
 * ✗ Don't use for avatars (use SkeletonAvatar)
 */

/**
 * PERFORMANCE TIPS:
 * 
 * 1. Use animate={false} for many skeletons (50+) to reduce CPU
 * 2. Match skeleton dimensions to actual content
 * 3. Use compound patterns (SkeletonRunCard) instead of custom builds
 * 4. Avoid deep nesting of skeletons
 * 5. Use Suspense boundaries with skeletons for code-split components
 * 6. Limit number of visible skeletons (virtualize if needed)
 */

/**
 * ACCESSIBILITY:
 * 
 * All skeleton components include:
 * - aria-hidden="true" (don't announce to screen readers)
 * - role="status" (indicates loading state)
 * - aria-label="Loading..." (descriptive label)
 * 
 * WCAG 2.1 AA Compliant ✅
 */

export default {
  SkeletonTextExamples,
  SkeletonCardExamples,
  SkeletonTableExamples,
  SkeletonAvatarExamples,
  AdditionalSkeletonExamples,
  CompoundSkeletonExamples,
  RunsPageLoadingSkeleton,
  DashboardLoadingSkeleton,
  ContactsPageLoadingSkeleton,
  ProfilePageLoadingSkeleton,
  SettingsPageLoadingSkeleton,
};
