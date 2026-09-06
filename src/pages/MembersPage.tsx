import { useEffect, useState } from "react";
import { api, type User } from "../api";

export default function MembersPage() {
  const [rows, setRows] = useState<User[]>([]);
  useEffect(() => {
    api.members().then(setRows);
  }, []);
  return (
    <div className="stack">
      <h2>👥 Members</h2>
      {rows.map((row) => (
        <article className="stat" key={row.id}>
          <p>
            <strong>{row.name}</strong> · {row.house_number}
          </p>
          <p>
            {row.role} · {row.phone}
          </p>
        </article>
      ))}
    </div>
  );
}
