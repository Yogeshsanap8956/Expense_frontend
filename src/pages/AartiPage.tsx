import { type FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, Plus, Sparkles, UserCheck, Users, X } from "lucide-react";
import { api, type AartiSlot, type User } from "../api";
import { useAuth } from "../AuthContext";
import { AvatarStack, EmptyState, FormField, PageHeader, SkeletonCards, StatusBadge } from "../components/ui";

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function prettyTime(hhmm: string) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function sessionLabel(session: string) {
  return session === "morning" ? "Morning Aarti" : "Evening Aarti";
}

export default function AartiPage() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AartiSlot[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const canAssign = user?.role === "admin" || user?.role === "aarti_coordinator";

  async function refresh() {
    const [nextSlots, nextMembers] = await Promise.all([api.aarti(), api.members()]);
    setSlots(nextSlots);
    setMembers(nextMembers);
    const nextSelected: Record<number, number[]> = {};
    for (const slot of nextSlots) nextSelected[slot.id] = slot.members.map((member) => member.id);
    setSelected(nextSelected);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : "Failed to load aarti"));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, AartiSlot[]>();
    for (const slot of slots) {
      const list = map.get(slot.slot_date) ?? [];
      list.push(slot);
      map.set(slot.slot_date, list);
    }
    return [...map.entries()];
  }, [slots]);

  async function setAvailability(slot: AartiSlot, available: boolean) {
    const updated = await api.setAartiAvailability(slot.id, available);
    setSlots((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  function toggleMember(slotId: number, memberId: number) {
    setSelected((prev) => {
      const current = prev[slotId] ?? [];
      const next = current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId];
      return { ...prev, [slotId]: next };
    });
  }

  async function assign(slot: AartiSlot) {
    const updated = await api.assignAarti(slot.id, selected[slot.id] ?? []);
    setSlots((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function createDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.createAartiDay({
      slot_date: String(form.get("slot_date")),
      morning_time: String(form.get("morning_time") || "06:30"),
      evening_time: String(form.get("evening_time") || "19:30"),
    });
    event.currentTarget.reset();
    setShowForm(false);
    await refresh();
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Daily seva" title="Aarti Schedule" description="Confirm your availability and see your assigned team."
        action={canAssign && <button className="icon-button" onClick={() => setShowForm((value) => !value)}><Plus size={20} /></button>} />
      {error && <p className="error">{error}</p>}
      {canAssign && showForm && (
        <form className="form-card page-enter" onSubmit={createDay}>
          <h3><CalendarDays size={18} /> Add Aarti day</h3>
          <FormField label="Festival date"><input name="slot_date" type="date" required /></FormField>
          <div className="grid-2">
            <FormField label="Morning"><input name="morning_time" type="time" defaultValue="06:30" /></FormField>
            <FormField label="Evening"><input name="evening_time" type="time" defaultValue="19:30" /></FormField>
          </div>
          <div className="form-actions"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit"><Plus size={18} /> Create schedule</button></div>
        </form>
      )}
      {loading ? <SkeletonCards count={3} /> : grouped.length ? grouped.map(([day, daySlots]) => (
        <section className="aarti-day" key={day}>
          <h3><CalendarDays size={18} /> {prettyDate(day)}</h3>
          <span className="eyebrow">{day === new Date().toISOString().slice(0, 10) ? "Today" : "Festival schedule"}</span>
          {daySlots.map((slot) => (
            <article className="aarti-slot" key={slot.id}>
              <div className="slot-heading"><div><h4>{sessionLabel(slot.session)}</h4><StatusBadge status={slot.members.length ? "Assigned" : "Pending"} /></div><time><Clock3 size={13} /> {prettyTime(slot.start_time)}</time></div>
              <div className="assigned-row">
                <div><span className="metric-label">Assigned members</span>{slot.members.length ? <AvatarStack names={slot.members.map((member) => member.name)} /> : <p className="muted small">No team assigned yet</p>}</div>
                <strong>{slot.members.length}<Users size={14} /></strong>
              </div>
              <div className="choice-row">
                <button
                  type="button"
                  className={slot.my_availability === true ? "choice selected" : "choice"}
                  onClick={() => setAvailability(slot, true)}
                >
                  <Check size={17} /> I'm Available
                </button>
                <button
                  type="button"
                  className={slot.my_availability === false ? "choice selected" : "choice"}
                  onClick={() => setAvailability(slot, false)}
                >
                  <X size={17} /> Not available
                </button>
              </div>
              {canAssign && (
                <div className="assign-box">
                  <strong><UserCheck size={16} /> Assign members</strong>
                  <p className="small muted">Available: {slot.availability.filter((row) => row.available).map((row) => row.name).join(", ") || "No responses yet"}</p>
                  {members.map((member) => {
                    const status = slot.availability.find((row) => row.member_id === member.id);
                    return (
                      <label className={`check ${status?.available ? "yes" : status ? "no" : ""}`} key={member.id}>
                        <input
                          type="checkbox"
                          checked={(selected[slot.id] ?? []).includes(member.id)}
                          onChange={() => toggleMember(slot.id, member.id)}
                        />
                        {member.name}
                        {status?.available ? " · available" : status ? " · not available" : ""}
                      </label>
                    );
                  })}
                  <button type="button" onClick={() => assign(slot)}><Sparkles size={17} /> Assign selected</button>
                </div>
              )}
            </article>
          ))}
        </section>
      )) : <EmptyState icon={Sparkles} title="No Aarti scheduled yet" description="Once the coordinator creates the schedule, morning and evening Aarti will appear here."
        action={canAssign && <button onClick={() => setShowForm(true)}>Create Aarti</button>} />}
    </div>
  );
}
