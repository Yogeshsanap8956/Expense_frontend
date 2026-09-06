import { useEffect, useState } from "react";
import { api, inr, type Dashboard } from "../api";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading dashboard…</p>;

  return (
    <div className="stack">
      <section className="hero-card">
        <h2>🛕 {data.mandal_name}</h2>
      </section>
      <section className="grid-2">
        <article className="stat">
          <h3>💰 Vargani</h3>
          <p>Collected {inr(data.vargani_collected)}</p>
          <p>Pending {inr(data.vargani_pending)}</p>
        </article>
        <article className="stat">
          <h3>💸 Expenses</h3>
          <p>Spent {inr(data.expenses_spent)}</p>
          <p>Balance {inr(data.balance)}</p>
        </article>
      </section>
      <article className="stat">
        <h3>📅 Today</h3>
        <p>Morning Aarti {data.today_morning_aarti || "—"}</p>
        <p>Evening Aarti {data.today_evening_aarti || "—"}</p>
        <p>Mahaprasad {data.today_mahaprasad || "—"}</p>
        <p>👥 Today's Aarti members {data.today_aarti_members}</p>
      </article>
      <article className="stat">
        <h3>Upcoming events</h3>
        {data.upcoming_events.map((event) => (
          <p key={event.id}>
            {event.event_date} · {event.title}
          </p>
        ))}
      </article>
      {data.announcements[0] && (
        <article className="stat alert">
          <h3>📢 {data.announcements[0].title}</h3>
          <p>{data.announcements[0].body}</p>
        </article>
      )}
    </div>
  );
}
