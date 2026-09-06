import { type FormEvent, useEffect, useState } from "react";
import { api, inr, type Vargani } from "../api";
import { useAuth } from "../AuthContext";

export default function VarganiPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Vargani[]>([]);
  const canEdit = user?.role === "admin" || user?.role === "treasurer";

  function refresh() {
    api.vargani().then(setRows);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function markPaid(row: Vargani) {
    await api.updateVargani(row.id, {
      amount_paid: row.expected_amount,
      payment_method: "upi",
      payment_date: new Date().toISOString().slice(0, 10),
    } as Partial<Vargani>);
    refresh();
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
    refresh();
  }

  return (
    <div className="stack">
      <h2>💰 Vargani</h2>
      {canEdit && (
        <form className="stack card" onSubmit={addMember}>
          <input name="house" placeholder="House e.g. A-101" required />
          <input name="name" placeholder="Member name" required />
          <input name="phone" placeholder="Phone" required />
          <input name="expected" type="number" placeholder="Expected amount" defaultValue={1500} />
          <button type="submit">Add house / member</button>
        </form>
      )}
      {rows.map((row) => (
        <article className="stat" key={row.id}>
          <p>
            <strong>{row.house_number}</strong> · {row.member_name}
          </p>
          <p>
            {inr(row.amount_paid)} / {inr(row.expected_amount)} · {row.status === "paid" ? "✅ Paid" : "❌ Pending"}
          </p>
          {canEdit && row.status !== "paid" && (
            <div className="row">
              <button onClick={() => markPaid(row)}>Mark paid</button>
              <button className="ghost" onClick={() => remind(row)}>
                WhatsApp reminder
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
