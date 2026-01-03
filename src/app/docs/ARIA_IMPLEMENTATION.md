# ARIA Labels and Roles Implementation Guide

This document outlines all the ARIA labels and roles implemented across Lynqio's core components to improve screen reader support and accessibility.

---

## 📋 **Components Updated**

### ✅ **1. DashboardLayout.tsx**

#### **Landmark Roles**
```tsx
// Skip to main content link
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Main navigation
<nav 
  id="main-navigation"
  aria-label="Main navigation"
  role="navigation"
>

// Main content area
<main 
  id="main-content" 
  role="main" 
  aria-label="Page content"
>
```

#### **Navigation Items**
- ✅ `aria-current="page"` on active navigation links
- ✅ `aria-label` on all navigation links
- ✅ `role="list"` and `role="listitem"` for navigation structure
- ✅ `aria-hidden="true"` on decorative icons
- ✅ Screen reader text for current page: `<span className="sr-only"> (current page)</span>`

#### **Organization Selector**
```tsx
<button
  aria-label="Select organization"
  aria-expanded={showOrgDropdown}
  aria-haspopup="menu"
  aria-controls="organization-menu"
>

<div 
  id="organization-menu"
  role="menu"
  aria-label="Organization list"
>
  <button 
    role="menuitem"
    aria-current={isCurrentOrg ? 'true' : undefined}
  >
```

#### **Mobile Menu**
```tsx
<button
  aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
  aria-expanded={isMobileMenuOpen}
  aria-controls="main-navigation"
>
```

#### **Collapse/Expand Button**
```tsx
<button
  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  aria-expanded={!isCollapsed}
  aria-controls="main-navigation"
>
```

---

### ✅ **2. Pagination.tsx**

#### **Navigation Structure**
```tsx
<nav aria-label="Pagination" role="navigation">
  <div className="pagination-controls" role="list">
    {/* Previous button */}
    <button
      aria-label="Go to previous page"
      aria-disabled={isFirstPage}
      role="listitem"
    >
    
    {/* Page numbers */}
    <div className="pagination-pages" role="list">
      <button
        aria-label="Current page, page 3" // or "Go to page 3"
        aria-current={isActive ? 'page' : undefined}
        role="listitem"
      >
    
    {/* Next button */}
    <button
      aria-label="Go to next page"
      aria-disabled={isLastPage}
      role="listitem"
    >
  </div>
  
  {/* Page info with live region */}
  <div aria-live="polite" aria-atomic="true">
    <span className="sr-only">Page {currentPage} of {totalPages}</span>
    <span aria-hidden="true">Page 3 of 10</span>
  </div>
</nav>
```

#### **Features**
- ✅ Live region announces page changes to screen readers
- ✅ Screen reader only text for page info
- ✅ `aria-disabled` on disabled buttons
- ✅ `aria-current="page"` on current page
- ✅ Icons marked with `aria-hidden="true"`

---

### ✅ **3. ErrorBanner.tsx**

#### **Alert Role**
```tsx
<div 
  role="alert" 
  aria-live="assertive"
  aria-atomic="true"
>
  <AlertCircle aria-hidden="true" />
  <p>
    <span className="sr-only">Error: </span>
    {message}
  </p>
  
  <button
    aria-label={isRetrying ? 'Retrying, please wait' : 'Retry loading'}
    aria-disabled={isRetrying}
  >
    <RefreshCw aria-hidden="true" />
    <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
  </button>
</div>
```

#### **Features**
- ✅ `role="alert"` for immediate screen reader announcement
- ✅ `aria-live="assertive"` for critical errors
- ✅ Screen reader text "Error: " prefix
- ✅ Icons marked as decorative
- ✅ Button states clearly communicated

---

### ✅ **4. AccessibleFormExample.tsx**

Comprehensive form demonstrating all accessibility best practices:

#### **Form Structure**
```tsx
<form 
  aria-label="Contact form"
  noValidate  // Custom validation with better error messages
>
```

#### **Input Fields**
```tsx
<label htmlFor="email-input" id="email-label">
  Email Address
  <span aria-label="required" className="text-destructive">*</span>
</label>

<input
  id="email-input"
  name="email"
  aria-labelledby="email-label"
  aria-describedby={errors.email ? 'email-error' : 'email-hint'}
  aria-invalid={!!errors.email}
  aria-required="true"
/>

<p id="email-hint" className="text-xs text-muted-foreground">
  We'll never share your email.
</p>

{errors.email && (
  <div id="email-error" role="alert">
    <AlertCircle aria-hidden="true" />
    <span>{errors.email}</span>
  </div>
)}
```

#### **Features**
- ✅ Every input has a `<label>` with `htmlFor`
- ✅ `aria-labelledby` connects label to input
- ✅ `aria-describedby` links to hint text or error
- ✅ `aria-invalid="true"` when validation fails
- ✅ `aria-required="true"` for required fields
- ✅ Error messages have `role="alert"`
- ✅ Submit button shows loading state
- ✅ Success message with `role="status"`

---

## 🎯 **ARIA Patterns Used**

### **1. Landmark Roles**
- `<nav role="navigation" aria-label="Main navigation">`
- `<main role="main" aria-label="Page content">`
- `<header role="banner" aria-label="Site header">` (if added)

### **2. Live Regions**
- `aria-live="polite"` - Non-urgent updates (pagination, success messages)
- `aria-live="assertive"` - Urgent updates (errors, critical alerts)
- `aria-atomic="true"` - Announce entire region content

### **3. Current State**
- `aria-current="page"` - Active navigation link
- `aria-current="true"` - Current selection in menus

### **4. Interactive Elements**
- `aria-label` - Accessible name for buttons/links
- `aria-labelledby` - References label by ID
- `aria-describedby` - Additional description/hints
- `aria-expanded` - Collapsible element state
- `aria-haspopup` - Element opens menu/dialog
- `aria-controls` - Element controls another element

### **5. Form Elements**
- `aria-required="true"` - Required field
- `aria-invalid="true"` - Validation error
- `aria-describedby` - Link to error message
- `role="alert"` - Error message announcement

### **6. Disabled State**
- `aria-disabled="true"` - Disabled but focusable
- `disabled` - Disabled and not focusable

### **7. Busy/Loading State**
- `aria-busy="true"` - Content is loading

---

## 🔍 **Screen Reader Only Class**

Used throughout the app for content that should be read by screen readers but not visible:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Usage:**
```tsx
<span className="sr-only">Error: </span>
<span className="sr-only"> (current page)</span>
<span className="sr-only">Loading, please wait</span>
```

---

## ✅ **Accessibility Checklist**

### **Navigation**
- ✅ Skip to main content link
- ✅ All navigation items keyboard accessible
- ✅ Active page indicated with `aria-current`
- ✅ Proper landmark roles (nav, main, header)
- ✅ Mobile menu state communicated

### **Forms**
- ✅ All inputs have associated labels
- ✅ Required fields marked with `aria-required`
- ✅ Validation errors use `aria-invalid`
- ✅ Error messages linked with `aria-describedby`
- ✅ Error messages have `role="alert"`

### **Interactive Elements**
- ✅ Buttons have descriptive `aria-label`
- ✅ Icons marked with `aria-hidden="true"`
- ✅ Loading states communicated
- ✅ Disabled states indicated

### **Dynamic Content**
- ✅ Live regions for announcements
- ✅ Page changes announced
- ✅ Error messages announced immediately
- ✅ Success messages announced politely

---

## 🎨 **Visual Indicators**

All accessibility features are paired with visual indicators:

- **Focus rings**: Cyan outline on keyboard focus
- **Error states**: Red border + icon + message
- **Active states**: Background color change
- **Disabled states**: Reduced opacity
- **Loading states**: Spinner animation

---

## 📖 **Best Practices Applied**

1. **Progressive Enhancement**: Works without JavaScript
2. **Semantic HTML**: Use correct HTML elements
3. **ARIA Complementary**: ARIA enhances, doesn't replace HTML
4. **Keyboard Navigation**: All interactions work with keyboard
5. **Screen Reader Testing**: Announcements make sense
6. **Focus Management**: Logical tab order, focus trapping in modals
7. **Error Recovery**: Clear error messages with recovery actions
8. **Consistent Patterns**: Same ARIA patterns across components

---

## 🧪 **Testing Your Changes**

### **Screen Reader Testing**
1. **Mac**: VoiceOver (Cmd + F5)
2. **Windows**: NVDA (free) or JAWS
3. **Navigate using Tab key**
4. **Verify announcements make sense**

### **Keyboard Testing**
1. **Tab**: Move forward
2. **Shift + Tab**: Move backward
3. **Enter/Space**: Activate buttons
4. **Escape**: Close modals
5. **Arrow keys**: Navigate lists

### **Browser DevTools**
1. **Lighthouse**: Run accessibility audit
2. **Inspect**: Check ARIA attributes
3. **Test with 200% zoom**
4. **Check color contrast**

---

## 📚 **Resources**

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

---

**Last Updated**: December 28, 2024
**Accessibility Standard**: WCAG 2.1 Level AA
