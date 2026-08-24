import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    const result = await login(form.email, form.password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    const destination = location.state?.from || "/trips";
    navigate(destination, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85"
          alt="Mountain landscape"
        />

        <div className="auth-visual-overlay" />

        <Link to="/" className="auth-brand">
          <MapPin size={22} />
          <span>Voyage Mate</span>
        </Link>

        <div className="auth-quote">
          <Sparkles size={20} />
          <h2>
            The world is waiting.
            <br />
            Let's plan your next story.
          </h2>
          <p>
            Discover places, build unforgettable itineraries, and travel
            with everything organized in one place.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form-container">
          <div className="auth-heading">
            <span>WELCOME BACK</span>
            <h1>Let's continue your journey.</h1>
            <p>
              Sign in to access your trips and continue planning.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="email">Email address</label>

              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-field">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                <button type="button">
                  Forgot password?
                </button>
              </div>

              <div className="input-with-icon">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to Voyage Mate?</span>
          </div>

          <Link to="/register" className="auth-switch-link">
            Create your account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;