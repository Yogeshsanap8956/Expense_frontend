import { type FormEvent, useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Users, Wallet } from "lucide-react";
import { api, inr, type FestivalEvent } from "../api";
import { useAuth } from "../AuthContext";
import { EmptyState, FormField, PageHeader, SkeletonCards, StatusBadge } from "../components/ui";

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" });
}

function prettyTime(hhmm?: string | null) {
  if (!hhmm) return null;
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

const STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function CalendarPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<FestivalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FestivalEvent | null>(null);
  const [error, setError] = useState("");
  const canEdit = user?.role === "admin";

  function refresh() {
    return api.events().then(setRows).finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : "Failed to load events"));
  }, []);

  function startCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function startEdit(row: FestivalEvent) {
    setEditing(row);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      title: String(form.get("title")),
      event_date: String(form.get("event_date")),
      event_time: String(form.get("event_time") || "") || null,
      location: String(form.get("location") || "") || null,
      responsible_person: String(form.get("responsible_person") || "") || null,
      volunteers: String(form.get("volunteers") || "") || null,
      budget: form.get("budget") ? Number(form.get("budget")) : null,
      status: String(form.get("status") || "planned"),
    };
    try {
      if (editing) await api.updateEvent(editing.id, body);
      else await api.createEvent(body);
      event.currentTarget.reset();
      setEditing(null);
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Ganpati Mahotsav 2026"
        title="Festival Calendar"
        description="Every celebration, seva and program in one place."
        action={canEdit && <button className="icon-button" onClick={() => setShowForm((value) => !value)} aria-label="Add event"><Plus size={20} /></button>}
      />
      {error && <p className="error">{error}</p>}
      {canEdit && showForm && (
        <form className="form-card page-enter" onSubmit={onSubmit}>
          <h3><CalendarDays size={18} /> {editing ? "Edit event" : "Create event"}</h3>
          <FormField label="Title"><input name="title" defaultValue={editing?.title || ""} placeholder="Cultural Program" required /></FormField>
          <div className="grid-2">
            <FormField label="Date"><input name="event_date" type="date" defaultValue={editing?.event_date || ""} required /></FormField>
            <FormField label="Time"><input name="event_time" type="time" defaultValue={editing?.event_time?.slice(0, 5) || ""} /></FormField>
          </div>
          <FormField label="Location"><input name="location" defaultValue={editing?.location || ""} placeholder="Mandal premises" /></FormField>
          <FormField label="Responsible person"><input name="responsible_person" defaultValue={editing?.responsible_person || ""} placeholder="Coordinator name" /></FormField>
          <FormField label="Volunteers"><input name="volunteers" defaultValue={editing?.volunteers || ""} placeholder="Rahul, Sneha, Amit" /></FormField>
          <div className="grid-2">
            <FormField label="Budget"><input name="budget" type="number" min={0} defaultValue={editing?.budget ?? ""} placeholder="0" /></FormField>
            <FormField label="Status">
              <select name="status" defaultValue={editing?.status || "planned"}>
                {STATUSES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </FormField>
          </div>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            <button type="submit"><Plus size={18} /> {editing ? "Save changes" : "Add event"}</button>
          </div>
        </form>
      )}
      {loading ? <SkeletonCards /> : rows.length ? <div className="timeline">
        {rows.map((row) => (
          <article className="timeline-card" key={row.id}>
            <div className="event-card-head">
              <time>{prettyDate(row.event_date)}</time>
              {canEdit && <button className="icon-button" onClick={() => startEdit(row)} aria-label={`Edit ${row.title}`}><Pencil size={16} /></button>}
            </div>
            <h3>{row.title}</h3>
            <p><MapPin size={12} /> {row.location || "Mandal premises"}{prettyTime(row.event_time) ? ` · ${prettyTime(row.event_time)}` : ""}</p>
            <div className="event-meta">
              {row.event_time && <span><Clock3 size={12} /> {prettyTime(row.event_time)}</span>}
              {row.responsible_person && <span>{row.responsible_person}</span>}
              {row.volunteers && <span><Users size={12} /> {row.volunteers}</span>}
              {row.budget ? <span><Wallet size={12} /> {inr(row.budget)}</span> : null}
            </div>
            <StatusBadge status={row.status} />
          </article>
        ))}
      </div> : <EmptyState icon={CalendarDays} title="No festival events yet" description="The complete festival calendar will appear here once events are planned."
        action={canEdit && <button onClick={startCreate}>Create event</button>} />}
    </div>
  );
}
