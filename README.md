# College Library Management System

A full-stack web application for managing college library books and borrowing records.

## Features

### Student Features
- Login with college roll number and password
- Borrow books by entering Book ID
- View currently borrowed books
- Return borrowed books
- Track due dates and overdue books
- Borrow limit: 3 books at a time
- 30-day loan period per book

### Admin Features
- Dashboard with statistics and recent activity
- Manage books (add, edit, delete)
- Manage students (add, edit, delete, reset passwords)
- View and manage borrow records
- Force return books on behalf of students
- Manage admin accounts

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend:** React 18 with TypeScript
- **Backend:** Next.js API Routes
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **Password Hashing:** bcryptjs

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MySQL database (local or cloud)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   cd dontknowi
   npm install
   ```

2. **Set up environment variables:**

   Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```

   Update the following in `.env`:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/library_db"
   NEXTAUTH_SECRET="your-random-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   Generate a secure NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. **Set up the database:**

   Create the MySQL database:
   ```bash
   mysql -u root -p
   CREATE DATABASE library_db;
   exit;
   ```

   Push the Prisma schema to the database:
   ```bash
   npx prisma db push
   ```

   Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. **Seed the database:**

   Create initial admin and sample data:
   ```bash
   npm run seed
   ```

   This creates:
   - Admin account: `ADMIN001` / `admin123`
   - Student accounts: `STU001` / `student123`, `STU002` / `student123`
   - Sample books: BOOK001-BOOK005

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

### Admin
- **ID:** ADMIN001
- **Password:** admin123

### Students
- **Roll Number:** STU001 or STU002
- **Password:** student123

## Project Structure

```
dontknowi/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── admin/            # Admin pages
│   │   ├── student/          # Student pages
│   │   ├── login/            # Login page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
└── package.json
```

## Database Schema

- **Students:** Roll number, name, email, department, password
- **Admins:** Admin ID, name, email, password
- **Books:** Book ID, title, author, ISBN, status
- **Borrow Records:** Links students to books with dates and status

## API Endpoints

### Student Endpoints
- `GET /api/student/dashboard` - Get dashboard data
- `POST /api/student/borrow` - Borrow a book
- `POST /api/student/return` - Return a book

### Admin Endpoints
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/books` - List all books
- `POST /api/admin/books` - Add new book
- `PUT /api/admin/books/[bookId]` - Update book
- `DELETE /api/admin/books/[bookId]` - Delete book
- Similar endpoints for students, borrow records, and admins

## Development

- **Build:** `npm run build`
- **Start production:** `npm start`
- **Lint:** `npm run lint`
- **Database Studio:** `npx prisma studio`

## Notes

- Students cannot register themselves; accounts are created by admins
- Students cannot change their own passwords; only admins can reset them
- Books cannot be deleted if currently borrowed
- Students cannot be deleted if they have active borrows
- At least one admin account must exist at all times
- Overdue books block students from borrowing new books
