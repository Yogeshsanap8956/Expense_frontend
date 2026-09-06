const TOKEN_KEY = "mandal_token";

/** Empty in local Vite (proxy). Set VITE_API_BASE in Cloudflare Pages, e.g. https://api.example.com */
export const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res: Response;
  try {
    res = await fetch(apiUrl(path), { ...options, headers });
  } catch {
    throw new Error("Cannot reach the server. Make sure backend is running on port 8000.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : Array.isArray(body.detail) ? body.detail[0]?.msg : "";
    if (res.status === 401) {
      // Don't clear token during login attempts themselves.
      if (!path.includes("/auth/login")) clearToken();
      throw new Error(detail || "Incorrect phone or password");
    }
    if (res.status === 404) {
      throw new Error(detail || "API not found. Restart the frontend so the /api proxy can reach the backend.");
    }
    throw new Error(detail || "Request failed");
  }
  if (res.headers.get("content-type")?.includes("application/pdf")) {
    return (await res.blob()) as T;
  }
  return res.json();
}

export const api = {
  login: (phone: string, password: string) =>
    request<{ access_token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),
  me: () => request<User>("/api/v1/auth/me"),
  dashboard: () => request<Dashboard>("/api/v1/dashboard"),
  vargani: () => request<Vargani[]>("/api/v1/vargani"),
  updateVargani: (id: number, body: Partial<Vargani>) =>
    request<Vargani>(`/api/v1/vargani/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  reminder: (id: number) => request<{ whatsapp_url: string }>(`/api/v1/vargani/${id}/reminder`),
  expenses: () => request<Expense[]>("/api/v1/expenses"),
  createExpense: (body: Partial<Expense>) =>
    request<Expense>("/api/v1/expenses", { method: "POST", body: JSON.stringify(body) }),
  updateExpense: (id: number, body: Partial<Expense>) =>
    request<Expense>(`/api/v1/expenses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  expenseReport: () => request<{ breakdown: { category: string; total: number }[]; total: number }>("/api/v1/expenses/report"),
  uploadFile: async (file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(apiUrl("/api/v1/uploads/"), {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(typeof body.detail === "string" ? body.detail : "Upload failed");
    }
    return res.json() as Promise<{ url: string }>;
  },
  members: () => request<User[]>("/api/v1/members"),
  createMember: (body: Record<string, unknown>) =>
    request<User>("/api/v1/members", { method: "POST", body: JSON.stringify(body) }),
  announcements: () => request<Announcement[]>("/api/v1/announcements"),
  createAnnouncement: (body: { title: string; body: string }) =>
    request<Announcement>("/api/v1/announcements", { method: "POST", body: JSON.stringify(body) }),
  shareAnnouncement: (id: number) =>
    request<{ whatsapp_url: string; message: string }>(`/api/v1/announcements/${id}/share`),
  events: () => request<FestivalEvent[]>("/api/v1/events"),
  createEvent: (body: Partial<FestivalEvent>) =>
    request<FestivalEvent>("/api/v1/events", { method: "POST", body: JSON.stringify(body) }),
  updateEvent: (id: number, body: Partial<FestivalEvent>) =>
    request<FestivalEvent>(`/api/v1/events/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  aarti: () => request<AartiSlot[]>("/api/v1/aarti"),
  setAartiAvailability: (slot_id: number, available: boolean) =>
    request<AartiSlot>("/api/v1/aarti/availability", {
      method: "POST",
      body: JSON.stringify({ slot_id, available }),
    }),
  assignAarti: (slotId: number, member_ids: number[]) =>
    request<AartiSlot>(`/api/v1/aarti/${slotId}/assign`, {
      method: "POST",
      body: JSON.stringify({ member_ids }),
    }),
  createAartiDay: (body: { slot_date: string; morning_time?: string; evening_time?: string }) =>
    request<AartiSlot[]>("/api/v1/aarti/days", { method: "POST", body: JSON.stringify(body) }),
  mahaprasad: () => request<Mahaprasad[]>("/api/v1/mahaprasad"),
  createMahaprasad: (body: Record<string, unknown>) =>
    request<Mahaprasad>("/api/v1/mahaprasad", { method: "POST", body: JSON.stringify(body) }),
  updateMahaprasad: (id: number, body: Record<string, unknown>) =>
    request<Mahaprasad>(`/api/v1/mahaprasad/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  volunteerMahaprasad: (id: number) =>
    request<Mahaprasad>(`/api/v1/mahaprasad/${id}/volunteer`, { method: "POST" }),
  inventory: () => request<InventoryItem[]>("/api/v1/inventory"),
  finalReport: () => request<FinalReport>("/api/v1/reports/final"),
};

export type User = {
  id: number;
  name: string;
  phone: string;
  house_number?: string | null;
  role: string;
  is_active: boolean;
};

export type Dashboard = {
  mandal_name: string;
  vargani_collected: number;
  vargani_pending: number;
  vargani_expected: number;
  expenses_spent: number;
  balance: number;
  today_morning_aarti?: string | null;
  today_evening_aarti?: string | null;
  today_mahaprasad?: string | null;
  today_aarti_members: number;
  upcoming_events: FestivalEvent[];
  announcements: Announcement[];
};

export type Vargani = {
  id: number;
  member_id: number;
  member_name: string;
  house_number?: string | null;
  phone: string;
  expected_amount: number;
  amount_paid: number;
  pending_amount: number;
  status: string;
  payment_method?: string | null;
  payment_date?: string | null;
  receipt_number?: string | null;
};

export type Expense = {
  id: number;
  category: string;
  description: string;
  amount: number;
  paid_to: string;
  expense_date: string;
  payment_method: string;
  bill_url?: string | null;
  payment_screenshot_url?: string | null;
  notes?: string | null;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  is_important: boolean;
  created_at: string;
};

export type FestivalEvent = {
  id: number;
  title: string;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  responsible_person?: string | null;
  volunteers?: string | null;
  budget?: number | null;
  status: string;
};

export type AartiSlot = {
  id: number;
  slot_date: string;
  session: string;
  start_time: string;
  members: { id: number; name: string }[];
  availability: { member_id: number; name: string; available: boolean }[];
  my_availability: boolean | null;
};

export type Mahaprasad = {
  id: number;
  prasad_date: string;
  menu: string;
  expected_people: number;
  food_quantity?: string | null;
  cooking_team?: string | null;
  serving_team?: string | null;
  volunteers?: string | null;
  vendor?: string | null;
  food_budget: number;
  actual_cost?: number | null;
  distribution_time?: string | null;
};

export type InventoryItem = {
  id: number;
  name: string;
  total_quantity: number;
  used_quantity: number;
  returned_quantity: number;
  available_quantity: number;
  status: string;
};

export type FinalReport = {
  festival: string;
  mandal_name: string;
  vargani: { expected: number; collected: number; pending: number };
  expenses: { category: string; total: number }[];
  total_expenses: number;
  balance: number;
};

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
