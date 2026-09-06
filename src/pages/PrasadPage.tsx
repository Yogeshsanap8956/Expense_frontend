import { type FormEvent, useEffect, useState } from "react";
import { api, inr, type Mahaprasad } from "../api";
import { useAuth } from "../AuthContext";

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
  const canEdit = user?.role === "admin" || user?.role === "prasad_coordinator";

  function refresh() {
    return api.mahaprasad().then(setRows);
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
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function volunteer(id: number) {
    const updated = await api.volunteerMahaprasad(id);
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  return (
    <div className="stack">
      <h2>🍛 Mahaprasad</h2>
      <p className="muted small">Daily menu, headcount, cooking/serving teams, and budget.</p>
      {error && <p className="error">{error}</p>}
      {canEdit && (
        <form className="stack card" onSubmit={onSubmit} key={editing?.id ?? "new"}>
          <h3>{editing ? `Update ${prettyDate(editing.prasad_date)}` : "Add mahaprasad day"}</h3>
          {!editing && <input name="prasad_date" type="date" required />}
          <textarea name="menu" placeholder="Menu: Rice, Dal, Potato Bhaji" defaultValue={editing?.menu ?? ""} required />
          <div className="grid-2">
            <input name="expected_people" type="number" placeholder="Expected people" defaultValue={editing?.expected_people ?? 350} />
            <input name="food_quantity" placeholder="Food quantity" defaultValue={editing?.food_quantity ?? ""} />
          </div>
          <input name="cooking_team" placeholder="Cooking team" defaultValue={editing?.cooking_team ?? ""} />
          <input name="serving_team" placeholder="Serving team" defaultValue={editing?.serving_team ?? ""} />
          <input name="volunteers" placeholder="Volunteers" defaultValue={editing?.volunteers ?? ""} />
          <input name="vendor" placeholder="Vendor" defaultValue={editing?.vendor ?? ""} />
          <div className="grid-2">
            <input name="food_budget" type="number" placeholder="Food budget" defaultValue={editing?.food_budget ?? 12000} />
            <input name="actual_cost" type="number" placeholder="Actual cost" defaultValue={editing?.actual_cost ?? ""} />
          </div>
          <label>
            Distribution time
            <input name="distribution_time" type="time" defaultValue={editing?.distribution_time ?? "13:00"} />
          </label>
          <div className="row">
            <button type="submit">{editing ? "Save changes" : "Create day"}</button>
            {editing && (
              <button type="button" className="ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      {rows.map((row) => (
        <article className="stat" key={row.id}>
          <h3>📅 {prettyDate(row.prasad_date)}</h3>
          <p>
            <strong>Menu</strong>
          </p>
          <ul className="menu-list">
            {menuItems(row.menu).map((item) => (
              <li key={item}>🍚 {item}</li>
            ))}
          </ul>
          <p>Expected people: {row.expected_people}</p>
          <p>Quantity: {row.food_quantity || "—"}</p>
          <p>Cooking team: {row.cooking_team || "—"}</p>
          <p>Serving team: {row.serving_team || "—"}</p>
          <p>Volunteers: {row.volunteers || "none yet"}</p>
          <p>Vendor: {row.vendor || "—"}</p>
          <p>Budget: {inr(row.food_budget)}</p>
          <p>Actual cost: {row.actual_cost != null ? inr(row.actual_cost) : "—"}</p>
          <p>Distribution: {prettyTime(row.distribution_time)}</p>
          <div className="row">
            <button type="button" className="ghost" onClick={() => volunteer(row.id)}>
              Volunteer
            </button>
            {canEdit && (
              <button type="button" onClick={() => setEditing(row)}>
                Edit
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
