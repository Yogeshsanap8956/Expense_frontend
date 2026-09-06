import { type FormEvent, useEffect, useState } from "react";
import { IndianRupee, Plus, ReceiptText, Store, WalletCards } from "lucide-react";
import { api, inr, type Expense } from "../api";
import { useAuth } from "../AuthContext";
import { EmptyState, FormField, PageHeader, SectionHeader, SkeletonCards } from "../components/ui";

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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const canEdit = user?.role === "admin" || user?.role === "treasurer";

  function refresh() {
    return Promise.all([
      api.expenses().then(setRows),
      api.expenseReport().then((r) => setReport(r.breakdown)),
    ]).finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createExpense({
        category: String(form.get("category")),
        description: String(form.get("description")),
        amount: Number(form.get("amount")),
        paid_to: String(form.get("paid_to")),
        expense_date: String(form.get("date")),
        payment_method: String(form.get("method")),
      });
      e.currentTarget.reset();
      setShowForm(false);
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not add expense"); }
  }

  const total = report.reduce((sum, item) => sum + item.total, 0);
  const max = Math.max(...report.map((item) => item.total), 1);
  const pretty = (value: string) => value.replaceAll("_", " ");

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Treasury" title="Expenses" description="Every rupee, clearly accounted for."
        action={canEdit && <button className="icon-button" onClick={() => setShowForm((value) => !value)}><Plus size={20} /></button>} />
      {error && <p className="error">{error}</p>}
      <section className="report-hero">
        <span className="eyebrow">Total spent</span>
        <div className="report-balance"><strong>{inr(total)}</strong><span>{rows.length} recorded transactions</span></div>
      </section>
      {canEdit && showForm && (
        <form className="form-card page-enter" onSubmit={onSubmit}>
          <h3>Add expense</h3>
          <FormField label="Category"><select name="category" defaultValue="decoration">{categories.map((category) => <option key={category} value={category}>{pretty(category)}</option>)}</select></FormField>
          <FormField label="Description"><input name="description" placeholder="Lights and decoration" required /></FormField>
          <div className="grid-2">
            <FormField label="Amount"><input name="amount" type="number" placeholder="8,500" required /></FormField>
            <FormField label="Payment"><select name="method"><option value="upi">UPI</option><option value="cash">Cash</option></select></FormField>
          </div>
          <FormField label="Paid to"><input name="paid_to" placeholder="Vendor name" required /></FormField>
          <FormField label="Expense date"><input name="date" type="date" required /></FormField>
          <div className="form-actions"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit"><Plus size={18} /> Add expense</button></div>
        </form>
      )}
      <SectionHeader title="Category overview" subtitle="Where the festival budget is going" />
      {loading ? <SkeletonCards count={2} /> : <section className="category-grid">
        {report.map((item) => (
          <article className="category-card" key={item.category}><span>{pretty(item.category)}</span><strong>{inr(item.total)}</strong><div className="bar-track"><i style={{ width: `${(item.total / max) * 100}%` }} /></div></article>
        ))}
      </section>}
      <SectionHeader title="Recent expenses" subtitle="Latest recorded payments" />
      {loading ? <SkeletonCards /> : rows.length ? rows.map((row) => (
        <article className="list-card" key={row.id}>
          <span className="activity-icon"><ReceiptText size={20} /></span>
          <div className="list-card-main"><h3>{row.description}</h3><p><Store size={12} /> {row.paid_to} · {row.expense_date}</p><span className="status-badge"><WalletCards size={11} /> {row.payment_method}</span></div>
          <div className="list-value"><strong>{inr(row.amount)}</strong><p>{pretty(row.category)}</p></div>
        </article>
      )) : <EmptyState icon={IndianRupee} title="No expenses recorded" description="Add your first festival expense to start the financial report." />}
      {canEdit && !showForm && <div className="fab"><button onClick={() => setShowForm(true)}><Plus size={18} /> Add Expense</button></div>}
    </div>
  );
}
