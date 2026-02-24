---
name: mini-library-management-system
overview: Design and implement a mini library management web app with authentication/SSO, AI-powered features, and deployment to Railway using a full-stack Next.js + PostgreSQL stack.
todos:
  - id: init-next-app
    content: Initialize Next.js (App Router, TS) project with Tailwind and Prisma, and configure PostgreSQL connection locally.
    status: completed
  - id: define-prisma-models
    content: Design and implement Prisma models for User, Book, Loan, and optional AuditLog, then run migrations.
    status: completed
  - id: implement-auth-sso
    content: Set up NextAuth with SSO provider(s), role management, and protected routes/layouts.
    status: completed
  - id: build-book-crud
    content: Implement book CRUD APIs/server actions and corresponding UI pages with validation and role-based access.
    status: completed
  - id: implement-loan-flows
    content: Implement check-in/check-out logic, APIs, and UI interactions with proper domain rules and permissions.
    status: in_progress
  - id: add-search-filtering
    content: Implement search and filtering in backend queries and frontend UI, including search by title, author, and other fields.
    status: completed
  - id: add-ai-features
    content: Integrate AI provider and implement AI-assisted search/description/recommendation endpoints and UI.
    status: pending
  - id: polish-ui-extras
    content: Add dashboard, audit logs, soft delete, and UX polish like toasts and loading states.
    status: pending
  - id: write-readme
    content: Write README with feature overview, local setup, and Railway deployment instructions including live URL configuration.
    status: pending
  - id: railway-deployment
    content: Prepare Railway config, env vars, and commands required so the app can be deployed and served from a public URL.
    status: pending
isProject: false
---

## High-level architecture

- **Stack**: Next.js (App Router, TypeScript) as a full-stack app (API routes + React UI), Prisma ORM, PostgreSQL, NextAuth (or similar) for auth/SSO, Tailwind CSS for styling.
- **Hosting**: Deploy the Next.js app and PostgreSQL database on Railway. The app will expose a public URL suitable for sharing in an interview.
- **Core domains**:
  - **Book**: title, author, ISBN, category, publication year, language, description, status (available/checked_out), created/updated timestamps.
  - **User**: auth identity (SSO), role (admin, librarian, member), profile metadata.
  - **Loan/Transaction**: which user borrowed which book, check-out date, due date, returned date, status.

### Component/Service diagram

```mermaid
flowchart TD
  browserUI[BrowserUI] --> nextPages[NextAppRouterPages]
  browserUI --> nextComponents[UIComponents]

  nextPages --> apiRoutes[NextAPIRoutes]
  apiRoutes --> services[DomainServices]
  services --> prismaClient[PrismaClient]
  prismaClient --> postgresDB[PostgreSQL]

  browserUI --> authClient[NextAuthClient]
  authClient --> authServer[NextAuthServer]
  authServer --> ssoProvider[SSOProvider(Google,etc.)]

  services --> aiClient[AIClient(OpenAI-or-similar)]
```



## Data model & Prisma schema

- **Define models in** `[prisma/schema.prisma](prisma/schema.prisma)`:
  - **User**: `id`, `email`, `name`, `image`, `role` (`'ADMIN' | 'LIBRARIAN' | 'MEMBER'`), `createdAt`, `updatedAt`.
  - **Book**: `id`, `title`, `author`, `isbn`, `category`, `language`, `publishedYear`, `description`, `status`, `createdAt`, `updatedAt`.
  - **Loan**: `id`, `bookId`, `userId`, `checkedOutAt`, `dueAt`, `returnedAt`, `status` (`'CHECKED_OUT' | 'RETURNED'`), relation fields.
  - **Optional extras**: `Tag`, `BookTag`, `AuditLog` for recording admin actions.
- **Migrations**: configure PostgreSQL connection via env vars in `.env` (e.g., `DATABASE_URL`) and `npx prisma migrate dev` for local; document how to run `prisma migrate deploy` for Railway.

## Authentication, SSO, and authorization

- **Auth/SSO setup** in `[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)`:
  - Use NextAuth with at least one OAuth provider (e.g., Google) for SSO.
  - Configure JWT/session callbacks to attach `role` info from the `User` table.
- **Role management**:
  - Seed an initial admin user (via script in `[scripts/seed.ts](scripts/seed.ts)` or first-login elevation based on email allowlist in `NEXT_PUBLIC_ADMIN_EMAILS`).
  - Enforce role-based access in server actions/API routes (e.g., only `ADMIN` or `LIBRARIAN` can create/edit/delete books; any authenticated user can search and check-out within constraints).
- **Protected routes**:
  - Wrap pages in `[app/(protected)/layout.tsx](app/(protected)/layout.tsx)` to enforce authentication.
  - Add guards on individual operations (e.g., check current user and role in server actions).

## API design & server logic

- **API route structure** under `app/api` (or server actions in `app` pages):
  - **Books** (`[app/api/books/route.ts](app/api/books/route.ts)`): `GET` (list + filters), `POST` (create).
  - **Book detail** (`[app/api/books/[id]/route.ts](app/api/books/[id]/route.ts)`): `GET`, `PUT` (edit), `DELETE`.
  - **Check-in/check-out** (`[app/api/books/[id]/loan/route.ts](app/api/books/[id]/loan/route.ts)`): `POST` for check-out/check-in based on current state and user.
  - **Search** (`GET /api/books?query=...&author=...&status=...`) with pagination and sorting.
  - **AI actions** (`[app/api/ai/route.ts](app/api/ai/route.ts)`): endpoints that call an AI provider.
- **Server-side validation**: use Zod or similar to validate payloads and return structured errors.

## AI features

- **Integration**:
  - Create a thin AI client wrapper in `[lib/ai.ts](lib/ai.ts)` that calls OpenAI (or a generic chat completions API) using an `AI_API_KEY` environment variable.
- **Use cases**:
  - **Natural language search helper**: user types a free-form query ("books about machine learning for beginners") which is sent to AI; AI returns structured filters (categories, keywords, year ranges) applied to `/api/books` search.
  - **Book description generator**: when adding/editing a book, an "AI generate description" button that suggests a description based on title/author/metadata.
  - **Recommendations** (optional extra): endpoint that, given a book or user history, asks AI to suggest similar books from current catalog.
- **UI integration**:
  - Add an "AI assistant" panel in the main UI (e.g., in `[app/(protected)/ai/page.tsx](app/(protected)/ai/page.tsx)` or as a drawer) where users can type queries and see suggested results.

## Frontend UI/UX

- **Layout & styling**:
  - Configure Tailwind in `tailwind.config.ts`, base styles in `[app/globals.css](app/globals.css)`.
  - Create layout shell in `[app/layout.tsx](app/layout.tsx)` with navbar, sidebar, theme, and auth-aware links.
- **Pages**:
  - **Auth**: simple login page that redirects to provider (NextAuth sign-in), in `[app/auth/signin/page.tsx](app/auth/signin/page.tsx)`.
  - **Dashboard / home**: `[app/(protected)/page.tsx](app/(protected)/page.tsx)` showing stats: total books, available vs checked out, recent loans.
  - **Books list**: `[app/(protected)/books/page.tsx](app/(protected)/books/page.tsx)` with searchable, filterable table, status badges, and action buttons (edit, delete, check-in/out) gated by role.
  - **Book form**: `[app/(protected)/books/new/page.tsx](app/(protected)/books/new/page.tsx)` and `[app/(protected)/books/[id]/edit/page.tsx](app/(protected)/books/[id]/edit/page.tsx)` using a shared `BookForm` component, including an "AI description" button.
  - **Loans/history**: `[app/(protected)/loans/page.tsx](app/(protected)/loans/page.tsx)` listing user or full-library loan history (filtered by role).
- **Components** (in `components/`):
  - `BookTable`, `BookFilters`, `BookStatusBadge`, `LoanActions`, `Navbar`, `Sidebar`, `AIHelperPanel`, `ConfirmDialog`, and form field components.

## Search & filtering

- **Backend**:
  - Implement combined search on book title, author, ISBN, category in Prisma queries (`contains`, `mode: 'insensitive'`).
  - Allow filtering by `status`, `category`, `publishedYear` range.
- **Frontend**:
  - Add a search bar and filter controls in `BookFilters`, wired to query params (URLSearchParams) and server-side fetching for SEO/performance.
  - Integrate AI: allow toggling between manual filters and AI-powered query generation.

## Check-in / check-out flows

- **Domain rules**:
  - A book can only be checked out if status is `AVAILABLE`.
  - Check-out creates a `Loan` record and sets book status to `CHECKED_OUT` with a default due date (e.g., 14 days).
  - Check-in sets `returnedAt`, status to `RETURNED`, and updates book status to `AVAILABLE`.
- **Implementation**:
  - Encapsulate logic in service functions in `[lib/services/loanService.ts](lib/services/loanService.ts)` and `[lib/services/bookService.ts](lib/services/bookService.ts)`.
  - Expose them via API routes or server actions; ensure authorization checks use current session.

## Extra features (for interview polish)

- **Audit logging**: log book create/update/delete and check-in/out actions with user ID and timestamp in an `AuditLog` table; show a basic log page for admins.
- **Soft delete**: mark books as archived instead of hard delete; hide from normal views but show in an admin-only archive.
- **Basic rate limiting** on AI endpoints and destructive actions using in-memory or Redis-like strategy (documented even if not fully implemented).
- **Nice UX touches**: loading states, optimistic UI for book edits, toasts for success/error, responsive layout.

## Configuration, environment, and README

- **Environment variables** in `.env.example`:
  - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, OAuth client ID/secret, `AI_API_KEY`, optional `ADMIN_EMAILS`.
- **README** (`README.md`):
  - Describe stack, features, and architecture.
  - Step-by-step local setup: `npm install`, env configuration, `prisma migrate dev`, `npm run dev`.
  - Railway deployment steps (provision Postgres, set env vars, deploy from GitHub).
  - Document how to obtain a live URL from Railway and where to configure it in `NEXTAUTH_URL`.

## Deployment to Railway

- **Project setup**:
  - Create a Railway project, add a PostgreSQL plugin, and copy the DB connection URL into Railway env vars.
  - Connect the GitHub repo or use Railway CLI to deploy the Next.js app.
- **Build & run**:
  - Ensure `package.json` has correct `build` and `start` scripts for Next.js.
  - Use `prisma migrate deploy` in a `postinstall` or Railway deploy hook.
  - Confirm `NEXTAUTH_URL` and OAuth redirect URLs match the Railway-generated domain.

## Testing & verification

- **Unit/integration tests** (optional but good for interviews):
  - Add a small set of tests for book services and loan rules using e.g. Jest or Vitest in a `tests/` folder.
- **Manual test checklist**:
  - Sign in via SSO; confirm role-based UI differences.
  - Create/edit/delete/soft-delete books and verify DB state.
  - Check-in/check-out flows, including edge cases (double checkout, invalid role).
  - AI description generation and AI-powered search producing reasonable suggestions.

