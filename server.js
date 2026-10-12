const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, "moneymentor.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/transactions", (req, res) => {
  const rows = db.prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC").all();
  res.json(rows);
});

app.get("/api/summary", (req, res) => {
  const income = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type='income'").get().total;
  const expenses = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type='expense'").get().total;
  const count = db.prepare("SELECT COUNT(*) AS total FROM transactions").get().total;
  res.json({ income, expenses, balance: income - expenses, count });
});

app.post("/api/transactions", (req, res) => {
  const { title, amount, type, category, date } = req.body;
  const numericAmount = Number(amount);
  if (!title || !Number.isFinite(numericAmount) || numericAmount <= 0 ||
      !["income", "expense"].includes(type) || !category || !date) {
    return res.status(400).json({ error: "Please enter valid transaction details." });
  }
  const result = db.prepare(
    "INSERT INTO transactions (title, amount, type, category, date) VALUES (?, ?, ?, ?, ?)"
  ).run(String(title).trim(), numericAmount, type, String(category).trim(), date);
  res.status(201).json(db.prepare("SELECT * FROM transactions WHERE id=?").get(result.lastInsertRowid));
});

app.delete("/api/transactions/:id", (req, res) => {
  const result = db.prepare("DELETE FROM transactions WHERE id=?").run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Transaction not found." });
  res.json({ success: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Student MoneyMentor running at http://localhost:${PORT}`);
});