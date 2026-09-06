import { type FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Phone } from "lucide-react";
import { useAuth } from "../AuthContext";
import { FormField } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("9999999999");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(phone, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="login-page">
      <main className="login-card">
        <div className="login-emblem">ॐ</div>
        <span className="eyebrow">जय श्री गणेश 🙏</span>
        <h1>Welcome to your Mandal</h1>
        <p>Manage the festival, stay connected, and celebrate together.</p>
        <form onSubmit={onSubmit}>
          <FormField label="Phone number">
            <div className="list-card"><Phone size={18} /><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" /></div>
          </FormField>
          <FormField label="Password">
            <div className="list-card"><LockKeyhole size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
          </FormField>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Entering…" : <>Enter Mandal <ArrowRight size={18} /></>}</button>
        </form>
        <p className="demo-note">Demo admin · 9999999999 / admin123</p>
      </main>
    </div>
  );
}
