import { useEffect, useState } from "react";
import { Check, HandCoins, Sparkles, X } from "lucide-react";
import { api, inr, type AartiSlot, type Vargani } from "../api";
import { useAuth } from "../AuthContext";
import { EmptyState, PageHeader, ProgressRing, SkeletonCards, StatusBadge } from "../components/ui";

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function prettyTime(hhmm: string) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function MySevaPage() {
  const { user } = useAuth();
  const [vargani, setVargani] = useState<Vargani | null>(null);
  const [slots, setSlots] = useState<AartiSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    const [rows, aarti] = await Promise.all([api.vargani(), api.aarti()]);
    const mine = rows.find((row) => row.member_id === user?.id) || rows[0] || null;
    setVargani(mine);
    setSlots(aarti);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : "Could not load your seva"));
  }, []);

  async function setAvailability(slot: AartiSlot, available: boolean) {
    const updated = await api.setAartiAvailability(slot.id, available);
    setSlots((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  const percentage = vargani?.expected_amount ? (vargani.amount_paid / vargani.expected_amount) * 100 : 0;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Your contribution" title="My Seva" description="See your vargani and mark aarti availability." />
      {error && <p className="error">{error}</p>}
      {loading ? <SkeletonCards count={3} /> : (
        <>
          {vargani ? (
            <section className="progress-card">
              <div>
                <span className="eyebrow">My vargani</span>
                <h3>{inr(vargani.amount_paid)} <small>/ {inr(vargani.expected_amount)}</small></h3>
                <p>{vargani.house_number || user?.name} · {vargani.status.replaceAll("_", " ")}</p>
                {vargani.receipt_number && <p>Receipt {vargani.receipt_number}</p>}
              </div>
              <ProgressRing value={percentage} label="paid" size={102} />
            </section>
          ) : (
            <EmptyState icon={HandCoins} title="No vargani record yet" description="Ask the treasurer to add your house to this year's collection." />
          )}
          {vargani && (
            <article className="list-card">
              <div className="list-card-main">
                <h3>{vargani.member_name}</h3>
                <p>Pending {inr(vargani.pending_amount)}</p>
                <StatusBadge status={vargani.status} />
              </div>
              <div className="list-value">
                <strong>{inr(vargani.amount_paid)}</strong>
                <p>{vargani.payment_date || "Not paid yet"}</p>
              </div>
            </article>
          )}
          <section className="aarti-day">
            <h3><Sparkles size={18} /> Aarti availability</h3>
            <span className="eyebrow">Tell the coordinator when you can serve</span>
            {slots.length ? slots.map((slot) => (
              <article className="aarti-slot" key={slot.id}>
                <div className="slot-heading">
                  <div>
                    <h4>{slot.session === "morning" ? "Morning Aarti" : "Evening Aarti"}</h4>
                    <p className="muted small">{prettyDate(slot.slot_date)} · {prettyTime(slot.start_time)}</p>
                  </div>
                  <StatusBadge status={slot.members.some((member) => member.id === user?.id) ? "Assigned" : slot.my_availability ? "Available" : "Pending"} />
                </div>
                <div className="choice-row">
                  <button type="button" className={slot.my_availability === true ? "choice selected" : "choice"} onClick={() => setAvailability(slot, true)}>
                    <Check size={17} /> I'm Available
                  </button>
                  <button type="button" className={slot.my_availability === false ? "choice selected" : "choice"} onClick={() => setAvailability(slot, false)}>
                    <X size={17} /> Not available
                  </button>
                </div>
              </article>
            )) : <p className="muted small">Aarti slots will appear here once the coordinator publishes the schedule.</p>}
          </section>
        </>
      )}
    </div>
  );
}
