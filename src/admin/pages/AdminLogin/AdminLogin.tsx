import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../../services/adminService";

interface AdminLoginProps {
  onLogin: () => void;
}

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await adminLogin(email, password);
      onLogin();
      navigate("/admin");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-brand admin-login-brand">
          <span className="brand-mark">✦</span>
          <span>
            Her Pretty Things
            <br />
            <small>Admin studio</small>
          </span>
        </div>
        <p className="admin-kicker">Private workspace</p>
        <h1>Welcome back.</h1>
        <p className="admin-muted">
          Sign in to manage orders and prepare each pretty scoop.
        </p>

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </label>
          {message && (
            <p className="admin-error" role="alert">
              {message}
            </p>
          )}
          <button
            className="admin-primary-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLogin;
