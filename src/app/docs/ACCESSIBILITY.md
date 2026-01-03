# Accessibility Guide for Lynqio

This document outlines the accessibility features and best practices implemented in Lynqio.

## 🎯 Overview

Lynqio is built with accessibility as a core principle, ensuring all users can navigate and use the platform effectively, regardless of their abilities or input methods.

---

## ✨ Features Implemented

### 1. **Keyboard Navigation**

#### Skip to Main Content
- Press **Tab** after page load to reveal the "Skip to main content" link
- Press **Enter** to jump directly to the main content area
- Bypasses navigation for faster access

#### Focus Management
- All interactive elements are keyboard accessible
- Clear visual focus indicators with cyan brand color
- Logical tab order throughout the application

#### Keyboard Shortcuts
- **Cmd/Ctrl + K**: Open global search
- **Tab**: Navigate forward
- **Shift + Tab**: Navigate backward
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dialogs
- **Arrow Keys**: Navigate lists and dropdowns

---

### 2. **Screen Reader Support**

#### ARIA Labels and Roles
All interactive elements include proper ARIA labels:
- Buttons describe their action
- Icons have accessible names
- Forms have associated labels
- Dynamic content updates are announced

#### Live Regions
Screen readers announce important updates:
- Success/error messages
- Loading states
- Dynamic content changes

---

### 3. **Visual Accessibility**

#### Focus Indicators
```css
/* Visible focus outline with brand color */
.focus-visible:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

#### High Contrast Support
- Automatic border thickness increase in high contrast mode
- Thicker focus outlines for better visibility
- Respects user's contrast preferences

#### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled or reduced */
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

---

## 🛠️ Utility Functions

### 1. **Focus Trapping** (`trapFocus`)

Keeps focus within modals and dialogs:

```typescript
import { trapFocus } from './utils/accessibility';

const cleanup = trapFocus(containerElement);
// Later, cleanup when modal closes
cleanup();
```

**Use Cases:**
- Modals
- Dialogs
- Dropdown menus
- Popup panels

---

### 2. **Screen Reader Announcements** (`announce`)

Announce messages to screen readers:

```typescript
import { announce } from './utils/accessibility';

// Polite announcement (non-urgent)
announce('Data saved successfully', 'polite');

// Assertive announcement (urgent)
announce('Error: Form validation failed', 'assertive');
```

**Best Practices:**
- Use `'polite'` for status updates
- Use `'assertive'` for errors or critical alerts

---

### 3. **Keyboard List Navigation** (`handleListKeyboard`)

Handle arrow key navigation in lists:

```typescript
import { handleListKeyboard } from './utils/accessibility';

function MyList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(listRef.current.querySelectorAll('button'));
    const newIndex = handleListKeyboard(e, items, currentIndex, (index) => {
      // Handle Enter/Space - select item
      selectItem(index);
    });
    setCurrentIndex(newIndex);
  };
  
  return <div onKeyDown={handleKeyDown}>...</div>;
}
```

**Supported Keys:**
- `ArrowDown/ArrowRight`: Next item
- `ArrowUp/ArrowLeft`: Previous item
- `Home`: First item
- `End`: Last item
- `Enter/Space`: Select item

---

### 4. **Unique ID Generation** (`generateId`)

Generate unique IDs for ARIA relationships:

```typescript
import { generateId } from './utils/accessibility';

const labelId = generateId('label');
const descId = generateId('description');

<input aria-labelledby={labelId} aria-describedby={descId} />
```

---

## 🎣 Custom Hooks

### 1. **useFocusTrap**

Automatically trap focus in modals:

```typescript
import { useFocusTrap } from './hooks/useAccessibility';

function Modal({ isOpen, onClose }) {
  const containerRef = useFocusTrap(isOpen);
  
  return (
    <div ref={containerRef} role="dialog">
      {/* Modal content */}
    </div>
  );
}
```

---

### 2. **useAnnouncer**

Hook for announcing messages:

```typescript
import { useAnnouncer } from './hooks/useAccessibility';

function MyComponent() {
  const announce = useAnnouncer();
  
  const handleSave = () => {
    // ... save logic
    announce('Changes saved successfully');
  };
}
```

---

### 3. **useRestoreFocus**

Restore focus to previous element when component unmounts:

```typescript
import { useRestoreFocus } from './hooks/useAccessibility';

function Modal() {
  useRestoreFocus(); // Automatically restores focus on unmount
  
  return <div>...</div>;
}
```

---

### 4. **useKeyboardShortcuts**

Register keyboard shortcuts:

```typescript
import { useKeyboardShortcuts } from './hooks/useAccessibility';

function MyComponent() {
  useKeyboardShortcuts({
    'Ctrl+s': (e) => handleSave(),
    'Ctrl+Shift+p': (e) => openCommandPalette(),
    'Escape': (e) => closeModal(),
  });
}
```

---

### 5. **usePrefersReducedMotion**

Detect if user prefers reduced motion:

```typescript
import { usePrefersReducedMotion } from './hooks/useAccessibility';

function AnimatedComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { scale: 1.2 }}
    />
  );
}
```

---

## 📋 CSS Classes

### Screen Reader Only

Hide content visually but keep it accessible:

```tsx
<span className="sr-only">
  Loading...
</span>
```

### Skip Link

The skip link is automatically added to the app:

```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

---

## ♿ Example: Accessible Modal

```typescript
import { AccessibleModal } from './components/AccessibleModal';

function MyPage() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Settings
      </button>
      
      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Settings"
        description="Manage your account settings"
      >
        {/* Modal content */}
      </AccessibleModal>
    </>
  );
}
```

**Features:**
- ✅ Focus trap when open
- ✅ Escape key to close
- ✅ Restores focus on close
- ✅ Screen reader announcements
- ✅ Proper ARIA attributes
- ✅ Backdrop click to close

---

## 🧪 Testing Accessibility

### Keyboard Navigation
1. Use **Tab** key to navigate
2. Use **Shift+Tab** to navigate backward
3. Verify all interactive elements are reachable
4. Check for visible focus indicators

### Screen Reader Testing
1. Enable screen reader (VoiceOver, NVDA, JAWS)
2. Navigate using screen reader shortcuts
3. Verify all content is announced
4. Check form labels and error messages

### Browser DevTools
1. Run Lighthouse accessibility audit
2. Check ARIA attributes in inspector
3. Verify color contrast ratios
4. Test with browser zoom (200%+)

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Inclusive Components](https://inclusive-components.design/)

---

## 🎯 Accessibility Checklist

- ✅ Keyboard navigation for all interactive elements
- ✅ Skip to main content link
- ✅ Proper focus management in modals
- ✅ Screen reader announcements for dynamic content
- ✅ Clear focus indicators
- ✅ ARIA labels and roles
- ✅ High contrast mode support
- ✅ Reduced motion support
- ✅ Semantic HTML structure
- ✅ Color contrast ratios meet WCAG AA standards

---

**Questions?** Check the [Help](/help) page or contact support.
