import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
} from "lucide-react";

import axios from "axios";
import { API_BASE_URL } from "../services/api";

const API_URL = API_BASE_URL;

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!password || !confirmPassword) {
      setError(
        "Please enter and confirm your new password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    // ==========================================
    // RESET PASSWORD
    // ==========================================

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${API_URL}/auth/reset-password/${token}`,
          {
            password,
          }
        );

      setSuccess(
        response.data.message ||
          "Password reset successfully."
      );

      // Give user a moment to see success message
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2000);
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ==========================================
          LEFT VISUAL
      ========================================== */}

      <div className="auth-visual">

        <img
          src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85"
          alt="Mountain landscape"
        />

        <div className="auth-visual-overlay" />

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

          <h2>
            A new password.
            <br />
            A fresh journey.
          </h2>

          <p>
            Secure your account and
            continue planning your
            next adventure.
          </p>

        </div>

      </div>

      {/* ==========================================
          RIGHT FORM
      ========================================== */}

      <div className="auth-panel">

        <div className="auth-form-container">

          {/* ======================================
              HEADING
          ====================================== */}

          <div className="auth-heading">

            <span>
              RESET PASSWORD
            </span>

            <h1>
              Create a new password.
            </h1>

            <p>
              Enter your new password below.
            </p>

          </div>

          {/* ======================================
              FORM
          ====================================== */}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* ====================================
                NEW PASSWORD
            ==================================== */}

            <div className="form-field">

              <label htmlFor="password">
                New password
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
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );

                    setError("");
                  }}
                  autoComplete="new-password"
                />

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

            {/* ====================================
                CONFIRM PASSWORD
            ==================================== */}

            <div className="form-field">

              <label htmlFor="confirmPassword">
                Confirm new password
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
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );

                    setError("");
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
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

            {/* ====================================
                ERROR
            ==================================== */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* ====================================
                SUCCESS
            ==================================== */}

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            {/* ====================================
                BUTTON
            ==================================== */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Updating password..."
                : "Change password"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>

          {/* ======================================
              BACK TO LOGIN
          ====================================== */}

          <div className="auth-divider">
            <span>
              Remember your password?
            </span>
          </div>

          <Link
            to="/login"
            className="auth-switch-link"
          >
            Back to sign in
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;