# Modal & Keyboard Navigation Accessibility Guide

This document outlines all modal/dialog accessibility improvements and keyboard navigation enhancements implemented in Lynqio.

---

## 🎯 **Modal Accessibility Features**

### **Core Modal Components Updated**

1. ✅ **SessionTimeoutModal.tsx** - Session expiration dialog
2. ✅ **TaskModal.tsx** - Task creation/editing  
3. ✅ **EditContactModal.tsx** - Contact editing
4. ✅ **GlobalSearchModal.tsx** - Global search
5. ✅ **AccessibleModal.tsx** - Reference implementation

---

## 📋 **Modal Accessibility Checklist**

Every modal now includes:

### **1. ARIA Roles and Labels**
```tsx
<div
  ref={modalRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={descId}
  className="modal-content"
>
  <h2 id={titleId}>Modal Title</h2>
  <p id={descId} className="sr-only">
    Description of modal purpose
  </p>
</div>
```

**Purpose:**
- `role="dialog"` - Identifies as dialog
- `aria-modal="true"` - Indicates modal behavior
- `aria-labelledby` - Links to title element
- `aria-describedby` - Links to description

---

### **2. Focus Trapping**
```tsx
import { trapFocus } from '../utils/accessibility';

const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen && modalRef.current) {
    const cleanup = trapFocus(modalRef.current);
    return cleanup;
  }
}, [isOpen]);
```

**Purpose:**
- Keeps keyboard focus within modal
- Prevents tabbing to background content
- Cycles focus from last to first element

---

### **3. Escape Key Handling**
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

**Purpose:**
- Standard keyboard shortcut to close dialogs
- Intuitive user experience
- Accessibility requirement

---

### **4. Focus Restoration**
```tsx
const triggerRef = useRef<HTMLElement | null>(null);

// Capture trigger element when opening
const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
  triggerRef.current = e.currentTarget;
  setIsOpen(true);
};

// Restore focus when closing
useEffect(() => {
  if (!isOpen && triggerRef.current) {
    triggerRef.current.focus();
  }
}, [isOpen]);
```

**Purpose:**
- Returns focus to element that opened modal
- Maintains keyboard navigation context
- Improves user orientation

---

### **5. Backdrop Accessibility**
```tsx
<div
  className="modal-backdrop"
  onClick={onClose}
  aria-hidden="true"
>
  <div
    ref={modalRef}
    role="dialog"
    aria-modal="true"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Modal content */}
  </div>
</div>
```

**Purpose:**
- `aria-hidden="true"` on backdrop - hidden from screen readers
- `stopPropagation()` on modal - prevents backdrop click from closing
- Click-outside-to-close functionality

---

### **6. Close Button**
```tsx
<button
  onClick={onClose}
  aria-label="Close dialog"
  className="close-button"
>
  <X className="w-5 h-5" aria-hidden="true" />
</button>
```

**Purpose:**
- Clear accessible name
- Icon marked as decorative
- Keyboard accessible

---

## ⌨️ **Keyboard Navigation**

### **Modal Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| **Escape** | Close modal |
| **Tab** | Move to next focusable element |
| **Shift + Tab** | Move to previous focusable element |
| **Enter** | Submit form / Select option |
| **Space** | Activate button / Select option |

---

## 🔍 **Search Component Accessibility**

### **AccessibleSearch.tsx Features**

```tsx
<div role="search" aria-label="Search">
  <label htmlFor="search-input" className="sr-only">
    Search
  </label>
  
  <input
    id="search-input"
    type="search"
    role="searchbox"
    aria-label="Search prospects by name, company, or title"
    aria-expanded={isExpanded}
    aria-controls="results-list"
    aria-activedescendant={selectedResultId}
    aria-autocomplete="list"
    placeholder="Search..."
  />
  
  <div
    id="results-list"
    role="listbox"
    aria-label="Search results"
  >
    <div
      role="option"
      aria-selected={isSelected}
    >
      {/* Result content */}
    </div>
  </div>
  
  {/* Live region for announcements */}
  <div role="status" aria-live="polite" className="sr-only">
    {resultCount} results found
  </div>
</div>
```

### **Search Keyboard Navigation**

| Key | Action |
|-----|--------|
| **Arrow Down** | Move to next result |
| **Arrow Up** | Move to previous result |
| **Enter** | Select result |
| **Escape** | Close results / Clear search |
| **Tab** | Move focus away from search |

### **Features:**
- ✅ Live region announces result count
- ✅ `aria-activedescendant` tracks selected result
- ✅ `aria-autocomplete="list"` indicates suggestions
- ✅ Screen reader instructions provided

---

## 📊 **Table/List Keyboard Navigation**

### **Table Accessibility**

```tsx
import { handleTableKeyboard, getTableRowProps } from '../utils/tableKeyboardNav';

function DataTable({ items }: { items: Item[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const newIndex = handleTableKeyboard(
      e,
      index,
      items.length,
      items,
      {
        onActivate: (idx, id) => {
          // Navigate to detail page
          navigate(`/items/${id}`);
        },
        onSelect: (idx, id) => {
          // Toggle selection
          setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            return next;
          });
        },
        enableHomeEnd: true,
        enablePageUpDown: true,
        pageSize: 10
      }
    );
    
    if (newIndex !== index) {
      setFocusedIndex(newIndex);
    }
  };

  return (
    <table role="table" aria-label="Items list">
      <thead>
        <tr role="row">
          <th role="columnheader" scope="col">Name</th>
          <th role="columnheader" scope="col">Status</th>
          <th role="columnheader" scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const rowProps = getTableRowProps(
            index,
            selectedIds.has(item.id),
            focusedIndex === index
          );
          
          return (
            <tr
              key={item.id}
              {...rowProps}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              className={focusedIndex === index ? 'focused' : ''}
            >
              <td role="cell">{item.name}</td>
              <td role="cell">{item.status}</td>
              <td role="cell">
                <button onClick={() => handleEdit(item)}>Edit</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

### **Table Keyboard Navigation**

| Key | Action |
|-----|--------|
| **Arrow Down** | Move to next row |
| **Arrow Up** | Move to previous row |
| **Home** | Jump to first row |
| **End** | Jump to last row |
| **Page Down** | Jump down one page |
| **Page Up** | Jump up one page |
| **Enter** | Activate row (e.g., navigate to detail) |
| **Space** | Select row |
| **S** | Toggle selection (when not typing) |

### **Features:**
- ✅ `role="table"` on table element
- ✅ `role="row"` on tr elements
- ✅ `role="columnheader"` on th elements
- ✅ `role="cell"` on td elements
- ✅ `tabIndex={0}` on focused row only
- ✅ `aria-selected` on selected rows
- ✅ `aria-rowindex` for position

---

## 🎨 **Card List Accessibility**

```tsx
<ul role="list" aria-label="Pipeline deals">
  {items.map((item) => (
    <li 
      role="listitem" 
      key={item.id}
      tabIndex={0}
      aria-label={`${item.name} from ${item.company}, status: ${item.status}`}
    >
      <div className="card-content">
        {/* Card content */}
      </div>
    </li>
  ))}
</ul>
```

---

## 🎪 **Drag and Drop Accessibility**

### **Keyboard-Accessible Drag & Drop**

```tsx
<div
  ref={drag}
  role="button"
  tabIndex={0}
  aria-label={`${prospect.name} from ${prospect.company}, currently in ${stage.name} stage. Press Enter to move to different stage.`}
  aria-grabbed={isDragging}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Open stage selector modal
      setSelectedForMove(prospect);
      setStageSelectModal(true);
    }
  }}
  className="draggable-card"
>
  {/* Card content */}
</div>

{/* Drop zone */}
<div
  ref={drop}
  aria-dropeffect="move"
  aria-label={`${stage.label} stage, ${prospects.length} prospects`}
  className="drop-zone"
>
  {/* Column content */}
</div>

{/* Live region for announcements */}
<div 
  aria-live="assertive" 
  aria-atomic="true"
  className="sr-only"
>
  {dragAnnouncement}
</div>
```

### **Features:**
- ✅ `role="button"` on draggable items
- ✅ `aria-grabbed` indicates drag state
- ✅ `aria-dropeffect="move"` on drop zones
- ✅ Keyboard alternative (Enter to open stage selector)
- ✅ Live region announces drag/drop actions

### **Drag & Drop Announcements:**
```tsx
// When starting drag
"Picked up ${prospect.name}"

// When dropping
"Moved ${prospect.name} to ${stage.name} stage"

// When canceling
"Canceled move for ${prospect.name}"
```

---

## 🧪 **Testing Your Modals**

### **Keyboard Testing**
1. **Open modal** with mouse or keyboard
2. Press **Tab** → Focus should stay within modal
3. Press **Shift+Tab** → Focus should cycle backwards
4. Press **Escape** → Modal should close
5. **Verify focus returns** to trigger element

### **Screen Reader Testing**
1. **Open with screen reader active**
2. **Verify announcement:** "Dialog. [Title]"
3. **Navigate with arrow keys**
4. **Verify all content is announced**
5. **Close and verify focus restoration**

### **Focus Trap Testing**
1. **Tab through all focusable elements**
2. **Verify focus doesn't leave modal**
3. **Verify focus cycles** from last to first
4. **Test with screen reader virtual cursor**

---

## 📚 **ARIA Patterns Used**

### **Dialog Pattern**
- `role="dialog"` - Dialog container
- `aria-modal="true"` - Modal behavior
- `aria-labelledby` - Title reference
- `aria-describedby` - Description reference

### **Combobox Pattern (Search)**
- `role="searchbox"` - Search input
- `role="listbox"` - Results container
- `role="option"` - Individual result
- `aria-expanded` - Dropdown state
- `aria-activedescendant` - Active result

### **Grid/Table Pattern**
- `role="table"` - Table container
- `role="row"` - Table row
- `role="columnheader"` - Header cell
- `role="cell"` - Data cell
- `aria-selected` - Selection state
- `aria-rowindex` - Row position

---

## ✅ **Accessibility Standards Met**

- ✅ **WCAG 2.1 Level AA** compliant
- ✅ **WAI-ARIA 1.2** authoring practices
- ✅ **Keyboard-only operation** supported
- ✅ **Screen reader compatible**
- ✅ **Focus management** implemented
- ✅ **Live regions** for announcements
- ✅ **Semantic HTML** structure

---

## 🚀 **Implementation Examples**

### **Quick Modal Template**
```tsx
import { useRef, useEffect } from 'react';
import { trapFocus, generateId } from '../utils/accessibility';

function MyModal({ isOpen, onClose }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = generateId('modal-title');
  const descId = generateId('modal-desc');

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);
      return cleanup;
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} aria-hidden="true">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>My Modal</h2>
        <p id={descId} className="sr-only">Modal description</p>
        {/* Content */}
      </div>
    </div>
  );
}
```

---

**Last Updated**: December 28, 2024  
**Standards**: WCAG 2.1 AA, WAI-ARIA 1.2
