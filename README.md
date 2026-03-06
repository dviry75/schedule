# SaaS Scheduling Engine (Fullstack)

Backend (Fastify + Prisma) is the root project.  
Frontend (Lovable React app) is auto-detected inside `./frontend`.

## Project Structure

- Backend: root (`src`, `prisma`, `package.json`)
- Frontend source: `frontend/precision-panel-23-main`
- Frontend production build output: `frontend/dist`

## Local Development

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
npm run frontend:install
```

3. Configure environment:
```bash
cp .env.example .env
```
Use:
- `DATABASE_URL="file:./dev.db"`
- `JWT_SECRET=dev_jwt_secret_change_me_123456`

4. Initialize Prisma:
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

5. Run full stack (API + Worker + Frontend) with one command:
```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3000`
- Worker process
- Frontend dev server on `http://localhost:8080`

Frontend API calls to `/api/*` are proxied to `http://localhost:3000`.

## API Base Path

All backend routes are available under `/api`.
Examples:
- `POST /api/auth/login`
- `POST /api/schedules`
- `GET /api/metrics/dashboard`

## Production Build

Build both backend and frontend:
```bash
npm run build
```

- Frontend is built into `frontend/dist`
- Backend is built into `dist`

Start backend server:
```bash
npm start
```

In production mode, backend serves static frontend files from `frontend/dist` and keeps API endpoints under `/api`.
