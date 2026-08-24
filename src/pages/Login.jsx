import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState(
      location.state?.message || ""
    );

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });

    setError("");
    setMessage("");
  };

  // ==========================================
  // HANDLE LOGIN
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    const result = await login(
      form.email,
      form.password
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    /*
     * If the user was redirected to login
     * from a protected page, return there.
     *
     * Otherwise go to the main Home page.
     */

    const destination =
      location.state?.from || "/";

    navigate(destination, {
      replace: true,
    });
  };

  return (
    <div className="auth-page">

      {/* =====================================
          LEFT VISUAL SECTION
      ====================================== */}

      <div className="auth-visual">

        <img
          src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85"
          alt="Mountain landscape"
        />

        <div className="auth-visual-overlay" />

        {/* Clicking logo goes to HOME */}
        <Link
          to="/"
          className="auth-brand"
        >
          <MapPin size={22} />

          <span>
            Voyage Mate
          </span>
        </Link>

        <div className="auth-quote">

          <Sparkles size={20} />

          <h2>
            The world is waiting.
            <br />
            Let's plan your next story.
          </h2>

          <p>
            Discover places, build
            unforgettable itineraries,
            and travel with everything
            organized in one place.
          </p>

        </div>

      </div>

      {/* =====================================
          RIGHT LOGIN SECTION
      ====================================== */}

      <div className="auth-panel">

        <div className="auth-form-container">

          {/* =================================
              HEADING
          ================================= */}

          <div className="auth-heading">

            <span>
              WELCOME BACK
            </span>

            <h1>
              Let's continue your journey.
            </h1>

            <p>
              Sign in to access your trips
              and continue planning.
            </p>

          </div>

          {/* =================================
              LOGIN FORM
          ================================= */}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* ===============================
                EMAIL
            ================================ */}

            <div className="form-field">

              <label htmlFor="email">
                Email address
              </label>

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

            {/* ===============================
                PASSWORD
            ================================ */}

            <div className="form-field">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                {/* REAL FORGOT PASSWORD LINK */}

                <Link
                  to="/forgot-password"
                  className="forgot-password-link"
                >
                  Forgot password?
                </Link>

              </div>

              <div className="input-with-icon">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
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

            {/* ===============================
                SUCCESS MESSAGE
            ================================ */}

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            {/* ===============================
                ERROR MESSAGE
            ================================ */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* ===============================
                LOGIN BUTTON
            ================================ */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>

          {/* =================================
              REGISTER SECTION
          ================================== */}

          <div className="auth-divider">
            <span>
              New to Voyage Mate?
            </span>
          </div>

          <Link
            to="/register"
            className="auth-switch-link"
          >
            Create your account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;