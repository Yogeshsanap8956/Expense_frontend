import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { api, type User } from "../api";
import { EmptyState, MemberAvatar, PageHeader, SkeletonCards, StatusBadge } from "../components/ui";

export default function MembersPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.members().then(setRows).finally(() => setLoading(false));
  }, []);
  const filtered = rows.filter((row) => `${row.name} ${row.house_number || ""} ${row.role}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Our community" title="Members" description={`${rows.length} people helping make the festival special.`} />
      <div className="list-card"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members or roles" aria-label="Search members" /></div>
      {loading ? <SkeletonCards /> : filtered.length ? filtered.map((row) => (
        <article className="list-card" key={row.id}>
          <MemberAvatar name={row.name} />
          <div className="list-card-main"><h3>{row.name}</h3><p>{row.house_number || "Mandal committee"} · {row.phone}</p></div>
          <StatusBadge status={row.role} />
        </article>
      )) : <EmptyState icon={Users} title="No members found" description="Try another search to find a committee member." />}
    </div>
  );
}
