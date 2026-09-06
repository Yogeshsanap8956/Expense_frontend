import { type FormEvent, useEffect, useState } from "react";
import { api, type Announcement } from "../api";
import { useAuth } from "../AuthContext";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Announcement[]>([]);
  const canPost = user?.role === "admin";

  function refresh() {
    api.announcements().then(setRows);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.createAnnouncement({ title: String(form.get("title")), body: String(form.get("body")) });
    e.currentTarget.reset();
    refresh();
  }

  return (
    <div className="stack">
      <h2>📢 Announcements</h2>
      {canPost && (
        <form className="stack card" onSubmit={onSubmit}>
          <input name="title" placeholder="Title" required />
          <textarea name="body" placeholder="Message" required />
          <button type="submit">Post</button>
        </form>
      )}
      {rows.map((row) => (
        <article className="stat alert" key={row.id}>
          <h3>{row.title}</h3>
          <p>{row.body}</p>
        </article>
      ))}
    </div>
  );
}
