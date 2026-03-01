# 📚 Aspire Library Management System

A modern, full-stack library management web application built with Next.js 16, featuring Google OAuth authentication, AI-powered search and recommendations, and comprehensive loan tracking.

## DEMO
https://aspire-library-production.up.railway.app

## 🎯 For Recruiters/Evaluators

**To test ALL features (including admin/librarian features):**

1. Visit the demo URL above
2. Click "Sign in with Google"
3. **The first user to sign in automatically becomes ADMIN** with full access
4. You'll immediately see all features including:
   - Book management (add, edit, delete)
   - AI features (search, recommendations, book discovery, purchase suggestions)
   - Loan management
   - Audit logs
   - All administrative functions

**To test different user roles (MEMBER, LIBRARIAN, ADMIN):**

Use the **Role Switcher** dropdown in the top navigation bar:
- Select "Member" to see the member experience (browse, borrow, limited features)
- Select "Librarian" to see librarian capabilities (manage books, all loans)
- Select "Admin" to return to full admin access

The page will refresh automatically when you switch roles.

The demo is pre-populated with 70+ books and realistic loan data to showcase the full functionality.

## ✨ Features

### Core Functionality
- **Book Management** - Full CRUD operations for library catalog
- **Loan System** - Check-in/check-out workflow with due date tracking
- **Advanced Search** - Multi-field search with filtering by status, category, and year
- **Role-Based Access** - Three user roles (Admin, Librarian, Member) with different permissions

### AI-Powered Features
- **Smart Search** - Natural language queries powered by Claude AI
- **Auto-Generated Descriptions** - AI-generated book descriptions
- **Book Recommendations** - Intelligent book recommendations based on similarity
- **Purchase Recommendations** - Data-driven suggestions for books to buy based on loan patterns

### Administrative Features
- **Audit Logging** - Complete activity tracking for all operations
- **Soft Delete** - Archive books instead of permanent deletion
- **User Management** - Auto-elevation of admin users via email whitelist
- **Loan History** - Complete borrowing history with status tracking

## 🔐 Role-Based Permissions

The system implements three distinct user roles with different permission levels:

| Feature | MEMBER | LIBRARIAN | ADMIN |
|---------|:------:|:---------:|:-----:|
| **Books** |
| View books | ✅ | ✅ | ✅ |
| Search & filter books | ✅ | ✅ | ✅ |
| Check out available books | ✅ | ✅ | ✅ |
| Return own books | ✅ | ✅ | ✅ |
| Return any book | ❌ | ✅ | ✅ |
| Create new books | ❌ | ✅ | ✅ |
| Edit books | ❌ | ✅ | ✅ |
| Delete/Archive books | ❌ | ✅ | ✅ |
| **Administrative** |
| View own loan history | ✅ | ✅ | ✅ |
| View all loans | ❌ | ✅ | ✅ |
| Access audit logs | ❌ | ❌ | ✅ |
| **AI Features** |
| AI-powered search | ✅ | ✅ | ✅ |
| Book recommendations | ✅ | ✅ | ✅ |
| Generate descriptions | ❌ | ✅ | ✅ |
| Purchase recommendations | ❌ | ✅ | ✅ |

### Role Assignment

- **First user** from `ADMIN_EMAILS` environment variable automatically becomes ADMIN
- **Default role** for new users is MEMBER
- **Role elevation** must be done by modifying the database directly or updating `ADMIN_EMAILS`

### Security Features

- ✅ Server-side authorization checks on all API routes
- ✅ Client-side UI element hiding based on permissions
- ✅ Protected page redirects for unauthorized access
- ✅ Loan ownership validation (users can only return their own books unless ADMIN/LIBRARIAN)
- ✅ Audit trail for all administrative actions

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v4 with Google OAuth
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS 4
- **Deployment**: Railway (ready)

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database
- Docker (optional, for local PostgreSQL)
- Google OAuth credentials
- Anthropic API key (for AI features)

## 🚀 Local Setup

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd aspire-library
npm install
\`\`\`

### 2. Database Setup

**Option A: Using Docker (Recommended)**

\`\`\`bash
npm run db:up
\`\`\`

**Option B: Use existing PostgreSQL**

Update the \`DATABASE_URL\` in \`.env\` to point to your PostgreSQL instance.

### 3. Environment Configuration

Create a \`.env\` file (copy from \`.env.example\`):

\`\`\`env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aspire_library?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Users (comma-separated)
ADMIN_EMAILS="your-email@gmail.com,admin@example.com"

# AI (Optional but recommended)
AI_API_KEY="your-anthropic-api-key"
\`\`\`

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Add Authorized JavaScript origins:
   - \`http://localhost:3000\`
7. Add Authorized redirect URIs:
   - \`http://localhost:3000/api/auth/callback/google\`
8. Copy Client ID and Client Secret to \`.env\`

### 5. Database Migration

\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

### 6. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### User Roles

1. **Admin** - Full system access, can manage users, view audit logs
2. **Librarian** - Can manage books, process loans, view all transactions
3. **Member** - Can search books, check out/return books, view own history

### First Time Setup

1. Sign in with Google using an email listed in \`ADMIN_EMAILS\`
2. You'll be automatically elevated to Admin role
3. Navigate to "Books" to add your library catalog
4. Use AI features to generate descriptions for books

### Key Workflows

**Adding a Book:**
1. Navigate to "Books" → "Add book"
2. Fill in title, author, and other details
3. Click "✨ Generate with AI" for automatic description
4. Submit to add to catalog

**Checking Out a Book:**
1. Find book in catalog
2. Click "Check Out" (if available)
3. Book status changes to "Checked Out"
4. Due date automatically set to 14 days

**Returning a Book:**
1. Navigate to checked-out book
2. Click "Return"
3. Book becomes available again
4. Transaction logged in history

### AI-Powered Features

**AI Search:**
1. Navigate to "Books" page
2. Enter natural language query (e.g., "science fiction from the 90s")
3. Click "AI Search" button
4. AI extracts structured parameters and applies them to search

**Book Recommendations:**
1. On any book in the catalog, click "Similar" button
2. View AI-generated recommendations of similar books
3. Click "View" to navigate to recommended books

**Purchase Recommendations (Librarians/Admins only):**
1. From dashboard, click "Get Purchase Recommendations"
2. AI analyzes loan patterns and most borrowed books
3. Receive 5 data-driven book purchase suggestions
4. Each includes reasoning based on borrowing trends
5. Click "Amazon" to search and purchase recommended books

The AI Purchase Recommendations feature analyzes your library's loan history to suggest new books to acquire from Amazon. By examining borrowing patterns, popular categories, and the most frequently checked-out titles, Claude AI generates data-driven recommendations for 5 books that match proven patron interests. Each recommendation includes the book's details, a description, and most importantly, an explanation of why it fits your library's specific borrowing trends. This transforms book acquisition from guesswork into an evidence-based process, helping librarians invest their budgets in titles that are likely to circulate well.

## 🎨 Project Structure

\`\`\`
aspire-library/
├── app/
│   ├── (protected)/        # Auth-protected routes
│   │   ├── dashboard/      # Main dashboard
│   │   ├── books/          # Book management
│   │   ├── loans/          # Loan history
│   │   └── audit/          # Audit logs (admin only)
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth handlers
│   │   ├── books/          # Book CRUD
│   │   └── ai/             # AI endpoints
│   └── auth/               # Sign-in page
├── components/
│   ├── auth/               # Auth components
│   ├── books/              # Book-related UI
│   └── shell/              # Layout components
├── lib/
│   ├── services/           # Business logic
│   ├── ai.ts               # AI integration
│   ├── auth.ts             # Auth configuration
│   └── prisma.ts           # Database client
└── prisma/
    ├── schema.prisma       # Database schema
    └── migrations/         # DB migrations
\`\`\`

## 🚂 Railway Deployment

### Prerequisites
- Railway account
- GitHub repository

### Deployment Steps

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and init
   railway login
   railway init
   ```

2. **Add PostgreSQL Database**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Copy the \`DATABASE_URL\` connection string

3. **Configure Environment Variables**

   Set these in Railway dashboard or via CLI:

   \`\`\`bash
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway variables set NEXTAUTH_SECRET=<your-secret>
   railway variables set GOOGLE_CLIENT_ID=<your-id>
   railway variables set GOOGLE_CLIENT_SECRET=<your-secret>
   railway variables set ADMIN_EMAILS=your-email@gmail.com
   railway variables set AI_API_KEY=<your-key>
   \`\`\`

4. **Update Google OAuth**
   - Add Railway URL to authorized origins
   - Add callback URL: \`https://your-app.railway.app/api/auth/callback/google\`

5. **Deploy**
   \`\`\`bash
   railway up
   \`\`\`

6. **Migrations and Seed Data**

   The deployment automatically runs:
   - Database migrations (`npx prisma migrate deploy`)
   - Seed data (70+ books, sample users, loan history) - **runs only once if database is empty**

   No manual intervention needed! The app will be pre-populated with demo data on first deployment.

## 🧪 Development

### Available Scripts

\`\`\`bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:up        # Start PostgreSQL (Docker)
npm run db:down      # Stop PostgreSQL
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
\`\`\`

### Database Schema

Key models:
- **User** - Auth identity, role, profile
- **Book** - Library catalog with status tracking
- **Loan** - Check-in/out transactions
- **AuditLog** - Activity tracking
- **Account/Session** - NextAuth tables

## 🔐 Security Notes

- All sensitive operations require authentication
- Role-based access control enforced on server
- Audit logging for administrative actions
- Soft delete prevents accidental data loss
- SQL injection prevention via Prisma
- XSS protection via React

## 🐛 Troubleshooting

**"Cannot connect to database"**
- Check PostgreSQL is running: \`docker compose ps\`
- Verify DATABASE_URL in \`.env\`

**"OAuth error"**
- Check Google OAuth redirect URIs match exactly
- Ensure NEXTAUTH_URL matches your domain
- Verify OAuth consent screen is configured

**"AI features not working"**
- Verify AI_API_KEY is set
- Check Anthropic API quota/limits
- Review API error messages in console

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using Next.js, Prisma, and Claude AI
