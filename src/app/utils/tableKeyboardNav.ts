/**
 * Table/List Keyboard Navigation Utility
 * Handles keyboard navigation for data tables and lists
 */

interface KeyboardNavigationOptions {
  onSelect?: (index: number, id: string) => void;
  onActivate?: (index: number, id: string) => void;
  enableHomeEnd?: boolean;
  enablePageUpDown?: boolean;
  pageSize?: number;
}

/**
 * Handle keyboard navigation in tables/lists
 * @param e - Keyboard event
 * @param currentIndex - Currently focused row index
 * @param totalItems - Total number of items
 * @param items - Array of item IDs
 * @param options - Navigation options
 * @returns New focused index
 */
export function handleTableKeyboard(
  e: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  items: Array<{ id: string }>,
  options: KeyboardNavigationOptions = {}
): number {
  const {
    onSelect,
    onActivate,
    enableHomeEnd = true,
    enablePageUpDown = false,
    pageSize = 10
  } = options;

  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      newIndex = Math.min(currentIndex + 1, totalItems - 1);
      break;

    case 'ArrowUp':
      e.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;

    case 'Home':
      if (enableHomeEnd) {
        e.preventDefault();
        newIndex = 0;
      }
      break;

    case 'End':
      if (enableHomeEnd) {
        e.preventDefault();
        newIndex = totalItems - 1;
      }
      break;

    case 'PageUp':
      if (enablePageUpDown) {
        e.preventDefault();
        newIndex = Math.max(currentIndex - pageSize, 0);
      }
      break;

    case 'PageDown':
      if (enablePageUpDown) {
        e.preventDefault();
        newIndex = Math.min(currentIndex + pageSize, totalItems - 1);
      }
      break;

    case 'Enter':
    case ' ':
      e.preventDefault();
      if (onActivate && items[currentIndex]) {
        onActivate(currentIndex, items[currentIndex].id);
      }
      break;

    case 's':
    case 'S':
      if (e.ctrlKey || e.metaKey) {
        // Allow Ctrl+S/Cmd+S to bubble up
        break;
      }
      if (onSelect && items[currentIndex]) {
        e.preventDefault();
        onSelect(currentIndex, items[currentIndex].id);
      }
      break;
  }

  return newIndex;
}

/**
 * Create ARIA props for table row
 * @param index - Row index
 * @param isSelected - Whether row is selected
 * @param isFocused - Whether row is currently focused
 * @returns Object with ARIA props
 */
export function getTableRowProps(
  index: number,
  isSelected: boolean,
  isFocused: boolean
) {
  return {
    role: 'row',
    tabIndex: isFocused ? 0 : -1,
    'aria-selected': isSelected,
    'aria-rowindex': index + 1,
  };
}

/**
 * Announce table navigation to screen readers
 * @param currentIndex - Current index
 * @param totalItems - Total items
 * @param itemName - Name of current item
 * @returns Announcement message
 */
export function getTableNavigationAnnouncement(
  currentIndex: number,
  totalItems: number,
  itemName: string
): string {
  return `Row ${currentIndex + 1} of ${totalItems}. ${itemName}. Use arrow keys to navigate, Enter to select.`;
}
