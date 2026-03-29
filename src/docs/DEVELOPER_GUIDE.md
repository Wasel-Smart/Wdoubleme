# Wasel Developer Guide

**Version:** 4.0 (Post-Protocol Implementation)  
**Last Updated:** March 15, 2026  
**Target Audience:** Engineers joining the Wasel team

---

## 🎯 Welcome to Wasel!

You're joining the team building **the BlaBlaCar of the Middle East** — a carpooling platform with cultural intelligence built for Jordan and the MENA region.

This guide will help you:
- Understand the codebase structure
- Follow coding standards
- Ship features quickly and safely
- Maintain high code quality

---

## 🚀 Quick Start (5 minutes)

### **Prerequisites**

- Node.js 18+ (`node --version`)
- npm or pnpm (`npm --version`)
- Git (`git --version`)

### **Setup**

```bash
# 1. Clone repository (if not already done)
git clone <repo-url>
cd wasel

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Visit: http://localhost:3000
```

### **Verify Setup**

```bash
# Run tests
npm run test

# Check types
npm run typecheck

# Build for production
npm run build
```

✅ If all commands succeed, you're ready to code!

---

## 📁 Project Structure (Feature-Slice Architecture)

### **High-Level Overview**

```
wasel/
├── /src/                    → Main application entry
│   ├── App.tsx              → React root component
│   └── main.tsx             → Vite entry point
│
├── /features/               → Business domain features (NEW CODE GOES HERE!)
│   ├── carpooling/          → Ride-sharing (PRIMARY)
│   ├── awasel/              → Package delivery (SECONDARY)
│   ├── cultural/            → MENA-specific features
│   ├── services/            → Specialized carpools
│   ├── safety/              → Trust & verification
│   ├── payments/            → Payment flows
│   └── profile/             → User management
│
├── /components/             → Reusable UI components
│   ├── ui/                  → Atomic design system
│   ├── Header.tsx           → Global navigation
│   └── ...                  → Shared components
│
├── /services/               → API & business logic
│   ├── trips.ts             → Trip CRUD
│   ├── bookings.ts          → Booking management
│   └── auth.ts              → Authentication
│
├── /utils/                  → Utilities & helpers
│   ├── rtl.ts               → RTL/LTR support
│   ├── currency.ts          → JOD formatting
│   └── ...                  → Helper functions
│
├── /contexts/               → React Context providers
│   ├── AuthContext.tsx      → User authentication
│   ├── LanguageContext.tsx  → Arabic/English
│   └── ...                  → Global state
│
├── /supabase/functions/     → Backend API (Hono + Deno)
│   └── server/              → API routes
│
├── /tokens/                 → Design tokens (colors, spacing)
├── /styles/                 → Global CSS
└── /docs/                   → Documentation
```

### **Feature-Slice Architecture**

**Rule:** One feature = one folder in `/features/`

Example:
```
/features/carpooling/
├── SearchRides.tsx          → Search for rides
├── PostRide.tsx             → Create a ride
├── BookRide.tsx             → Book a seat
├── RideDetails.tsx          → View ride details
├── CostCalculator.tsx       → Calculate fuel cost
└── index.ts                 → Exports
```

**✅ DO:**
- Create new features in `/features/`
- Keep components focused (one responsibility)
- Export from `index.ts`

**❌ DON'T:**
- Mix UI components with features
- Create deep nesting (max 2 levels)
- Put business logic in `/components/`

---

## 🎨 Design System

### **Token-Based Styling**

All visual values come from `/tokens/wasel-tokens.ts`:

```typescript
import { WaselColors, WaselSpacing, WaselTypography } from '@/tokens';

// ✅ Correct
const MyComponent = () => (
  <div style={{
    background: WaselColors.navyCard,
    padding: WaselSpacing['4'],
    fontSize: WaselTypography.text.base.fontSize,
  }}>
    Content
  </div>
);

// ❌ Wrong (hardcoded values)
const BadComponent = () => (
  <div style={{
    background: '#111B2E',    // ❌ No!
    padding: '16px',          // ❌ No!
    fontSize: '16px',         // ❌ No!
  }}>
    Content
  </div>
);
```

### **Tailwind CSS Classes**

Use Tailwind for most styling:

```tsx
// ✅ Correct
<div className="bg-card text-foreground p-4 rounded-lg">
  Content
</div>

// ✅ Also correct (tokens)
<div className={cn(
  'bg-card text-foreground',
  rtl.p(4),
  'rounded-lg'
)}>
  Content
</div>
```

### **RTL/LTR Support**

Always use `/utils/rtl.ts`:

```typescript
import { rtl } from '@/utils/rtl';

// ✅ Correct (auto-flips for Arabic)
<div className={rtl.flex()}>
  <div className={rtl.ml(4)}>Left margin (RTL-aware)</div>
</div>

// ❌ Wrong (breaks in Arabic)
<div className="flex">
  <div className="ml-4">Left margin (not RTL-aware)</div>
</div>
```

**RTL Helper Functions:**
- `rtl.flex()` → `flex-row` (LTR) | `flex-row-reverse` (RTL)
- `rtl.ml(4)` → `ml-4` (LTR) | `mr-4` (RTL)
- `rtl.pr(4)` → `pr-4` (LTR) | `pl-4` (RTL)

---

## 🌍 Internationalization (i18n)

### **Translation Hook**

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, dir } = useLanguage();
  
  return (
    <div dir={dir}>
      <h1>{t('common.welcome')}</h1>
      <p>{t('carpooling.searchRides')}</p>
    </div>
  );
}
```

### **Translation Files**

- `/locales/translations.ts` → English + Arabic
- Use **Jordanian dialect** (NOT Modern Standard Arabic)

```typescript
// ✅ Correct (Jordanian dialect)
'carpooling.goingTo': {
  en: 'Where are you going?',
  ar: 'رايح عالعقبة؟',  // Casual, friendly
},

// ❌ Wrong (MSA - too formal)
'carpooling.goingTo': {
  en: 'Where are you going?',
  ar: 'هل تذهب إلى العقبة؟',  // Too formal!
},
```

---

## 🔐 Authentication

### **Auth Context**

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  if (!isAuthenticated) {
    return <button onClick={signIn}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### **Protected Routes**

```typescript
// Already configured in /utils/optimizedRoutes.tsx
{
  path: 'carpooling',
  element: <ProtectedRoute />,  // ← Requires auth
  children: [
    { path: 'search', element: <SearchRides /> },
  ],
}
```

---

## 📡 API Calls

### **Using Services**

```typescript
import { tripsAPI } from '@/services/trips';

function MyComponent() {
  const [trips, setTrips] = useState([]);
  
  useEffect(() => {
    async function loadTrips() {
      const data = await tripsAPI.getTrips();
      setTrips(data);
    }
    loadTrips();
  }, []);
  
  return <div>{trips.map(trip => <TripCard key={trip.id} trip={trip} />)}</div>;
}
```

### **React Query (Recommended)**

```typescript
import { useQuery } from '@tanstack/react-query';
import { tripsAPI } from '@/services/trips';

function MyComponent() {
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsAPI.getTrips(),
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{trips.map(trip => <TripCard key={trip.id} trip={trip} />)}</div>;
}
```

---

## 🧪 Testing

### **Unit Tests (Vitest)**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### **Run Tests**

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### **Test Coverage Targets**

- Unit tests: **80%+**
- Integration tests: **60%+**
- E2E tests: Critical flows only

---

## 🚦 Git Workflow

### **Branch Naming**

```bash
# Feature
feature/carpooling-search

# Bugfix
fix/payment-crash

# Hotfix
hotfix/security-patch
```

### **Commit Messages**

```bash
# ✅ Good
git commit -m "feat(carpooling): Add search filters"
git commit -m "fix(payments): Handle null user case"
git commit -m "docs: Update API documentation"

# ❌ Bad
git commit -m "updates"
git commit -m "fixed bug"
git commit -m "WIP"
```

### **Pull Request Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Manually tested in browser
- [ ] Works in both Arabic and English

## Screenshots (if UI change)
[Attach screenshots]
```

---

## 🎯 Common Tasks

### **Adding a New Feature**

1. Create folder in `/features/`
```bash
mkdir features/my-feature
```

2. Create component
```tsx
// features/my-feature/MyFeature.tsx
export default function MyFeature() {
  return <div>My Feature</div>;
}
```

3. Add route in `/utils/optimizedRoutes.tsx`
```tsx
const MyFeature = lazy(() => import('../features/my-feature/MyFeature'));

// In router config:
{
  path: 'my-feature',
  element: <Lazy component={MyFeature} />,
}
```

4. Add translations
```typescript
// locales/translations.ts
'myFeature.title': {
  en: 'My Feature',
  ar: 'ميزتي',
},
```

### **Creating a UI Component**

1. Create in `/components/ui/`
```tsx
// components/ui/my-button.tsx
import { cn } from '@/utils/ui';

interface MyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function MyButton({ children, onClick }: MyButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg',
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90 transition-colors'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

2. Export from index
```typescript
// components/ui/index.ts
export { MyButton } from './my-button';
```

---

## 🐛 Debugging

### **Console Logging**

```typescript
// ✅ Good (contextual)
console.log('[MyComponent] User clicked:', user.id);

// ❌ Bad (no context)
console.log(user);
```

### **React DevTools**

Install: [React DevTools Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/)

### **Network Tab**

- Check API calls in browser DevTools
- Look for 4xx/5xx errors
- Verify request/response payloads

---

## 📚 Resources

### **Internal Docs**

- `/docs/PLATFORM_ARCHITECTURE.md` → System architecture
- `/guidelines/Guidelines.md` → Project guidelines
- `/PHASE_4_UNIFIED_LAUNCH.md` → Launch strategy

### **External Docs**

- [React 18](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [React Router](https://reactrouter.com)

### **Team Communication**

- **Slack:** #wasel-dev
- **Jira:** [wasel.atlassian.net](https://wasel.atlassian.net)
- **Figma:** [Design System](https://figma.com/wasel-design)

---

## ✅ Code Review Checklist

Before submitting PR:

- [ ] Code follows naming conventions
- [ ] RTL support tested (Arabic mode)
- [ ] Works on mobile + desktop
- [ ] No hardcoded colors/spacing
- [ ] Translations added for new text
- [ ] Tests added/updated
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript errors resolved

---

## 🎓 Learning Path (New Engineers)

### **Week 1: Setup & Exploration**
- [ ] Complete Quick Start
- [ ] Read `PLATFORM_ARCHITECTURE.md`
- [ ] Explore `/features/` structure
- [ ] Run app and test features

### **Week 2: First Contribution**
- [ ] Pick "good first issue" from Jira
- [ ] Create branch and implement
- [ ] Write tests
- [ ] Submit PR

### **Week 3: Deep Dive**
- [ ] Learn RTL system (`/utils/rtl.ts`)
- [ ] Understand auth flow
- [ ] Study design tokens
- [ ] Review backend (`/supabase/functions/`)

### **Week 4: Feature Ownership**
- [ ] Own a feature module
- [ ] Attend feature planning
- [ ] Mentor other engineers

---

## 🚨 Common Pitfalls

### **1. Hardcoded Values**
```tsx
// ❌ Wrong
<div style={{ color: '#04ADBF', padding: '16px' }}>

// ✅ Correct
import { WaselColors, WaselSpacing } from '@/tokens';
<div style={{ color: WaselColors.primary, padding: WaselSpacing['4'] }}>
```

### **2. Ignoring RTL**
```tsx
// ❌ Wrong (breaks in Arabic)
<div className="flex ml-4">

// ✅ Correct (RTL-aware)
import { rtl } from '@/utils/rtl';
<div className={cn(rtl.flex(), rtl.ml(4))}>
```

### **3. Missing Translations**
```tsx
// ❌ Wrong (English only)
<h1>Welcome to Wasel</h1>

// ✅ Correct (i18n)
const { t } = useLanguage();
<h1>{t('common.welcome')}</h1>
```

### **4. Not Using React Query**
```tsx
// ❌ Wrong (manual state management)
const [data, setData] = useState();
useEffect(() => {
  fetch('/api/trips').then(r => r.json()).then(setData);
}, []);

// ✅ Correct (React Query)
const { data } = useQuery({
  queryKey: ['trips'],
  queryFn: () => tripsAPI.getTrips(),
});
```

---

## 🏆 Best Practices

1. **Keep components small** (< 200 lines)
2. **Use TypeScript** (no `any` types)
3. **Test critical paths** (auth, payments, booking)
4. **Mobile-first design** (80% of users on mobile)
5. **Optimize bundle size** (lazy load heavy components)
6. **Follow naming conventions** (PascalCase for components, camelCase for variables)
7. **Document complex logic** (add comments)
8. **Use semantic HTML** (`<button>`, `<nav>`, `<main>`)
9. **Accessibility matters** (ARIA labels, keyboard navigation)
10. **Performance is a feature** (measure, optimize, repeat)

---

**End of Developer Guide**

**Questions?** Reach out to the team on Slack (#wasel-dev) or check `/docs/FAQ.md`

**Happy coding! 🚀**
