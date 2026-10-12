const form = document.getElementById("transactionForm");
const rows = document.getElementById("transactionRows");
const message = document.getElementById("formMessage");
const dateInput = document.getElementById("date");

dateInput.value = new Date().toISOString().slice(0, 10);

const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2
}).format(Number(value || 0));

async function loadDashboard() {
  try {
    const [summaryResponse, transactionResponse] = await Promise.all([
      fetch("/api/summary"), fetch("/api/transactions")
    ]);
    if (!summaryResponse.ok || !transactionResponse.ok) throw new Error("Could not load data");
    const summary = await summaryResponse.json();
    const transactions = await transactionResponse.json();

    document.getElementById("balance").textContent = money(summary.balance);
    document.getElementById("income").textContent = money(summary.income);
    document.getElementById("expenses").textContent = money(summary.expenses);
    document.getElementById("transactionCount").textContent = `${summary.count} item${summary.count === 1 ? "" : "s"}`;

    if (!transactions.length) {
      rows.innerHTML = '<tr><td colspan="4" class="empty-state">No transactions yet. Add your first one!</td></tr>';
      return;
    }
    rows.innerHTML = transactions.map(item => `
      <tr>
        <td>${escapeHtml(item.title)}<small>${escapeHtml(item.category)} · ${item.type}</small></td>
        <td>${escapeHtml(item.date)}</td>
        <td class="${item.type === "income" ? "amount-income" : "amount-expense"}">${item.type === "income" ? "+" : "−"}${money(item.amount)}</td>
        <td><button class="delete-button" data-delete="${item.id}" aria-label="Delete ${escapeHtml(item.title)}">✕</button></td>
      </tr>`).join("");
  } catch (error) {
    rows.innerHTML = '<tr><td colspan="4" class="empty-state">Could not connect to the server. Please restart it.</td></tr>';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "Saving…";
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save transaction.");
    form.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
    message.textContent = "Transaction saved successfully!";
    await loadDashboard();
  } catch (error) {
    message.textContent = error.message || "Server error. Please try again.";
  }
});

rows.addEventListener("click", async event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  if (!confirm("Delete this transaction?")) return;
  try {
    const response = await fetch(`/api/transactions/${button.dataset.delete}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not delete transaction.");
    await loadDashboard();
  } catch (error) {
    alert(error.message);
  }
});

loadDashboard();