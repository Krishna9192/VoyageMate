import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(
        "Please complete all fields."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    const result = await register(
      form.name,
      form.email,
      form.password
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Registration successful
    // Go to the protected Home page.
    navigate("/home", {
      replace: true,
    });
  };

  return (
    <div className="auth-page">

      {/* ================================
          LEFT VISUAL SECTION
      ================================= */}

      <div className="auth-visual register-visual">

        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85"
          alt="Travel landscape"
        />

        <div className="auth-visual-overlay" />

        <Link
          to="/register"
          className="auth-brand"
        >
          <MapPin size={22} />
          <span>Voyage Mate</span>
        </Link>

        <div className="auth-quote">

          <Sparkles size={20} />

          <h2>
            Every great journey
            <br />
            starts with a plan.
          </h2>

          <p>
            Create your personal travel
            space and turn your ideas into
            unforgettable journeys.
          </p>

        </div>

      </div>

      {/* ================================
          RIGHT REGISTER SECTION
      ================================= */}

      <div className="auth-panel">

        <div className="auth-form-container">

          <div className="auth-heading">

            <span>
              START EXPLORING
            </span>

            <h1>
              Create your travel account.
            </h1>

            <p>
              Join Voyage Mate and start
              planning your next adventure.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* NAME */}

            <div className="form-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="input-with-icon">

                <User size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />

              </div>

            </div>

            {/* EMAIL */}

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

            {/* PASSWORD */}

            <div className="form-field">

              <label htmlFor="password">
                Password
              </label>

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
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
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

            {/* CONFIRM PASSWORD */}

            <div className="form-field">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="input-with-icon">

                <LockKeyhole size={18} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>

          {/* LOGIN LINK */}

          <div className="auth-divider">
            <span>
              Already have an account?
            </span>
          </div>

          <Link
            to="/login"
            className="auth-switch-link"
          >
            Sign in instead
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;