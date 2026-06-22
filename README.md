# KCheck - Online Examination System

A Next.js 14 App Router-based online examination platform with MySQL.

## Prerequisites

- Node.js 22+
- MySQL 8+ (running on port 3306 or configured via `.env`)
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env   # Configure your database credentials
pnpm db:migrate        # Creates all database tables
pnpm db:seed           # Seeds admin user + demo data
pnpm dev               # Starts development server
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:setup` | (Not available) |
| `pnpm db:import` | (Not available) |
| `pnpm db:recreate` | (Not available) |

## Architecture

```
src/
├── app/
│   ├── api/          # REST API routes (Next.js App Router route handlers)
│   ├── dashboard/    # Protected dashboard pages
│   ├── login/        # Login page
│   └── register/     # Registration page
├── ui/               # UI components (forms, layouts, etc.)
├── hooks/            # React custom hooks
├── lib/              # Utilities (db, auth, seed, migrate)
└── styles/           # SCSS/CSS styles
```

## Codebase Audit (June 22, 2026)

A comprehensive audit was performed. See `SYSTEM_AUDIT/` for full details.

### Bugs Fixed (15 total)

1. **Toggle routes always returned `is_active: false`** — `mysql2` UPDATE result has no `is_active` property; added follow-up SELECT.
2. **Exam DELETE violated FK constraints** — Only `results` was deleted before exam; now cascades across 11 related tables.
3. **Unreachable guard clauses** — `if (!category)` on a freshly created object is always truthy; added proper duplicate detection via MySQL error 1062.
4. **Three broken `package.json` scripts** — Referenced nonexistent files; replaced with no-op echo.
5. **Seed script entirely commented out** — Rewrote from PostgreSQL to working MySQL seed.
6. **Corrupted `fresh-migrate.ts`** — Garbage text; replaced with clean delegation to `runMigrations()`.
7. **Demo "Retake" button used `router.back()`** — Changed to navigate to `/dashboard/exams/${id}/take`.
8. **Reports batch join caused duplicate rows** — `LEFT JOIN batches b ON b.exam_id = e.id` is many-to-one; replaced with correlated subquery.
9. **`useExamProgress` race condition** — Stale closures due to state dependency; added `useRef` synced every render.
10. **Stale closures in take-exam-client** — `useState` for timer/router references caused re-render loops; switched to `useRef`.
11. **Dead `_document.tsx` from Pages Router** — Deleted.
12. **Forgot-password link 404'd** — Changed to inert "Contact Admin" message.
13. **Unused import** — Removed `withRetry` from categories route.
14. **No user-facing error feedback on form saves** — Added `error` state and visible error banner to exam/batch/user forms.
15. **Duplicate dead `test-auth.ts`** — Deleted.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [MySQL2](https://github.com/sidorares/node-mysql2)
- [Tailwind CSS](https://tailwindcss.com/)
