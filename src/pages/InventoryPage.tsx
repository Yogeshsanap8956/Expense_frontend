import { useEffect, useState } from "react";
import { api, type InventoryItem } from "../api";

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryItem[]>([]);
  useEffect(() => {
    api.inventory().then(setRows);
  }, []);
  return (
    <div className="stack">
      <h2>📦 Inventory</h2>
      {rows.map((row) => (
        <article className="stat" key={row.id}>
          <p>
            <strong>{row.name}</strong>
          </p>
          <p>
            Total {row.total_quantity} · Used {row.used_quantity} · Returned {row.returned_quantity} · Available{" "}
            {row.available_quantity}
          </p>
        </article>
      ))}
    </div>
  );
}
