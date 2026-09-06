import { type FormEvent, useState } from "react";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("9999999999");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(phone, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="login">
      <p className="kicker">Welcome</p>
      <h1>श्री गणेश मित्र मंडळ</h1>
      <p className="muted">Open on your phone. Add to Home Screen for app-like use.</p>
      <form onSubmit={onSubmit} className="stack">
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Enter mandal</button>
      </form>
      <p className="muted small">Demo admin: 9999999999 / admin123</p>
    </div>
  );
}
