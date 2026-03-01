# 📚 Aspire Library Management System

A modern, full-stack library management web application built with Next.js 16, featuring Google OAuth authentication, AI-powered search and recommendations, and comprehensive loan tracking.

## DEMO
https://aspire-library-production.up.railway.app

## ✨ Features

### Core Functionality
- **Book Management** - Full CRUD operations for library catalog
- **Loan System** - Check-in/check-out workflow with due date tracking
- **Advanced Search** - Multi-field search with filtering by status, category, and year
- **Role-Based Access** - Three user roles (Admin, Librarian, Member) with different permissions

### AI-Powered Features
- **Smart Search** - Natural language queries powered by Claude AI
- **Auto-Generated Descriptions** - AI-generated book descriptions
- **Recommendations** - Intelligent book recommendations based on similarity

### Administrative Features
- **Audit Logging** - Complete activity tracking for all operations
- **Soft Delete** - Archive books instead of permanent deletion
- **User Management** - Auto-elevation of admin users via email whitelist
- **Loan History** - Complete borrowing history with status tracking

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

6. **Run Migrations**
   \`\`\`bash
   railway run npx prisma migrate deploy
   \`\`\`

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
