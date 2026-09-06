import { type FormEvent, useEffect, useState } from "react";
import { Megaphone, Plus, Send } from "lucide-react";
import { api, type Announcement } from "../api";
import { useAuth } from "../AuthContext";
import { EmptyState, FormField, PageHeader, SkeletonCards } from "../components/ui";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const canPost = user?.role === "admin";

  function refresh() {
    return api.announcements().then(setRows).finally(() => setLoading(false));
  }
  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.createAnnouncement({ title: String(form.get("title")), body: String(form.get("body")) });
    e.currentTarget.reset();
    setShowForm(false);
    await refresh();
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Stay informed" title="Announcements" description="Important updates for every mandal member."
        action={canPost && <button className="icon-button" onClick={() => setShowForm((value) => !value)}><Plus size={20} /></button>} />
      {canPost && showForm && (
        <form className="form-card page-enter" onSubmit={onSubmit}>
          <h3>Post announcement</h3>
          <FormField label="Title"><input name="title" placeholder="Important notice" required /></FormField>
          <FormField label="Message"><textarea name="body" placeholder="Write a clear update for all members…" required /></FormField>
          <div className="form-actions"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit"><Send size={17} /> Publish</button></div>
        </form>
      )}
      {loading ? <SkeletonCards /> : rows.length ? rows.map((row) => (
        <article className="announcement-card" key={row.id}>
          <Megaphone size={22} /><h3>{row.title}</h3><p>{row.body}</p>
          <time>{new Date(row.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>
        </article>
      )) : <EmptyState icon={Megaphone} title="No announcements yet" description="New mandal notices and important updates will appear here."
        action={canPost && <button onClick={() => setShowForm(true)}>Create announcement</button>} />}
    </div>
  );
}
