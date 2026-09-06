import { useEffect, useState } from "react";
import { Armchair, Package, RotateCcw } from "lucide-react";
import { api, type InventoryItem } from "../api";
import { EmptyState, PageHeader, SkeletonCards, StatusBadge } from "../components/ui";

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.inventory().then(setRows).finally(() => setLoading(false));
  }, []);
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Mandal assets" title="Inventory" description="Available, in use and returned—always accounted for." />
      {loading ? <SkeletonCards /> : rows.length ? rows.map((row) => {
        const percentage = row.total_quantity ? (row.available_quantity / row.total_quantity) * 100 : 0;
        return <article className="list-card" key={row.id}>
          <span className="activity-icon">{row.name.toLowerCase().includes("chair") ? <Armchair size={21} /> : <Package size={21} />}</span>
          <div className="list-card-main">
            <h3>{row.name}</h3><p>Total {row.total_quantity} · Used {row.used_quantity} · Returned {row.returned_quantity}</p>
            <div className="inventory-meter"><span style={{ width: `${percentage}%` }} /></div>
          </div>
          <div className="list-value"><strong>{row.available_quantity}</strong><p>available</p><StatusBadge status={row.status} /></div>
        </article>
      }) : <EmptyState icon={RotateCcw} title="Inventory is empty" description="Mandal equipment and reusable items will be listed here." />}
    </div>
  );
}
