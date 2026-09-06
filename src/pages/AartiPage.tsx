import { type FormEvent, useEffect, useMemo, useState } from "react";
import { api, type AartiSlot, type User } from "../api";
import { useAuth } from "../AuthContext";

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
  const canAssign = user?.role === "admin" || user?.role === "aarti_coordinator";

  async function refresh() {
    const [nextSlots, nextMembers] = await Promise.all([api.aarti(), api.members()]);
    setSlots(nextSlots);
    setMembers(nextMembers);
    const nextSelected: Record<number, number[]> = {};
    for (const slot of nextSlots) nextSelected[slot.id] = slot.members.map((member) => member.id);
    setSelected(nextSelected);
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
    await refresh();
  }

  return (
    <div className="stack">
      <h2>🙏 Aarti schedule</h2>
      <p className="muted small">Mark if you can come. Coordinator then assigns the team.</p>
      {error && <p className="error">{error}</p>}
      {canAssign && (
        <form className="stack card" onSubmit={createDay}>
          <h3>Add aarti day</h3>
          <input name="slot_date" type="date" required />
          <div className="grid-2">
            <label>
              Morning
              <input name="morning_time" type="time" defaultValue="06:30" />
            </label>
            <label>
              Evening
              <input name="evening_time" type="time" defaultValue="19:30" />
            </label>
          </div>
          <button type="submit">Create morning + evening</button>
        </form>
      )}
      {grouped.map(([day, daySlots]) => (
        <section className="stat" key={day}>
          <h3>📅 {prettyDate(day)}</h3>
          {daySlots.map((slot) => (
            <article className="aarti-slot" key={slot.id}>
              <h4>
                {sessionLabel(slot.session)} · {prettyTime(slot.start_time)}
              </h4>
              <p className="muted small">
                {slot.members.length
                  ? slot.members.map((member) => `👤 ${member.name}`).join("   ")
                  : "No one assigned yet"}
              </p>
              <div className="choice-row">
                <button
                  type="button"
                  className={slot.my_availability === true ? "choice selected" : "choice"}
                  onClick={() => setAvailability(slot, true)}
                >
                  ☑ Available
                </button>
                <button
                  type="button"
                  className={slot.my_availability === false ? "choice selected" : "choice"}
                  onClick={() => setAvailability(slot, false)}
                >
                  ☐ Not available
                </button>
              </div>
              {canAssign && (
                <div className="assign-box">
                  <p className="small">
                    Available:{" "}
                    {slot.availability.filter((row) => row.available).map((row) => row.name).join(", ") || "none yet"}
                  </p>
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
                  <button type="button" onClick={() => assign(slot)}>
                    Assign selected
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
