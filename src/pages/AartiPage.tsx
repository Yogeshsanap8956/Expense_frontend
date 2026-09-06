import { useEffect, useState } from "react";
import { api, type AartiSlot } from "../api";

export default function AartiPage() {
  const [slots, setSlots] = useState<AartiSlot[]>([]);
  useEffect(() => {
    api.aarti().then(setSlots);
  }, []);
  return (
    <div className="stack">
      <h2>🙏 Aarti schedule</h2>
      {slots.map((slot) => (
        <article className="stat" key={slot.id}>
          <h3>
            {slot.slot_date} · {slot.session} · {slot.start_time}
          </h3>
          {slot.members.map((m) => (
            <p key={m.id}>👤 {m.name}</p>
          ))}
        </article>
      ))}
    </div>
  );
}
