# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 library management system with role-based access control, AI-powered features, and audit logging. Uses PostgreSQL, Prisma ORM, NextAuth v4 for Google OAuth, and Anthropic Claude API for AI features.

## Development Commands

```bash
# Development
npm run dev              # Start dev server (default port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database (Docker)
npm run db:up            # Start PostgreSQL container (port 5432)
npm run db:down          # Stop PostgreSQL container

# Prisma
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations in development
npm run prisma:studio    # Open Prisma Studio GUI
npx prisma migrate deploy # Deploy migrations (production)
```

## Architecture

### Service Layer Pattern

Business logic lives in `lib/services/` and is consumed by API routes:

- **bookService.ts**: CRUD operations for books with audit logging
- **loanService.ts**: Check-out/return workflow with authorization checks

All service functions automatically create `AuditLog` entries for admin-visible operations. Services throw errors with user-friendly messages that API routes catch and return.

### Authorization Model

Three-tier role system enforced at both API and UI levels:

1. **MEMBER**: Browse, search, check out available books, return own books
2. **LIBRARIAN**: All member permissions + manage books, return any book, view all loans
3. **ADMIN**: All permissions + view audit logs

**Critical**: The `returnBook()` function in `loanService.ts` has authorization logic that validates:
- User is ADMIN or LIBRARIAN, OR
- User is the borrower of the specific loan

This prevents members from returning books checked out by others.

### NextAuth Session Extension

Custom session types are defined in `types/next-auth.d.ts` to add `role` field to `Session.user`. The JWT callback in `lib/auth.config.ts`:

1. Checks if user email is in `ADMIN_EMAILS` environment variable
2. Auto-elevates role to ADMIN on first sign-in if matched
3. Persists role in JWT token for all subsequent requests

Access session in API routes via:
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
// session.user.id and session.user.role are available
```

### AI Integration

`lib/ai.ts` provides three Claude AI functions:

- `generateBookDescription()`: Auto-generate catalog descriptions
- `searchBooksWithAI()`: Parse natural language queries into structured search
- `recommendSimilarBooks()`: Content-based recommendations

All functions check if `AI_API_KEY` is configured and throw helpful errors if not. Uses Claude Sonnet 4 model (`claude-sonnet-4-20250514`).

### Database Schema

Core models:
- **User**: OAuth identity + role (ADMIN/LIBRARIAN/MEMBER)
- **Book**: Catalog with soft-delete via ARCHIVED status
- **Loan**: Tracks check-out/return transactions with due dates
- **AuditLog**: Immutable log of all administrative actions

Enums define valid states:
- `BookStatus`: AVAILABLE | CHECKED_OUT | ARCHIVED
- `LoanStatus`: CHECKED_OUT | RETURNED
- `AuditAction`: BOOK_CREATE | BOOK_UPDATE | LOAN_CHECKOUT | etc.

### API Route Structure

```
app/api/
├── auth/[...nextauth]/    # NextAuth handlers
├── books/
│   ├── route.ts           # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts       # GET, PATCH (update), DELETE (archive)
│       └── loan/route.ts  # POST (checkout), DELETE (return)
├── ai/
│   ├── generate-description/
│   ├── search/
│   └── recommend/
└── migrate/               # Manual migration endpoint (Railway)
```

All protected routes must:
1. Call `await auth()` to get session
2. Check `session?.user?.role` for authorization
3. Return appropriate HTTP status codes (401, 403)

### Page Protection

Protected routes in `app/(protected)/` are wrapped in a layout that checks authentication. Pages should additionally check roles client-side for UI customization, but always enforce server-side in API routes.

## Environment Configuration

Required variables (see `.env.example`):

```env
DATABASE_URL              # PostgreSQL connection string
NEXTAUTH_URL              # App URL (http://localhost:3000 or production)
NEXTAUTH_SECRET           # Generate with: openssl rand -base64 32
GOOGLE_CLIENT_ID          # Google OAuth credentials
GOOGLE_CLIENT_SECRET
ADMIN_EMAILS              # Comma-separated emails for auto-admin
AI_API_KEY                # Optional: Anthropic API key (sk-ant-...)
```

## Important Constraints

### Prisma Version

**Must use Prisma 6.x** (not 7.x) for Node.js compatibility with Railway and other platforms. Package.json locked to `"prisma": "^6"` and `"@prisma/client": "^6"`.

### Tailwind CSS

**Must use Tailwind CSS 3.x** (not 4.x) for shadcn/ui component compatibility. Package.json uses `"tailwindcss": "^3"`.

In `app/globals.css`, Tailwind v3 syntax is used:
- Direct CSS properties instead of `@apply` directives
- CSS variables defined in `:root` for theming
- No `@layer base` wrapper

### NextAuth Types

Custom type extensions in `types/next-auth.d.ts` are required because NextAuth v4 doesn't include `role` field by default. Without this file, TypeScript errors occur when accessing `session.user.role`.

## Deployment (Railway)

Configuration files:
- `railway.json`: Build and deploy settings
- `nixpacks.toml`: Custom build phases

Build phase runs:
```bash
npx prisma generate
npx prisma migrate deploy  # Runs migrations automatically
npm run build
```

Database is Railway PostgreSQL addon. Connection string auto-injected via `DATABASE_URL`.

### Google OAuth Setup

For production deployment, add to Google Cloud Console:
- Authorized JavaScript origins: `https://your-app.railway.app`
- Authorized redirect URIs: `https://your-app.railway.app/api/auth/callback/google`

Update `NEXTAUTH_URL` environment variable to match production URL.

## Common Patterns

### Adding a New Book Field

1. Update `schema.prisma` model Book
2. Run `npm run prisma:migrate`
3. Update `BookInput` type in `bookService.ts`
4. Update API route validation in `app/api/books/route.ts`
5. Update UI forms in `components/books/`

### Adding a New Protected Route

1. Create route in `app/(protected)/your-route/`
2. Add session check: `const session = await auth()`
3. Check role if needed: `if (session?.user?.role !== "ADMIN") redirect("/dashboard")`
4. Add navigation link in `components/shell/AppShell.tsx`

### Adding a New AI Feature

1. Add function to `lib/ai.ts` with `checkAiAvailable()` guard
2. Create API route in `app/api/ai/your-feature/route.ts`
3. Call from client component with error handling
4. Use toast notifications (sonner) for user feedback
