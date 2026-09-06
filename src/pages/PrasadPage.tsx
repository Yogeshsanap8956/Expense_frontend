import { useEffect, useState } from "react";
import { api, inr, type Mahaprasad } from "../api";

export default function PrasadPage() {
  const [rows, setRows] = useState<Mahaprasad[]>([]);
  useEffect(() => {
    api.mahaprasad().then(setRows);
  }, []);
  return (
    <div className="stack">
      <h2>🍛 Mahaprasad</h2>
      {rows.map((row) => (
        <article className="stat" key={row.id}>
          <h3>{row.prasad_date}</h3>
          <p>Menu: {row.menu}</p>
          <p>Expected people: {row.expected_people}</p>
          <p>Team: {row.cooking_team}</p>
          <p>Budget: {inr(row.food_budget)}</p>
          <p>Time: {row.distribution_time || "—"}</p>
        </article>
      ))}
    </div>
  );
}
