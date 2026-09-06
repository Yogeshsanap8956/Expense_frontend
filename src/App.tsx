import type { ReactNode } from "react";
import {
  CalendarDays, ChevronRight, HandCoins, Home, LogOut, Megaphone, Menu,
  Package, ReceiptText, Sparkles, UserRound, Users, Utensils,
} from "lucide-react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { MemberAvatar, SkeletonCards } from "./components/ui";
import AartiPage from "./pages/AartiPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import CalendarPage from "./pages/CalendarPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import MySevaPage from "./pages/MySevaPage";
import PrasadPage from "./pages/PrasadPage";
import ReportPage from "./pages/ReportPage";
import VarganiPage from "./pages/VarganiPage";

function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark"><Sparkles size={19} /></span>
          <div><p>श्री गणेश मित्र मंडळ</p><h1>Ganpati Mahotsav</h1></div>
        </div>
        <button className="profile-button" onClick={logout} title="Sign out" aria-label={`Sign out ${user?.name}`}>
          <MemberAvatar name={user?.name || "Member"} size="sm" />
          <span>{user?.name}</span><LogOut size={15} />
        </button>
      </header>
      <main className="content page-enter">{children}</main>
      <nav className="tabbar" aria-label="Main navigation">
        <NavLink to="/" end><Home /><span>Home</span></NavLink>
        <NavLink to="/vargani"><HandCoins /><span>Vargani</span></NavLink>
        <NavLink to="/expenses"><ReceiptText /><span>Expenses</span></NavLink>
        <NavLink to="/calendar"><CalendarDays /><span>Events</span></NavLink>
        <NavLink to="/more"><Menu /><span>More</span></NavLink>
      </nav>
    </div>
  );
}

function MorePage() {
  const { user, logout } = useAuth();
  const links = [
    { to: "/me", label: "My seva", caption: "Your vargani and aarti availability", icon: UserRound },
    { to: "/aarti", label: "Aarti schedule", caption: "Availability and assignments", icon: Sparkles },
    { to: "/prasad", label: "Mahaprasad", caption: "Menu, teams and budget", icon: Utensils },
    { to: "/members", label: "Members & roles", caption: "Committee directory", icon: Users },
    { to: "/announcements", label: "Announcements", caption: "Important mandal notices", icon: Megaphone },
    { to: "/inventory", label: "Inventory", caption: "Track mandal equipment", icon: Package },
    { to: "/report", label: "Final report", caption: "Festival financial summary", icon: ReceiptText },
  ];
  return (
    <div className="page-stack">
      <section className="profile-card">
        <MemberAvatar name={user?.name || "Member"} />
        <div>
          <span className="eyebrow">Your profile</span><h2>{user?.name}</h2>
          <p>{user?.house_number || "Mandal committee"} · {user?.role.replaceAll("_", " ")}</p>
        </div>
      </section>
      <div className="more-grid">
        {links.map(({ to, label, caption, icon: Icon }) => (
          <NavLink className="menu-card" to={to} key={to}>
            <span className="menu-icon"><Icon size={21} /></span>
            <span><strong>{label}</strong><small>{caption}</small></span><ChevronRight size={18} />
          </NavLink>
        ))}
      </div>
      <button className="button-secondary full-width" type="button" onClick={logout}><LogOut size={18} /> Sign out</button>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="brand-loader">ॐ</div><SkeletonCards count={2} /></div>;
  if (!user) return <LoginPage />;
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/me" element={<MySevaPage />} />
        <Route path="/vargani" element={<VarganiPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/aarti" element={<AartiPage />} />
        <Route path="/prasad" element={<PrasadPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Shell>
  );
}
