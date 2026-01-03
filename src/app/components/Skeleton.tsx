import React from 'react';

/**
 * ============================================================================
 * SKELETON LOADING COMPONENTS
 * ============================================================================
 * 
 * Reusable skeleton components for loading states with shimmer animations.
 * Provides consistent loading UX across the Lynqio platform.
 * 
 * Components:
 * - SkeletonText: Single line text skeleton
 * - SkeletonCard: Card-shaped skeleton for list items
 * - SkeletonTable: Table with skeleton rows
 * - SkeletonAvatar: Circular skeleton for avatars
 * 
 * Features:
 * - Shimmer animation (linear gradient moving left to right)
 * - Pulse animation for subtle movement
 * - Theme-aware colors (dark/light mode)
 * - Fully customizable dimensions
 * - Accessibility-friendly (aria-hidden, role="status")
 */

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

interface BaseSkeletonProps {
  /** Width of skeleton (px, %, rem, etc.) */
  width?: string | number;
  /** Height of skeleton (px, %, rem, etc.) */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Enable shimmer animation (default: true) */
  animate?: boolean;
  /** Border radius */
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
}

const BaseSkeleton: React.FC<BaseSkeletonProps> = ({
  width,
  height,
  className = '',
  animate = true,
  rounded = 'md',
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const shimmerClass = animate ? 'skeleton-shimmer' : 'skeleton-static';

  const styles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${shimmerClass} ${roundedClasses[rounded]} ${className}`}
      style={styles}
      aria-hidden="true"
      role="status"
      aria-label="Loading..."
    />
  );
};

// ============================================================================
// 1. SKELETON TEXT
// ============================================================================

interface SkeletonTextProps {
  /** Width of text line (default: '100%') */
  width?: string | number;
  /** Height of text line (default: 16px) */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Enable shimmer animation (default: true) */
  animate?: boolean;
  /** Number of lines to render (default: 1) */
  lines?: number;
  /** Gap between lines in pixels (default: 8) */
  lineGap?: number;
}

/**
 * SkeletonText - Single or multi-line text skeleton
 * 
 * Use for:
 * - Loading paragraph text
 * - Loading titles/headings
 * - Loading descriptions
 * 
 * @example
 * ```tsx
 * // Single line
 * <SkeletonText width="200px" />
 * 
 * // Multiple lines
 * <SkeletonText lines={3} width="100%" />
 * 
 * // Custom height
 * <SkeletonText height={24} width="300px" />
 * ```
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = '100%',
  height = 16,
  className = '',
  animate = true,
  lines = 1,
  lineGap = 8,
}) => {
  if (lines === 1) {
    return (
      <BaseSkeleton
        width={width}
        height={height}
        className={className}
        animate={animate}
        rounded="sm"
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <BaseSkeleton
          key={index}
          width={index === lines - 1 ? '80%' : width} // Last line shorter
          height={height}
          className={className}
          animate={animate}
          rounded="sm"
        />
      ))}
    </div>
  );
};

// ============================================================================
// 2. SKELETON CARD
// ============================================================================

interface SkeletonCardProps {
  /** Width of card (default: '100%') */
  width?: string | number;
  /** Height of card (default: '200px') */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Enable shimmer animation (default: true) */
  animate?: boolean;
  /** Show avatar in card (default: false) */
  showAvatar?: boolean;
  /** Show title text (default: true) */
  showTitle?: boolean;
  /** Show description text (default: true) */
  showDescription?: boolean;
  /** Show footer actions (default: false) */
  showFooter?: boolean;
}

/**
 * SkeletonCard - Card-shaped skeleton for list items
 * 
 * Use for:
 * - Loading run cards
 * - Loading contact cards
 * - Loading dashboard widgets
 * - Loading list items
 * 
 * @example
 * ```tsx
 * // Basic card
 * <SkeletonCard />
 * 
 * // Card with avatar
 * <SkeletonCard showAvatar />
 * 
 * // Custom dimensions
 * <SkeletonCard width="350px" height="180px" />
 * 
 * // Full featured card
 * <SkeletonCard showAvatar showFooter />
 * ```
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height,
  className = '',
  animate = true,
  showAvatar = false,
  showTitle = true,
  showDescription = true,
  showFooter = false,
}) => {
  const cardHeight = height || (showAvatar || showFooter ? '180px' : '120px');

  return (
    <div
      className={`glass-card p-4 md:p-6 ${className}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
    >
      {/* Header with optional avatar */}
      <div className="flex items-start gap-4 mb-4">
        {showAvatar && (
          <BaseSkeleton
            width={48}
            height={48}
            animate={animate}
            rounded="full"
          />
        )}
        <div className="flex-1">
          {showTitle && (
            <BaseSkeleton
              width="60%"
              height={20}
              animate={animate}
              rounded="sm"
              className="mb-2"
            />
          )}
          {showDescription && (
            <BaseSkeleton
              width="40%"
              height={14}
              animate={animate}
              rounded="sm"
            />
          )}
        </div>
      </div>

      {/* Content lines */}
      {showDescription && (
        <div className="space-y-2 mb-4">
          <BaseSkeleton width="100%" height={12} animate={animate} rounded="sm" />
          <BaseSkeleton width="90%" height={12} animate={animate} rounded="sm" />
          <BaseSkeleton width="75%" height={12} animate={animate} rounded="sm" />
        </div>
      )}

      {/* Footer actions */}
      {showFooter && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <BaseSkeleton width={80} height={32} animate={animate} rounded="md" />
          <BaseSkeleton width={80} height={32} animate={animate} rounded="md" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. SKELETON TABLE
// ============================================================================

interface SkeletonTableProps {
  /** Number of rows to display (default: 5) */
  rows?: number;
  /** Number of columns to display (default: 4) */
  columns?: number;
  /** Additional CSS classes */
  className?: string;
  /** Enable shimmer animation (default: true) */
  animate?: boolean;
  /** Show table header (default: true) */
  showHeader?: boolean;
  /** Custom column widths (e.g., ['20%', '30%', '25%', '25%']) */
  columnWidths?: string[];
}

/**
 * SkeletonTable - Table with skeleton rows
 * 
 * Use for:
 * - Loading data tables
 * - Loading run lists
 * - Loading contact lists
 * - Loading analytics tables
 * 
 * @example
 * ```tsx
 * // Basic table (5 rows, 4 columns)
 * <SkeletonTable />
 * 
 * // Custom rows and columns
 * <SkeletonTable rows={10} columns={6} />
 * 
 * // Custom column widths
 * <SkeletonTable 
 *   columns={3} 
 *   columnWidths={['40%', '30%', '30%']} 
 * />
 * 
 * // Without header
 * <SkeletonTable showHeader={false} />
 * ```
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
  animate = true,
  showHeader = true,
  columnWidths,
}) => {
  const defaultColumnWidth = `${100 / columns}%`;

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {/* Table Header */}
      {showHeader && (
        <div className="grid gap-4 p-4 border-b border-border" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <BaseSkeleton
              key={`header-${colIndex}`}
              width={columnWidths?.[colIndex] || '80%'}
              height={14}
              animate={animate}
              rounded="sm"
            />
          ))}
        </div>
      )}

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <BaseSkeleton
              key={`cell-${rowIndex}-${colIndex}`}
              width={columnWidths?.[colIndex] || '90%'}
              height={16}
              animate={animate}
              rounded="sm"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 4. SKELETON AVATAR
// ============================================================================

interface SkeletonAvatarProps {
  /** Size of avatar in pixels (default: 40) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Enable shimmer animation (default: true) */
  animate?: boolean;
  /** Show text next to avatar (default: false) */
  showText?: boolean;
  /** Width of text if showText is true */
  textWidth?: string | number;
}

/**
 * SkeletonAvatar - Circular skeleton for avatars
 * 
 * Use for:
 * - Loading user avatars
 * - Loading profile pictures
 * - Loading team member icons
 * - Loading contact photos
 * 
 * @example
 * ```tsx
 * // Basic avatar (40px)
 * <SkeletonAvatar />
 * 
 * // Large avatar (80px)
 * <SkeletonAvatar size={80} />
 * 
 * // Avatar with name text
 * <SkeletonAvatar showText textWidth="120px" />
 * 
 * // Small avatar (24px)
 * <SkeletonAvatar size={24} />
 * ```
 */
export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  className = '',
  animate = true,
  showText = false,
  textWidth = '100px',
}) => {
  if (showText) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <BaseSkeleton
          width={size}
          height={size}
          animate={animate}
          rounded="full"
        />
        <div className="flex-1 space-y-2">
          <BaseSkeleton width={textWidth} height={14} animate={animate} rounded="sm" />
          <BaseSkeleton width="60%" height={12} animate={animate} rounded="sm" />
        </div>
      </div>
    );
  }

  return (
    <BaseSkeleton
      width={size}
      height={size}
      className={className}
      animate={animate}
      rounded="full"
    />
  );
};

// ============================================================================
// ADDITIONAL SKELETON VARIANTS
// ============================================================================

/**
 * SkeletonButton - Button-shaped skeleton
 */
export const SkeletonButton: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}> = ({ width = '120px', height = 40, className = '', animate = true }) => (
  <BaseSkeleton
    width={width}
    height={height}
    className={className}
    animate={animate}
    rounded="lg"
  />
);

/**
 * SkeletonBadge - Badge-shaped skeleton
 */
export const SkeletonBadge: React.FC<{
  width?: string | number;
  className?: string;
  animate?: boolean;
}> = ({ width = '60px', className = '', animate = true }) => (
  <BaseSkeleton
    width={width}
    height={24}
    className={className}
    animate={animate}
    rounded="full"
  />
);

/**
 * SkeletonImage - Image placeholder skeleton
 */
export const SkeletonImage: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
}> = ({ 
  width = '100%', 
  height, 
  className = '', 
  animate = true,
  aspectRatio = 'auto'
}) => {
  const aspectRatioStyles: Record<string, string> = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    'auto': ''
  };

  return (
    <BaseSkeleton
      width={width}
      height={height}
      className={`${aspectRatioStyles[aspectRatio]} ${className}`}
      animate={animate}
      rounded="md"
    />
  );
};

// ============================================================================
// COMPOUND SKELETON PATTERNS
// ============================================================================

/**
 * SkeletonRunCard - Specific skeleton for run list items
 */
export const SkeletonRunCard: React.FC<{ animate?: boolean }> = ({ 
  animate = true 
}) => (
  <div className="glass-card p-4 md:p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <BaseSkeleton width="70%" height={20} animate={animate} rounded="sm" className="mb-2" />
        <BaseSkeleton width="40%" height={14} animate={animate} rounded="sm" />
      </div>
      <SkeletonBadge width="80px" animate={animate} />
    </div>
    <div className="space-y-2">
      <BaseSkeleton width="100%" height={12} animate={animate} rounded="sm" />
      <BaseSkeleton width="60%" height={12} animate={animate} rounded="sm" />
    </div>
    <div className="flex gap-4 mt-4 pt-4 border-t border-border">
      <BaseSkeleton width="100px" height={10} animate={animate} rounded="sm" />
      <BaseSkeleton width="80px" height={10} animate={animate} rounded="sm" />
    </div>
  </div>
);

/**
 * SkeletonContactCard - Specific skeleton for contact list items
 */
export const SkeletonContactCard: React.FC<{ animate?: boolean }> = ({ 
  animate = true 
}) => (
  <div className="glass-card p-4">
    <div className="flex items-center gap-3 mb-3">
      <SkeletonAvatar size={48} animate={animate} />
      <div className="flex-1">
        <BaseSkeleton width="60%" height={16} animate={animate} rounded="sm" className="mb-1" />
        <BaseSkeleton width="40%" height={12} animate={animate} rounded="sm" />
      </div>
    </div>
    <div className="space-y-1">
      <BaseSkeleton width="100%" height={10} animate={animate} rounded="sm" />
      <BaseSkeleton width="80%" height={10} animate={animate} rounded="sm" />
    </div>
  </div>
);

/**
 * SkeletonDashboardWidget - Skeleton for dashboard stat cards
 */
export const SkeletonDashboardWidget: React.FC<{ animate?: boolean }> = ({ 
  animate = true 
}) => (
  <div className="glass-card p-6">
    <BaseSkeleton width="40%" height={14} animate={animate} rounded="sm" className="mb-4" />
    <BaseSkeleton width="60%" height={32} animate={animate} rounded="sm" className="mb-2" />
    <BaseSkeleton width="30%" height={12} animate={animate} rounded="sm" />
  </div>
);

/**
 * SkeletonTableRow - Skeleton for table rows (used in data tables)
 */
export const SkeletonTableRow: React.FC<{ 
  animate?: boolean;
  columns?: number;
}> = ({ 
  animate = true,
  columns = 5
}) => (
  <tr>
    {Array.from({ length: columns }).map((_, colIndex) => (
      <td key={`skeleton-col-${colIndex}`} className="px-6 py-4">
        <BaseSkeleton 
          width={colIndex === 0 ? "80%" : "60%"} 
          height={16} 
          animate={animate} 
          rounded="sm" 
        />
        {colIndex === 0 && (
          <BaseSkeleton 
            width="50%" 
            height={12} 
            animate={animate} 
            rounded="sm" 
            className="mt-1"
          />
        )}
      </td>
    ))}
  </tr>
);

// Generic Skeleton export for backwards compatibility
export const Skeleton = BaseSkeleton;