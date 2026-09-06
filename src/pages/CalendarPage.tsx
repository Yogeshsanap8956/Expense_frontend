import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { api, type FestivalEvent } from "../api";
import { EmptyState, PageHeader, SkeletonCards, StatusBadge } from "../components/ui";

export default function CalendarPage() {
  const [rows, setRows] = useState<FestivalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.events().then(setRows).finally(() => setLoading(false));
  }, []);
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Ganpati Mahotsav 2026" title="Festival Calendar" description="Every celebration, seva and program in one place." />
      {loading ? <SkeletonCards /> : rows.length ? <div className="timeline">
        {rows.map((row) => (
          <article className="timeline-card" key={row.id}>
            <time>{new Date(`${row.event_date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}</time>
            <h3>{row.title}</h3>
            <p><MapPin size={12} /> {row.location || "Mandal premises"}</p>
            <StatusBadge status={row.status} />
          </article>
        ))}
      </div> : <EmptyState icon={CalendarDays} title="No festival events yet" description="The complete festival calendar will appear here once events are planned." />}
    </div>
  );
}
