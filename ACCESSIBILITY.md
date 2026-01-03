# Accessibility Utilities Guide

This guide explains how to use the accessibility utilities in the Lynqio platform to create an inclusive experience for all users, including those using screen readers, keyboard navigation, and assistive technologies.

## 📚 **Table of Contents**

1. [Core Utilities](#core-utilities)
2. [React Hooks](#react-hooks)
3. [Components](#components)
4. [CSS Classes](#css-classes)
5. [Best Practices](#best-practices)

---

## 🛠️ **Core Utilities**

Located in `/src/app/utils/accessibility.ts`

### **trapFocus()**

Trap keyboard focus within a container (useful for modals/dialogs).

```typescript
import { trapFocus } from './utils/accessibility';

const modal = document.getElementById('my-modal');
const cleanup = trapFocus(modal);

// Later, when closing the modal:
cleanup();
```

### **announce()**

Announce messages to screen readers without visual display.

```typescript
import { announce } from './utils/accessibility';

// Non-urgent announcement (default)
announce('Your changes have been saved');

// Urgent/important announcement
announce('Error: Please fix the required fields', 'assertive');
```

**Use cases:**
- Form validation errors
- Data loading states
- Operation success/failure messages
- Dynamic content updates

### **handleListKeyboard()**

Handle arrow key navigation in lists.

```typescript
import { handleListKeyboard } from './utils/accessibility';

function MyList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemRefs = useRef<HTMLElement[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const newIndex = handleListKeyboard(
      e,
      itemRefs.current,
      currentIndex,
      (index) => {
        console.log('Selected item:', index);
      }
    );
    setCurrentIndex(newIndex);
  };

  return (
    <div onKeyDown={handleKeyDown} role="list">
      {/* List items */}
    </div>
  );
}
```

### **generateId()**

Generate unique IDs for ARIA relationships.

```typescript
import { generateId } from './utils/accessibility';

const labelId = generateId('label');
const descriptionId = generateId('description');

<div>
  <label id={labelId}>Username</label>
  <input aria-labelledby={labelId} aria-describedby={descriptionId} />
  <span id={descriptionId}>Must be 3-20 characters</span>
</div>
```

---

## 🎣 **React Hooks**

Located in `/src/app/utils/accessibilityHooks.ts`

### **useAriaId()**

Generate stable unique IDs for ARIA attributes.

```typescript
import { useAriaId } from './utils/accessibilityHooks';

function FormField() {
  const inputId = useAriaId('input');
  const errorId = useAriaId('error');

  return (
    <>
      <label htmlFor={inputId}>Email</label>
      <input id={inputId} aria-describedby={errorId} />
      <span id={errorId} role="alert">Invalid email</span>
    </>
  );
}
```

### **useAnnounce()**

Hook version of announce() for React components.

```typescript
import { useAnnounce } from './utils/accessibilityHooks';

function SaveButton() {
  const announce = useAnnounce();

  const handleSave = async () => {
    try {
      await saveData();
      announce('Data saved successfully');
    } catch (error) {
      announce('Error saving data', 'assertive');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### **useListNavigation()**

Comprehensive keyboard navigation for lists.

```typescript
import { useListNavigation } from './utils/accessibilityHooks';

function ContactList({ contacts }) {
  const { listRef, focusedIndex, handleKeyDown } = useListNavigation(
    contacts.length,
    (index) => {
      console.log('Selected contact:', contacts[index]);
    }
  );

  return (
    <div 
      ref={listRef} 
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label="Contact list"
    >
      {contacts.map((contact, i) => (
        <div
          key={contact.id}
          role="option"
          aria-selected={i === focusedIndex}
          tabIndex={i === focusedIndex ? 0 : -1}
        >
          {contact.name}
        </div>
      ))}
    </div>
  );
}
```

### **useFocusRestore()**

Save and restore focus when opening/closing modals.

```typescript
import { useFocusRestore } from './utils/accessibilityHooks';

function Modal({ isOpen, onClose }) {
  const { saveFocus, restoreFocus } = useFocusRestore();

  useEffect(() => {
    if (isOpen) {
      saveFocus();
    } else {
      restoreFocus();
    }
  }, [isOpen]);

  // ...
}
```

### **useKeyboardNavigation()**

Detect if user is navigating with keyboard (for styling focus indicators).

```typescript
import { useKeyboardNavigation } from './utils/accessibilityHooks';

function App() {
  const isKeyboardUser = useKeyboardNavigation();

  return (
    <div className={isKeyboardUser ? 'keyboard-focus' : ''}>
      {/* App content */}
    </div>
  );
}
```

### **useEscapeKey()**

Handle Escape key to close modals/dialogs.

```typescript
import { useEscapeKey } from './utils/accessibilityHooks';

function Dialog({ isOpen, onClose }) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true">
      {/* Dialog content */}
    </div>
  );
}
```

### **useRovingTabIndex()**

Implement roving tabindex pattern (single tab stop for lists).

```typescript
import { useRovingTabIndex } from './utils/accessibilityHooks';

function Toolbar({ buttons }) {
  const { getTabIndex, handleKeyDown } = useRovingTabIndex(buttons.length);

  return (
    <div role="toolbar">
      {buttons.map((button, i) => (
        <button
          key={button.id}
          tabIndex={getTabIndex(i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 🧩 **Components**

### **SkipLink**

Located in `/src/app/components/SkipLink.tsx`

Allows keyboard users to skip repetitive navigation.

```typescript
import { SkipLink } from './components/SkipLink';

function App() {
  return (
    <>
      <SkipLink targetId="main-content" text="Skip to main content" />
      <nav>{/* Navigation */}</nav>
      <main id="main-content" tabIndex={-1}>
        {/* Main content */}
      </main>
    </>
  );
}
```

### **FocusTrap**

Located in `/src/app/components/FocusTrap.tsx`

Trap focus within modals and dialogs.

```typescript
import { FocusTrap } from './components/FocusTrap';

function Modal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <FocusTrap active={isOpen} onEscape={onClose}>
      <div role="dialog" aria-modal="true">
        <h2>Modal Title</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </FocusTrap>
  );
}
```

### **LiveRegion**

Located in `/src/app/components/LiveRegion.tsx`

Announce dynamic content changes to screen readers.

```typescript
import { LiveRegion } from './components/LiveRegion';

function DataTable() {
  const [statusMessage, setStatusMessage] = useState('');

  const handleSort = () => {
    setStatusMessage('Table sorted by name, ascending');
  };

  return (
    <>
      <LiveRegion message={statusMessage} priority="polite" clearAfter={3000} />
      <table>{/* Table content */}</table>
    </>
  );
}
```

---

## 🎨 **CSS Classes**

Located in `/src/styles/theme.css`

### **`.sr-only`**

Hide content visually but keep it accessible to screen readers.

```html
<button>
  <span className="sr-only">Delete</span>
  <TrashIcon />
</button>
```

### **`.skip-link`**

Styled skip link (hidden until focused).

```html
<a href="#main" className="skip-link">Skip to main content</a>
```

### **`.focus-visible`**

Enhanced focus styles for keyboard navigation.

```html
<button className="focus-visible">
  Click me
</button>
```

### **`.focus-ring`**

Add a prominent focus ring with shadow.

```html
<input className="focus-ring" type="text" />
```

---

## ✅ **Best Practices**

### **1. Always Provide Text Alternatives**

```typescript
// ✅ Good
<button aria-label="Delete contact">
  <TrashIcon />
</button>

// ❌ Bad
<button>
  <TrashIcon />
</button>
```

### **2. Use Semantic HTML**

```typescript
// ✅ Good
<button onClick={handleClick}>Submit</button>

// ❌ Bad
<div onClick={handleClick}>Submit</div>
```

### **3. Announce Dynamic Changes**

```typescript
// ✅ Good
import { announce } from './utils/accessibility';

function DataTable() {
  const handleDelete = () => {
    deleteItem();
    announce('Item deleted successfully');
  };
}

// ❌ Bad - no announcement
function DataTable() {
  const handleDelete = () => {
    deleteItem();
    // Silent operation
  };
}
```

### **4. Manage Focus in Modals**

```typescript
// ✅ Good
import { FocusTrap } from './components/FocusTrap';
import { useFocusRestore } from './utils/accessibilityHooks';

function Modal({ isOpen, onClose }) {
  const { saveFocus, restoreFocus } = useFocusRestore();

  useEffect(() => {
    if (isOpen) saveFocus();
    return () => restoreFocus();
  }, [isOpen]);

  return (
    <FocusTrap active={isOpen} onEscape={onClose}>
      {/* Modal content */}
    </FocusTrap>
  );
}
```

### **5. Keyboard Navigation for Lists**

```typescript
// ✅ Good
import { useListNavigation } from './utils/accessibilityHooks';

function Menu() {
  const { listRef, handleKeyDown } = useListNavigation(items.length);

  return (
    <ul ref={listRef} onKeyDown={handleKeyDown} role="menu">
      {/* Menu items */}
    </ul>
  );
}
```

### **6. Use ARIA Roles Appropriately**

```typescript
// ✅ Good - semantic HTML doesn't need ARIA
<button>Click me</button>

// ⚠️ Acceptable - when semantic HTML isn't possible
<div role="button" tabIndex={0} onKeyDown={handleKeyPress}>
  Click me
</div>

// ❌ Bad - redundant ARIA
<button role="button">Click me</button>
```

### **7. Test with Keyboard Only**

- Use **Tab** to navigate forward
- Use **Shift+Tab** to navigate backward
- Use **Enter** or **Space** to activate buttons
- Use **Arrow keys** for lists and menus
- Use **Escape** to close modals

### **8. Provide Loading States**

```typescript
import { LiveRegion } from './components/LiveRegion';

function DataList() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <LiveRegion 
        message={loading ? 'Loading data...' : 'Data loaded'} 
        priority="polite"
      />
      {/* List content */}
    </>
  );
}
```

---

## 🧪 **Testing Checklist**

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Skip link works and is visible on focus
- [ ] Screen reader announces dynamic changes
- [ ] Modal focus is trapped and restored properly
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Error messages are announced
- [ ] Color contrast meets WCAG AA standards
- [ ] Reduced motion preference is respected

---

## 📖 **Resources**

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

---

**Remember:** Accessibility is not optional—it's essential for creating inclusive SaaS products that serve all users effectively! 🌟
