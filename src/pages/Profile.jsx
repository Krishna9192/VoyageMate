import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Save,
  LogOut,
  Trash2,
  ShieldCheck,
  CalendarDays,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/api";

const API_URL = API_BASE_URL;

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    token,
    updateUser,
    logout,
  } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [deleteMessage, setDeleteMessage] =
    useState("");

  const [showDeleteBox, setShowDeleteBox] =
    useState(false);

  const [deletePassword, setDeletePassword] =
    useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==========================================
  // PROFILE INPUT
  // ==========================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));

    setProfileMessage("");
  };

  // ==========================================
  // PASSWORD INPUT
  // ==========================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordMessage("");
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileMessage("");

    if (!profileForm.name.trim()) {
      setProfileMessage("Name cannot be empty.");
      return;
    }

    if (!profileForm.email.trim()) {
      setProfileMessage("Email cannot be empty.");
      return;
    }

    setProfileLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        {
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        },
        authConfig
      );

      updateUser(response.data.user);

      setProfileMessage(
        response.data.message ||
          "Profile updated successfully."
      );
    } catch (error) {
      setProfileMessage(
        error.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "Please fill in all password fields."
      );
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "New passwords do not match."
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        },
        authConfig
      );

      setPasswordMessage(
        response.data.message ||
          "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordMessage(
        error.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const handleDeleteAccount = async () => {
    setDeleteMessage("");

    if (!deletePassword) {
      setDeleteMessage(
        "Enter your password to delete your account."
      );
      return;
    }

    const confirmed = window.confirm(
      "This will permanently delete your account, trips, itineraries and expenses. This action cannot be undone. Continue?"
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoading(true);

    try {
      await axios.delete(
        `${API_URL}/auth/account`,
        {
          ...authConfig,
          data: {
            password: deletePassword,
          },
        }
      );

      logout();

      navigate("/register");
    } catch (error) {
      setDeleteMessage(
        error.response?.data?.message ||
          "Unable to delete your account."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================
  // NO USER
  // ==========================================

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-empty">
          <h2>You are not logged in.</h2>

          <button
            className="profile-primary-button"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Recently";

  const avatarLetter =
    user.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <main className="profile-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <section className="profile-hero">

        <div className="profile-hero-content">

          <span className="profile-eyebrow">
            ACCOUNT
          </span>

          <h1>Your Profile</h1>

          <p>
            Manage your personal information,
            security and Voyage Mate account.
          </p>

        </div>

      </section>

      {/* ======================================
          PROFILE CONTENT
      ====================================== */}

      <section className="profile-content">

        {/* PROFILE CARD */}

        <div className="profile-card profile-overview-card">

          <div className="profile-avatar">
            {avatarLetter}
          </div>

          <div className="profile-overview-info">

            <h2>{user.name}</h2>

            <p>
              <Mail size={15} />
              {user.email}
            </p>

            <span className="profile-member-date">
              <CalendarDays size={15} />
              Member since {joinedDate}
            </span>

          </div>

        </div>

        {/* ==================================
            PERSONAL INFORMATION
        ================================== */}

        <div className="profile-card">

          <div className="profile-card-heading">

            <div className="profile-heading-icon">
              <User size={20} />
            </div>

            <div>
              <h2>Personal information</h2>

              <p>
                Update the information associated
                with your account.
              </p>
            </div>

          </div>

          <form
            className="profile-form"
            onSubmit={handleProfileSubmit}
          >

            <div className="profile-form-field">

              <label htmlFor="profile-name">
                Full name
              </label>

              <div className="profile-input-wrapper">

                <User size={18} />

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                />

              </div>

            </div>

            <div className="profile-form-field">

              <label htmlFor="profile-email">
                Email address
              </label>

              <div className="profile-input-wrapper">

                <Mail size={18} />

                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder="you@example.com"
                />

              </div>

            </div>

            {profileMessage && (
              <div className="profile-message">
                {profileMessage}
              </div>
            )}

            <button
              type="submit"
              className="profile-primary-button"
              disabled={profileLoading}
            >
              {profileLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={17} />
                  Save changes
                </>
              )}
            </button>

          </form>

        </div>

        {/* ==================================
            SECURITY
        ================================== */}

        <div className="profile-card">

          <div className="profile-card-heading">

            <div className="profile-heading-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2>Security</h2>

              <p>
                Change your password to keep your
                account secure.
              </p>
            </div>

          </div>

          <form
            className="profile-form"
            onSubmit={handlePasswordSubmit}
          >

            <div className="profile-form-field">

              <label htmlFor="current-password">
                Current password
              </label>

              <div className="profile-input-wrapper">

                <Lock size={18} />

                <input
                  id="current-password"
                  name="currentPassword"
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Current password"
                />

                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() =>
                    setShowCurrentPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showCurrentPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            <div className="profile-form-field">

              <label htmlFor="new-password">
                New password
              </label>

              <div className="profile-input-wrapper">

                <Lock size={18} />

                <input
                  id="new-password"
                  name="newPassword"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordForm.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="New password"
                />

                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() =>
                    setShowNewPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showNewPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            <div className="profile-form-field">

              <label htmlFor="confirm-password">
                Confirm new password
              </label>

              <div className="profile-input-wrapper">

                <Lock size={18} />

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  className="password-visibility-button"
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
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            {passwordMessage && (
              <div className="profile-message">
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              className="profile-primary-button"
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Changing..."
                : "Change password"}
            </button>

          </form>

        </div>

        {/* ==================================
            ACCOUNT ACTIONS
        ================================== */}

        <div className="profile-card profile-actions-card">

          <div className="profile-card-heading">

            <div className="profile-heading-icon">
              <User size={20} />
            </div>

            <div>
              <h2>Account actions</h2>

              <p>
                Manage your current Voyage Mate
                session.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Log out
          </button>

        </div>

        {/* ==================================
            DANGER ZONE
        ================================== */}

        <div className="profile-card profile-danger-card">

          <div className="profile-card-heading">

            <div className="profile-danger-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h2>Delete account</h2>

              <p>
                Permanently delete your account and
                all associated trips, itineraries
                and expenses.
              </p>
            </div>

          </div>

          {!showDeleteBox ? (

            <button
              type="button"
              className="profile-delete-button"
              onClick={() =>
                setShowDeleteBox(true)
              }
            >
              <Trash2 size={17} />
              Delete my account
            </button>

          ) : (

            <div className="profile-delete-confirm">

              <strong>
                This action cannot be undone.
              </strong>

              <p>
                Enter your current password to
                permanently delete your account.
              </p>

              <div className="profile-input-wrapper">

                <Lock size={18} />

                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => {
                    setDeletePassword(
                      event.target.value
                    );
                    setDeleteMessage("");
                  }}
                  placeholder="Current password"
                />

              </div>

              {deleteMessage && (
                <div className="profile-error-message">
                  {deleteMessage}
                </div>
              )}

              <div className="profile-delete-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={() => {
                    setShowDeleteBox(false);
                    setDeletePassword("");
                    setDeleteMessage("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="profile-delete-button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  <Trash2 size={17} />

                  {deleteLoading
                    ? "Deleting..."
                    : "Permanently delete"}
                </button>

              </div>

            </div>

          )}

        </div>

      </section>
    </main>
  );
}

export default Profile;