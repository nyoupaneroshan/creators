# creators

Amora Creator Talent & Campaign Management Platform. A full-stack Next.js application with role-based access control (Admin, Regional Manager, Creator), dynamic onboarding workflows, campaign management, submissions, and payouts. Built with Neon PostgreSQL and Prisma.

---

## 🚀 Features

- **Creator Portal**:
  - Simplified multi-step onboarding with customizable guidelines, Discord server links, and contracts.
  - Campaign discovery filtered by country.
  - Task submission, progress tracking, and earnings overview.
- **Regional Manager Portal**:
  - Location-scoped access (e.g., Nepal, India, etc.).
  - Creator verification, submission approval, and campaign assignments.
- **Admin Portal**:
  - Global campaign management with localized pay rates and country restrictions.
  - Country management and regional manager assignments.
  - Customizable onboarding steps per region.
  - Payout tracking and system analytics.
- **Modern Tech Stack**:
  - Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons.
  - Prisma ORM connected to Neon Serverless PostgreSQL.
  - JWT session authentication with role-based middleware.

---

## 🛠️ Local Development

### 1. Prerequisites
- Node.js 18+ or 20+
- A [Neon](https://neon.tech) PostgreSQL database (or local PostgreSQL)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
DATABASE_URL="postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-key-at-least-32-chars"
```

### 4. Database Setup
Push schema and seed initial data (countries, demo accounts, campaigns):
```bash
npx prisma db push
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. **Import the repository** into Vercel from GitHub (`nyoupaneroshan/creators`).
2. In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your Neon PostgreSQL pooled connection string.
   - `JWT_SECRET`: A secure random secret string.
3. Deploy! Next.js and Prisma generate client artifacts automatically during `npm run build`.

---

## 📄 License
MIT
