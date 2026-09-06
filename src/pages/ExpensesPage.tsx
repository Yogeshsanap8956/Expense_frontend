import { type FormEvent, useEffect, useState } from "react";
import { api, inr, type Expense } from "../api";
import { useAuth } from "../AuthContext";

const categories = [
  "decoration",
  "sound_system",
  "lighting",
  "ganpati_idol",
  "prasad",
  "flowers",
  "pooja_material",
  "cleaning",
  "electricity",
  "transportation",
  "cultural_programs",
  "other",
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Expense[]>([]);
  const [report, setReport] = useState<{ category: string; total: number }[]>([]);
  const canEdit = user?.role === "admin" || user?.role === "treasurer";

  function refresh() {
    api.expenses().then(setRows);
    api.expenseReport().then((r) => setReport(r.breakdown));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.createExpense({
      category: String(form.get("category")),
      description: String(form.get("description")),
      amount: Number(form.get("amount")),
      paid_to: String(form.get("paid_to")),
      expense_date: String(form.get("date")),
      payment_method: String(form.get("method")),
    });
    e.currentTarget.reset();
    refresh();
  }

  return (
    <div className="stack">
      <h2>💸 Expenses</h2>
      {canEdit && (
        <form className="stack card" onSubmit={onSubmit}>
          <select name="category" defaultValue="decoration">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input name="description" placeholder="Description" required />
          <input name="amount" type="number" placeholder="Amount" required />
          <input name="paid_to" placeholder="Paid to" required />
          <input name="date" type="date" required />
          <select name="method">
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
          </select>
          <button type="submit">Add expense</button>
        </form>
      )}
      <article className="stat">
        <h3>📊 Expense report</h3>
        {report.map((item) => (
          <p key={item.category}>
            {item.category} {inr(item.total)}
          </p>
        ))}
      </article>
      {rows.map((row) => (
        <article className="stat" key={row.id}>
          <p>
            <strong>{row.category}</strong> · {row.description}
          </p>
          <p>
            {inr(row.amount)} · {row.paid_to} · {row.expense_date}
          </p>
        </article>
      ))}
    </div>
  );
}
