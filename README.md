# Lead Management Platform

A production-ready Lead Management System built with Next.js, Prisma, and NextAuth.js, designed for the Digital Heroes Technical Assessment.

## Features
- **Public Capture Form**: Submit leads directly to the system (landing page).
- **Role-Based Access Control (RBAC)**: Supports `ADMIN` and `MEMBER` roles. 
  - Admins can manage all leads and assignments.
  - Members only see and manage leads assigned to them.
- **Lead Dashboard**: View and manage the lifecycle of leads with a kanban/table view.
- **Activity Logging & Notes**: Track everything that happens with a lead.
- **RESTful API**: Endpoints with pagination, filtering, and validation using Zod.

## Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Database**: SQLite (via Prisma ORM and `@prisma/adapter-better-sqlite3`)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Validation**: Zod
- **Styling**: Tailwind CSS & Lucide Icons

## Getting Started

### Prerequisites
- Node.js (v18+)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file with the database URL and an auth secret (generate one with `openssl rand -base64 32`):
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<your-random-secret>"
NEXTAUTH_URL="http://localhost:3000"
```

3. Push the schema to the SQLite database:
```bash
npx prisma db push
```

4. Seed the database with demo data:
```bash
npx prisma db seed
```
*Note: This creates two demo users: `admin@digitalheroes.demo` (password: `Admin@12345`) and `member@digitalheroes.demo` (password: `Member@12345`).*

5. Run the development server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints
- `POST /api/leads/public` - Capture a new lead publicly
- `GET /api/leads` - Get leads (supports pagination `?page=1&limit=10`)
- `GET /api/leads/[id]` - Get a specific lead
- `PATCH /api/leads/[id]` - Update a lead
- `DELETE /api/leads/[id]` - Delete a lead (Admin only)
- `POST /api/leads/[id]/notes` - Add a note to a lead

## Testing
Run unit tests with Jest:
```bash
npm run test
```

## Build
To compile for production:
```bash
npm run build
```
