import { useEffect, useState } from "react";
import { api, getToken, inr, type FinalReport } from "../api";

export default function ReportPage() {
  const [data, setData] = useState<FinalReport | null>(null);
  useEffect(() => {
    api.finalReport().then(setData);
  }, []);
  if (!data) return <p>Loading report…</p>;
  return (
    <div className="stack">
      <h2>📊 {data.festival}</h2>
      <article className="stat">
        <h3>Vargani</h3>
        <p>Expected {inr(data.vargani.expected)}</p>
        <p>Collected {inr(data.vargani.collected)}</p>
        <p>Pending {inr(data.vargani.pending)}</p>
      </article>
      <article className="stat">
        <h3>Expenses</h3>
        {data.expenses.map((item) => (
          <p key={item.category}>
            {item.category} {inr(item.total)}
          </p>
        ))}
        <p>
          <strong>Total {inr(data.total_expenses)}</strong>
        </p>
        <p>
          <strong>Balance {inr(data.balance)}</strong>
        </p>
      </article>
      <button
        type="button"
        onClick={async () => {
          const res = await fetch("/api/v1/reports/final.pdf", {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "ganpati-final-report.pdf";
          link.click();
        }}
      >
        Download PDF
      </button>
    </div>
  );
}
