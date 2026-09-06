import { useEffect, useState } from "react";
import {
  CalendarDays, HandCoins, Megaphone, Plus, ReceiptText, Sparkles,
  TrendingUp, Utensils, WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, inr, type Dashboard } from "../api";
import { AnimatedNumber, SectionHeader, SkeletonCards, StatCard } from "../components/ui";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <SkeletonCards count={4} />;

  const percentage = data.vargani_expected ? (data.vargani_collected / data.vargani_expected) * 100 : 0;
  const activities = [
    { title: "Today's Aarti", value: data.today_evening_aarti || data.today_morning_aarti || "Not scheduled", detail: `${data.today_aarti_members} members assigned`, icon: Sparkles, live: Boolean(data.today_evening_aarti || data.today_morning_aarti) },
    { title: "Mahaprasad", value: data.today_mahaprasad || "Not scheduled", detail: "View menu and serving team", icon: Utensils, live: Boolean(data.today_mahaprasad) },
    { title: "Announcement", value: data.announcements[0]?.title || "No new notice", detail: data.announcements[0]?.body || "You're all caught up", icon: Megaphone, live: Boolean(data.announcements[0]) },
  ];
  const quickActions = [
    { to: "/vargani", label: "Add Vargani", icon: HandCoins },
    { to: "/expenses", label: "Add Expense", icon: Plus },
    { to: "/aarti", label: "Aarti", icon: Sparkles },
    { to: "/prasad", label: "Mahaprasad", icon: Utensils },
    { to: "/announcements", label: "Notice", icon: Megaphone },
    { to: "/report", label: "Reports", icon: ReceiptText },
  ];

  return (
    <div className="page-stack">
      <section className="festival-hero">
        <div className="hero-particles"><i /><i /><i /></div>
        <div className="ganpati-orb">ॐ</div>
        <div className="hero-copy">
          <p className="hero-greeting">जय श्री गणेश 🙏</p>
          <h2>Ganpati Mahotsav 2026</h2>
          <p>{data.mandal_name}</p>
        </div>
        <div className="hero-bottom">
          <div className="hero-balance"><span>Current balance</span><strong><AnimatedNumber value={data.balance} formatter={inr} /></strong></div>
          <div className="hero-day"><span>Festival</span><strong>Day 3 of 7</strong></div>
        </div>
      </section>

      <SectionHeader title="Financial overview" subtitle="Live festival accounts" />
      <section className="metrics-grid">
        <StatCard label="Vargani" value={data.vargani_collected} icon={HandCoins} detail={`${Math.round(percentage)}% collected`} progress={percentage} />
        <StatCard label="Expenses" value={data.expenses_spent} icon={WalletCards} tone="red" detail="Total spent" />
        <StatCard label="Balance" value={data.balance} icon={TrendingUp} tone="gold" detail="Available funds" />
        <StatCard label="Pending" value={data.vargani_pending} icon={CalendarDays} tone="cream" detail="To be collected" />
      </section>

      <SectionHeader title="Today's activities" subtitle="What's happening at the mandal" />
      <section className="activities-scroll">
        {activities.map(({ title, value, detail, icon: Icon, live }) => (
          <article className={`activity-card ${live ? "live" : ""}`} key={title}>
            <span className="activity-icon"><Icon size={22} /></span>
            <div><strong>{title}</strong><b>{value}</b><small>{detail}</small></div>
          </article>
        ))}
      </section>

      <SectionHeader title="Quick actions" subtitle="Everything one tap away" />
      <section className="quick-grid">
        {quickActions.map(({ to, label, icon: Icon }) => (
          <Link to={to} className="quick-action" key={label}><span className="quick-icon"><Icon size={20} /></span>{label}</Link>
        ))}
      </section>

      <SectionHeader title="Upcoming events" subtitle="Festival calendar" action={<Link to="/calendar" className="eyebrow">View all</Link>} />
      <div className="timeline">
        {data.upcoming_events.slice(0, 4).map((event) => (
          <article className="timeline-card" key={event.id}><time>{event.event_date}</time><h3>{event.title}</h3><p>{event.location || "Mandal premises"}</p></article>
        ))}
      </div>
    </div>
  );
}
