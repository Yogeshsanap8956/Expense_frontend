import { type FormEvent, useEffect, useState } from "react";
import { ChefHat, Clock3, HandPlatter, IndianRupee, Pencil, Plus, Users, Utensils } from "lucide-react";
import { api, inr, type Mahaprasad } from "../api";
import { useAuth } from "../AuthContext";
import { AvatarStack, EmptyState, FormField, PageHeader, SkeletonCards, StatusBadge } from "../components/ui";

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function prettyTime(hhmm?: string | null) {
  if (!hhmm) return "—";
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function menuItems(menu: string) {
  return menu.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean);
}

export default function PrasadPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Mahaprasad[]>([]);
  const [editing, setEditing] = useState<Mahaprasad | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const canEdit = user?.role === "admin" || user?.role === "prasad_coordinator";

  function refresh() {
    return api.mahaprasad().then(setRows).finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : "Failed to load mahaprasad"));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      menu: String(form.get("menu")),
      expected_people: Number(form.get("expected_people") || 0),
      food_quantity: String(form.get("food_quantity") || ""),
      cooking_team: String(form.get("cooking_team") || ""),
      serving_team: String(form.get("serving_team") || ""),
      volunteers: String(form.get("volunteers") || ""),
      vendor: String(form.get("vendor") || ""),
      food_budget: Number(form.get("food_budget") || 0),
      actual_cost: form.get("actual_cost") ? Number(form.get("actual_cost")) : null,
      distribution_time: String(form.get("distribution_time") || "13:00"),
    };
    try {
      if (editing) {
        await api.updateMahaprasad(editing.id, body);
        setEditing(null);
      } else {
        await api.createMahaprasad({ ...body, prasad_date: String(form.get("prasad_date")) });
      }
      event.currentTarget.reset();
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function volunteer(id: number) {
    const updated = await api.volunteerMahaprasad(id);
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  function startEdit(row: Mahaprasad) {
    setEditing(row);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const names = (value?: string | null) => value?.split(",").map((name) => name.trim()).filter(Boolean) || [];

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Anna seva" title="Mahaprasad" description="Plan food, teams, timing and budget for every festival day."
        action={canEdit && <button className="icon-button" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={20} /></button>} />
      {error && <p className="error">{error}</p>}
      {canEdit && showForm && (
        <form className="form-card page-enter" onSubmit={onSubmit} key={editing?.id ?? "new"}>
          <h3>{editing ? `Update ${prettyDate(editing.prasad_date)}` : "Add mahaprasad day"}</h3>
          {!editing && <FormField label="Date"><input name="prasad_date" type="date" required /></FormField>}
          <FormField label="Menu"><textarea name="menu" placeholder="Rice, Dal, Potato Bhaji" defaultValue={editing?.menu ?? ""} required /></FormField>
          <div className="grid-2">
            <FormField label="Expected people"><input name="expected_people" type="number" defaultValue={editing?.expected_people ?? 350} /></FormField>
            <FormField label="Food quantity"><input name="food_quantity" placeholder="350 plates" defaultValue={editing?.food_quantity ?? ""} /></FormField>
          </div>
          <FormField label="Cooking team"><input name="cooking_team" placeholder="Names, separated by comma" defaultValue={editing?.cooking_team ?? ""} /></FormField>
          <FormField label="Serving team"><input name="serving_team" placeholder="Names, separated by comma" defaultValue={editing?.serving_team ?? ""} /></FormField>
          <FormField label="Volunteers"><input name="volunteers" placeholder="Names, separated by comma" defaultValue={editing?.volunteers ?? ""} /></FormField>
          <FormField label="Vendor"><input name="vendor" placeholder="Vendor name" defaultValue={editing?.vendor ?? ""} /></FormField>
          <div className="grid-2">
            <FormField label="Budget"><input name="food_budget" type="number" defaultValue={editing?.food_budget ?? 12000} /></FormField>
            <FormField label="Actual cost"><input name="actual_cost" type="number" defaultValue={editing?.actual_cost ?? ""} /></FormField>
          </div>
          <FormField label="Distribution time"><input name="distribution_time" type="time" defaultValue={editing?.distribution_time ?? "13:00"} /></FormField>
          <div className="form-actions">
            <button type="submit">{editing ? "Save changes" : "Create day"}</button>
            <button type="button" className="button-secondary" onClick={() => { setEditing(null); setShowForm(false); }}>Cancel</button>
          </div>
        </form>
      )}
      {loading ? <SkeletonCards count={3} /> : rows.length ? rows.map((row) => (
        <article className="glass-card food-hero" key={row.id}>
          <div className="food-head"><div><span className="eyebrow">{prettyDate(row.prasad_date)}</span><h3>Today's Mahaprasad</h3><p><Clock3 size={14} /> {prettyTime(row.distribution_time)}</p></div><span className="food-icon"><Utensils size={29} /></span></div>
          <div className="menu-chips">{menuItems(row.menu).map((item) => <span key={item}>{item}</span>)}</div>
          <div className="detail-grid">
            <div className="detail-tile"><span><Users size={12} /> Expected</span><strong>{row.expected_people} people</strong></div>
            <div className="detail-tile"><span><IndianRupee size={12} /> Budget</span><strong>{inr(row.food_budget)}</strong></div>
            <div className="detail-tile"><span><ChefHat size={12} /> Cooking team</span><AvatarStack names={names(row.cooking_team)} /></div>
            <div className="detail-tile"><span><HandPlatter size={12} /> Serving team</span><AvatarStack names={names(row.serving_team)} /></div>
          </div>
          <div className="row" style={{ marginTop: 14 }}><StatusBadge status={row.actual_cost != null ? "Completed" : "Planned"} /><small>{row.vendor || "Vendor to be decided"} · Actual {row.actual_cost != null ? inr(row.actual_cost) : "—"}</small></div>
          <div className="row">
            <button type="button" className="button-secondary" onClick={() => volunteer(row.id)}><Users size={17} /> Volunteer</button>
            {canEdit && <button type="button" className="button-secondary" onClick={() => startEdit(row)}><Pencil size={16} /> Edit</button>}
          </div>
        </article>
      )) : <EmptyState icon={Utensils} title="No Mahaprasad planned" description="Daily menu, teams and food budget will appear here once created."
        action={canEdit && <button onClick={() => setShowForm(true)}>Plan Mahaprasad</button>} />}
    </div>
  );
}
