import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const API_URL = API_BASE_URL;

function ForgotPassword() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your registered email address."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${API_URL}/auth/forgot-password`,
          {
            email: email
              .trim()
              .toLowerCase(),
          }
        );

      setMessage(
        response.data.message
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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
          <span>Voyage Mate</span>
        </Link>

        <div className="auth-quote">
          <h2>
            Your journey
            <br />
            is still waiting.
          </h2>

          <p>
            Reset your password and
            continue planning your next
            adventure.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form-container">

          <div className="auth-heading">
            <span>RESET PASSWORD</span>

            <h1>
              Forgot your password?
            </h1>

            <p>
              Enter the email address
              associated with your Voyage
              Mate account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
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
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );
                    setError("");
                    setMessage("");
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {message && (
              <div
                className="auth-success"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send reset link"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

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

export default ForgotPassword;