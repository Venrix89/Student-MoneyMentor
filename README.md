# Student MoneyMentor 💜

A full-stack student finance dashboard built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## Features
- Add income and expense transactions
- Categorize transactions and select dates
- Automatically calculate balance, total income, and total expenses
- View recent transactions
- Delete transactions
- Persistent SQLite database
- Responsive layout for desktop and mobile
- Input validation and parameterized SQL queries

## Tech stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite via better-sqlite3

## Run locally
1. Install Node.js (LTS) from https://nodejs.org/
2. Open a terminal inside this project folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open http://localhost:3000

The database file `moneymentor.db` is created automatically when the server starts.

## API routes
- `GET /api/summary` — totals and balance
- `GET /api/transactions` — list transactions
- `POST /api/transactions` — create a transaction
- `DELETE /api/transactions/:id` — delete a transaction

## GitHub upload
Create a new repository on GitHub, then upload this folder's files. Do not upload `node_modules/` or your local `moneymentor.db` file.

## Note
This starter is intended for local demos and learning. It does not include user accounts or cloud deployment configuration.
