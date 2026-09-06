import type { ReactNode } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AartiPage from "./pages/AartiPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import CalendarPage from "./pages/CalendarPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import PrasadPage from "./pages/PrasadPage";
import ReportPage from "./pages/ReportPage";
import VarganiPage from "./pages/VarganiPage";

function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="kicker">श्री गणेश मित्र मंडळ</p>
          <h1>Ganpati Operations</h1>
        </div>
        <button className="ghost" onClick={logout}>
          {user?.name}
        </button>
      </header>
      <main className="content">{children}</main>
      <nav className="tabbar">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/vargani">Vargani</NavLink>
        <NavLink to="/expenses">Expenses</NavLink>
        <NavLink to="/aarti">Aarti</NavLink>
        <NavLink to="/more">More</NavLink>
      </nav>
    </div>
  );
}

function MorePage() {
  return (
    <div className="stack">
      <NavLink className="card-link" to="/prasad">
        Mahaprasad
      </NavLink>
      <NavLink className="card-link" to="/members">
        Members / Roles
      </NavLink>
      <NavLink className="card-link" to="/announcements">
        Announcements
      </NavLink>
      <NavLink className="card-link" to="/calendar">
        Festival calendar
      </NavLink>
      <NavLink className="card-link" to="/inventory">
        Inventory
      </NavLink>
      <NavLink className="card-link" to="/report">
        Final report
      </NavLink>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">Loading mandal app…</div>;
  if (!user) return <LoginPage />;
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
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
