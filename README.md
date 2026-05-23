# Library App

REST API backend for a library management system. Built as an intermediate-level project for **Primakara Developers**.

## Features
 
- **JWT authentication** — register, login, token-based access control
- **Password hashing** — bcrypt with configurable salt rounds
- **Book management** — CRUD for library books via PostgreSQL (Prisma ORM)
- **Image/file uploads** — Multer handles multipart; Cloudinary stores files
- **Request validation** — express-validator on all inputs
- **Structured logging** — Pino + pino-http with configurable log level
- **Database seeding** — Faker-powered seed scripts for dev data
- **CI/CD** — GitHub Actions workflow included

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **ORM:** Prisma 7 + PostgreSQL (`pg`)
- **Auth:** JWT + bcrypt
- **File uploads:** Multer + Cloudinary
- **Validation:** express-validator
- **Logging:** Pino + pino-http
- **Dev:** Nodemon

## Requirements

- Node.js >= 18
- PostgreSQL database
- Cloudinary account (for file/image uploads)

## Getting Started

### 1. Clone repo

```bash
git clone https://github.com/Hkaar/primedev-library-app.git
cd primedev-library-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PORT=3000

# Use DIRECT_URL (not pg_bouncer URL) for Prisma
DATABASE_URL=""

JWT_SECRET=""
BCRYPT_SALT_ROUNDS=10

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

LOG_LEVEL=info
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start dev server

```bash
npm run dev
```

Server starts on `http://localhost:3000` (or your configured `PORT`).

## Project Structure

```text
primedev-library-app/
├── .github/
│   └── workflows/          # CI/CD GitHub Actions
├── helpers/                # Utility/helper functions
├── lib/                    # Shared libraries & modules
├── prisma/                 # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── src/                    # Main application source
│   ├── routes/             # Express route handlers
│   ├── controllers/        # Business logic
│   └── middleware/         # Express middleware
├── .env.example            # Environment variable template
├── prisma.config.js        # Prisma configuration
├── package.json
└── README.md
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
