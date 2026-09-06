import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Check, HandCoins, MessageCircle, Plus, Search, UserPlus } from "lucide-react";
import { api, inr, type Vargani } from "../api";
import { useAuth } from "../AuthContext";
import { EmptyState, FormField, MemberAvatar, PageHeader, ProgressRing, SkeletonCards, StatusBadge } from "../components/ui";

export default function VarganiPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Vargani[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const canEdit = user?.role === "admin" || user?.role === "treasurer";

  function refresh() {
    return api.vargani().then(setRows).finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function markPaid(row: Vargani) {
    try {
      await api.updateVargani(row.id, {
        amount_paid: row.expected_amount,
        payment_method: "upi",
        payment_date: new Date().toISOString().slice(0, 10),
      } as Partial<Vargani>);
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update payment"); }
  }

  async function remind(row: Vargani) {
    const data = await api.reminder(row.id);
    window.open(data.whatsapp_url, "_blank");
  }

  async function addMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.createMember({
      name: form.get("name"),
      phone: form.get("phone"),
      house_number: form.get("house"),
      password: "member123",
      expected_vargani: Number(form.get("expected") || 1500),
      role: "member",
    });
    e.currentTarget.reset();
    setShowForm(false);
    await refresh();
  }

  const totals = useMemo(() => rows.reduce((result, row) => ({
    expected: result.expected + row.expected_amount,
    paid: result.paid + row.amount_paid,
  }), { expected: 0, paid: 0 }), [rows]);
  const percentage = totals.expected ? (totals.paid / totals.expected) * 100 : 0;
  const filtered = rows.filter((row) => `${row.member_name} ${row.house_number || ""}`.toLowerCase().includes(query.toLowerCase()));
  const counts = {
    paid: rows.filter((row) => row.status === "paid").length,
    pending: rows.filter((row) => row.status === "pending").length,
    partial: rows.filter((row) => row.status === "partial").length,
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Collections" title="Vargani" description="Track every contribution with complete transparency."
        action={canEdit && <button className="icon-button" onClick={() => setShowForm((value) => !value)} aria-label="Add member"><Plus size={20} /></button>} />
      {error && <p className="error">{error}</p>}
      {loading ? <SkeletonCards count={3} /> : (
        <section className="progress-card">
          <div><span className="eyebrow">Total collection</span><h3>{inr(totals.paid)} <small>/ {inr(totals.expected)}</small></h3><p>{rows.length} houses in this year's collection</p></div>
          <ProgressRing value={percentage} label="collected" size={102} />
        </section>
      )}
      <section className="metrics-grid">
        <article className="metric-card tone-saffron"><span className="metric-label">Paid</span><strong>{counts.paid}</strong><small>Completed payments</small></article>
        <article className="metric-card tone-red"><span className="metric-label">Pending</span><strong>{counts.pending}</strong><small>Awaiting collection</small></article>
        <article className="metric-card tone-gold"><span className="metric-label">Partial</span><strong>{counts.partial}</strong><small>Partly received</small></article>
      </section>
      {canEdit && showForm && (
        <form className="form-card page-enter" onSubmit={addMember}>
          <h3><UserPlus size={18} /> Add house / member</h3>
          <div className="grid-2">
            <FormField label="House number"><input name="house" placeholder="A-101" required /></FormField>
            <FormField label="Expected amount"><input name="expected" type="number" defaultValue={1500} required /></FormField>
          </div>
          <FormField label="Member name"><input name="name" placeholder="Rahul Patil" required /></FormField>
          <FormField label="Phone number"><input name="phone" placeholder="9876543210" inputMode="numeric" required /></FormField>
          <div className="form-actions"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit"><Plus size={18} /> Add member</button></div>
        </form>
      )}
      <div className="form-field"><div className="list-card"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search house or member" aria-label="Search members" /></div></div>
      {loading ? <SkeletonCards /> : filtered.length ? filtered.map((row) => (
        <article className="list-card" key={row.id}>
          <MemberAvatar name={row.member_name} />
          <div className="list-card-main"><h3>{row.member_name}</h3><p>{row.house_number || "No house"} · {row.phone}</p><StatusBadge status={row.status} /></div>
          <div className="list-value"><strong>{inr(row.amount_paid)}</strong><p>of {inr(row.expected_amount)}</p></div>
          {canEdit && row.status !== "paid" && <div className="row">
            <button className="icon-button whatsapp-button" onClick={() => remind(row)} title="WhatsApp reminder"><MessageCircle size={18} /></button>
            <button className="icon-button" onClick={() => markPaid(row)} title="Mark paid"><Check size={18} /></button>
          </div>}
        </article>
      )) : <EmptyState icon={HandCoins} title="No contributions found" description="Try another search or add the first member to this year's collection." />}
    </div>
  );
}
