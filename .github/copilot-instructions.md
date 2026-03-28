# YouTube Wrapped — Project Context

## Stack

- **Framework**: Next.js 15 (App Router, Turbopack), React 18, TypeScript
- **Styling**: Tailwind CSS 3.4 + `tailwindcss-animate`, Radix UI primitives via shadcn/ui
- **Charts**: recharts (preferred — uses D3, fast), Chart.js + react-chartjs-2 (legacy, used on main dashboard)
- **Auth**: Firebase client SDK (`onAuthStateChanged`) + Firebase Admin (server routes)
- **Storage**: IndexedDB via `dexie` and `idb` (watch history keyed as `watch-history-{year}`)
- **Icons**: `lucide-react`
- **Package manager**: pnpm

## Architecture

```
app/                    # Next.js App Router pages
  dashboard/            # Main dashboard + sub-pages (watch-time, categories, creators)
  api/                  # Route handlers (Firebase, Google Drive)
components/             # Shared UI components
  ui/                   # shadcn/ui primitives (button, card, tabs, etc.)
  animated-card.tsx     # AnimatedCard (fade-in + translateY) + AnimatedStat (count-up)
contexts/               # AuthProvider (Firebase + sample user support)
hooks/                  # useDashboardStats, useMobile, useToast
lib/                    # Data fetching, processing, APIs
  fetch-dashboard-data.ts   # Main stats: DashboardStats, CreatorStats, YearComparison
  fetch-categories-data.ts  # CategoryData, CategoryStats, CategoryComparison
  fetch-watch-time-data.ts  # WatchTimeStats, milestones, patterns
  fetch-creators-data.ts    # Creator rankings, categories
  youtube-api.ts             # Channel thumbnails, metadata
```

## Key Patterns

### Auth Guard
All dashboard pages use this pattern — wait for Firebase before redirecting:
```tsx
const { isLoggedIn, isAuthLoading } = useAuth()
useEffect(() => {
  if (!isAuthLoading && !isLoggedIn) router.push("/")
}, [isLoggedIn, isAuthLoading, router])
if (isAuthLoading) return null  // or skeleton
```

### Card Styling (established on main dashboard + watch-time page)
- `card-hover` — lift + shadow on hover (CSS in globals.css)
- `card-hero` — radial gradient glow top-right (CSS in globals.css)
- `AnimatedCard delay={N}` — fade-in wrapper, stagger by 100ms increments
- `AnimatedStat value={N} decimals={1}` — count-up animation for numbers
- Gradient overlays: `<div className="absolute inset-0 bg-gradient-to-br from-{color}-500/10 via-transparent to-transparent" />`
- Icon containers: `<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-{color}-500/10"><Icon className="h-5 w-5 text-{color}-500" /></div>`

### Data Flow
1. Watch history uploaded via Google Takeout ZIP → parsed → stored in IndexedDB
2. `fetch-*-data.ts` functions read from IndexedDB, aggregate stats
3. `useDashboardStats` hook adds localStorage caching (version key: `"v5"`)
4. Sub-pages fetch their own data directly from IndexedDB via their respective fetch functions

### Sample User
`viewSampleUser()` in AuthContext sets a demo user with `isSampleUser: true` and navigates to `/dashboard`. Sub-pages should support this mode.

## Conventions

- Path alias: `@/` maps to workspace root
- All dashboard sub-pages share the same layout: `DashboardHeader` + `Sidebar` + `<main>`
- Sidebar is collapsible (Alt+B), has keyboard shortcuts (Alt+D/W/C/R)
- Dark mode via `next-themes`, YouTube red (`hsl(0 91% 42%)`) as primary color
- Cache version bumps force data refresh — current version is `"v5"`
