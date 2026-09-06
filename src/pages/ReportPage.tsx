import { useEffect, useState } from "react";
import { Download, FileText, HandCoins, ReceiptText, TrendingUp } from "lucide-react";
import { api, getToken, inr, type FinalReport } from "../api";
import { AnimatedNumber, PageHeader, ProgressRing, SkeletonCards, StatCard } from "../components/ui";

export default function ReportPage() {
  const [data, setData] = useState<FinalReport | null>(null);
  useEffect(() => {
    api.finalReport().then(setData);
  }, []);
  if (!data) return <SkeletonCards count={4} />;
  const percentage = data.vargani.expected ? (data.vargani.collected / data.vargani.expected) * 100 : 0;
  const maxExpense = Math.max(...data.expenses.map((item) => item.total), 1);
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Transparency report" title="Festival Report" description={data.festival} />
      <section className="report-hero">
        <span className="eyebrow">{data.mandal_name}</span><h2>Financial summary</h2>
        <div className="report-balance"><span>Closing balance</span><strong><AnimatedNumber value={data.balance} formatter={inr} /></strong></div>
      </section>
      <section className="metrics-grid">
        <StatCard label="Collection" value={data.vargani.collected} icon={HandCoins} progress={percentage} detail={`${Math.round(percentage)}% of expected`} />
        <StatCard label="Expenses" value={data.total_expenses} icon={ReceiptText} tone="red" detail="Festival spending" />
        <StatCard label="Balance" value={data.balance} icon={TrendingUp} tone="gold" detail="Remaining funds" />
        <article className="metric-card tone-cream"><ProgressRing value={percentage} label="collected" size={104} /></article>
      </section>
      <section className="chart-card">
        <h3>Expense breakdown</h3>
        {data.expenses.map((item) => (
          <div className="chart-row" key={item.category}>
            <span>{item.category.replaceAll("_", " ")}</span>
            <div className="bar-track"><i style={{ width: `${(item.total / maxExpense) * 100}%` }} /></div>
            <strong>{inr(item.total)}</strong>
          </div>
        ))}
      </section>
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
          URL.revokeObjectURL(url);
        }}
      >
        <Download size={19} /> Download transparent PDF report
      </button>
      <p className="muted small" style={{ textAlign: "center" }}><FileText size={13} /> Ready to share with every resident</p>
    </div>
  );
}
