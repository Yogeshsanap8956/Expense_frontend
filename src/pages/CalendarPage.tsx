import { useEffect, useState } from "react";
import { api, type FestivalEvent } from "../api";

export default function CalendarPage() {
  const [rows, setRows] = useState<FestivalEvent[]>([]);
  useEffect(() => {
    api.events().then(setRows);
  }, []);
  return (
    <div className="stack">
      <h2>📅 Festival calendar</h2>
      {rows.map((row) => (
        <article className="stat" key={row.id}>
          <p>
            {row.event_date} · <strong>{row.title}</strong>
          </p>
        </article>
      ))}
    </div>
  );
}
