# Tenure - Right-to-Rent SaaS MVP

Production-ready right-to-rent verification platform for London landlords with enterprise-grade security and Stripe-quality aesthetics.

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Shadcn/UI (Radix Primitives)
- **Database**: Neon (Serverless Postgres) + Drizzle ORM
- **Auth**: Clerk (Middleware protected)
- **Storage**: Cloudflare R2 (S3 Compatible)
- **Async Jobs**: Inngest (Vercel Integration)
- **Icons**: Lucide React

## 🔐 Security Features

- **AES-256-GCM Encryption**: All PII encrypted at application level before storage
- **Secure File Storage**: Presigned URLs for time-limited access (15min upload, 1hr download)
- **Route Protection**: Clerk middleware protecting dashboard routes
- **Type Safety**: Strict TypeScript with zero-error policy

## 📁 Project Structure

```
tenure/
├── app/
│   ├── actions/          # Server Actions
│   │   └── checks.ts     # Check management actions
│   ├── api/
│   │   └── inngest/      # Inngest webhook handler
│   └── dashboard/        # Protected landlord dashboard
│   └── verify/[token]/   # Public tenant verification flow
├── components/
│   ├── ui/               # Shadcn/UI components
│   ├── dashboard/        # Dashboard-specific components
│   └── verify/           # Tenant verification components
├── inngest/
│   └── functions/        # Background job functions
│       └── analyze.ts    # Document analysis job
├── lib/
│   ├── db/              # Database configuration
│   │   ├── index.ts     # Neon connection
│   │   └── schema.ts    # Drizzle schema
│   ├── security.ts      # AES-256-GCM encryption
│   ├── storage.ts       # Cloudflare R2 client
│   └── inngest.ts       # Inngest client
└── middleware.ts        # Clerk authentication middleware
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Neon Database account
- Clerk account
- Cloudflare R2 account
- Inngest account (optional for local dev)

### Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Cloudflare R2
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="tenure-documents"

# Encryption (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY="your-64-character-hex-string"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Push database schema:
```bash
npm run db:push
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Users Table
- `id` (UUID) - Primary key
- `clerkId` (Text) - Clerk user ID
- `email` (Text) - User email
- `createdAt`, `updatedAt` (Timestamp)

### Checks Table
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to users
- `status` (Enum) - pending | analyzing | clear | rejected
- `encryptedPii` (JSONB) - Encrypted tenant data
- `r2FileKey` (Text) - Cloudflare R2 object key
- `magicToken` (Text) - Unique token for tenant access
- `notes` (Text) - Optional landlord notes
- `createdAt`, `updatedAt` (Timestamp)

## 🔄 Workflow

1. **Landlord creates check**: Generates magic link via Server Action
2. **Tenant receives link**: Accesses `/verify/[token]` (mobile-optimized)
3. **Document upload**: Tenant uploads ID document to R2
4. **Background processing**: Inngest job analyzes document (simulated OCR)
5. **PII encryption**: Extracted data encrypted with AES-256-GCM
6. **Status update**: Check status updated to clear/rejected
7. **Dashboard view**: Landlord sees updated status in dashboard

## 🧪 Testing

```bash
# Type check
npm run type-check

# Build
npm run build

# Drizzle Studio (Database GUI)
npm run db:studio
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Add `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY`
- Ensure `ENCRYPTION_KEY` is securely generated and stored

## 🔒 Security Notes

- **Encryption Key**: Must be 64 hex characters (32 bytes). Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **PII Storage**: All personally identifiable information is encrypted before storage
- **File Access**: Presigned URLs expire after 15 minutes (upload) or 1 hour (download)
- **Route Protection**: Dashboard routes require authentication via Clerk

## 📝 Phase 2 Enhancements

- [ ] Real OCR integration (AWS Textract, Google Vision)
- [ ] Webhook integration for automatic Inngest triggers
- [ ] Email notifications for status updates
- [ ] Clerk webhook for user sync
- [ ] Advanced analytics dashboard
- [ ] Bulk check creation
- [ ] Export functionality (CSV, PDF)

## 📄 License

Private - All Rights Reserved

## 🤝 Support

For issues or questions, contact the development team.
