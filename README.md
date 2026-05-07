# Finance Tracker (React + Node/Express + SQLite)

This project replaces the original `localStorage`-only implementation with a full stack:
- **Client:** React
- **Server:** Node + Express
- **Auth:** JWT (Bearer token)
- **Database:** SQLite

## Features
- User **register** / **login**
- Per-user finance data storage
- Dashboard CRUD:
  - Add / edit / delete **income** and **expense** items
  - Create/delete **categories** (categories are derived from stored item categories; emojis default + discovered categories)
  - Snapshot totals (income, expenses, net flow)

## Folder structure
- `server/` — Express API + SQLite
- `client/` — React app

## Prerequisites
- Node.js 18+ recommended

## Setup
### 1) Server environment
Copy the env example:

```bash
cd server
copy .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET` (change from `change_me`)

Default values:
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`
- `SQLITE_FILE=./data/app.db`

### 2) Install dependencies
From repo root:

```bash
npm install
```

### 3) Run dev
From repo root:

```bash
npm run dev
```

This starts:
- Express server (port `4000` by default)
- React dev server (port `5173` by default)

## API overview
Base path: `http://localhost:4000/api`

### Auth
- `POST /api/register`
  - body: `{ username, email, password }`
  - returns: `{ token, user }`

- `POST /api/login`
  - body: `{ usernameOrEmail, password }`
  - returns: `{ token, user }`

### Protected data (JWT required)
Send header:
- `Authorization: Bearer <token>`

- `GET /api/me/data`
  - returns: `{ data: { income: [], expense: [] }, categories: { income: {}, expense: {} } }`

- `POST /api/me/data/items`
  - body: `{ type: 'income'|'expense', name, amount, category }`
  - returns: `{ id }`

- `PUT /api/me/data/items/:id`
  - body: `{ type, name, amount, category }`

- `DELETE /api/me/data/items/:id`

- `DELETE /api/me/data/categories/:type/:categoryName`
  - deletes all items in that category

## Build / production
### Build client
```bash
npm -w client run build
```

### Start server
```bash
npm -w server run start
```

(React dev server is separate in this setup.)

## Notes / implementation details
- Passwords are hashed with `bcryptjs`.
- SQLite schema is created automatically at server startup.
- Categories are not stored as a separate table; they are inferred from `items.category` plus defaults.

## Troubleshooting
- **CORS errors:** ensure `server/.env` has `CORS_ORIGIN=http://localhost:5173` (or your actual client URL).
- **JWT errors:** ensure `JWT_SECRET` matches what’s in `.env`.
- **Port already in use:** change `PORT` in `server/.env`.

