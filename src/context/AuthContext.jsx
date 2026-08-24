import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("voyageMateUser");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error(
        "Failed to restore user:",
        error
      );

      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(
      "voyageMateToken"
    );
  });

  const [loading, setLoading] = useState(false);

  /*
   * Keep authentication data synchronized
   * with localStorage.
   */

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "voyageMateUser",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(
        "voyageMateUser"
      );
    }

    if (token) {
      localStorage.setItem(
        "voyageMateToken",
        token
      );
    } else {
      localStorage.removeItem(
        "voyageMateToken"
      );
    }
  }, [user, token]);

  /*
   * Register
   */

  const register = async (
    name,
    email,
    password
  ) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      );

      const { user, token } =
        response.data;

      setUser(user);
      setToken(token);

      return {
        success: true,
        message:
          response.data.message ||
          "Account created successfully",
      };
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to create your account.",
      };
    } finally {
      setLoading(false);
    }
  };

  /*
   * Login
   */

  const login = async (
    email,
    password
  ) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      const { user, token } =
        response.data;

      setUser(user);
      setToken(token);

      return {
        success: true,
        message:
          response.data.message ||
          "Login successful",
      };
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to log you in.",
      };
    } finally {
      setLoading(false);
    }
  };

  /*
   * Logout
   */

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      "voyageMateUser"
    );

    localStorage.removeItem(
      "voyageMateToken"
    );
  };

  /*
   * Update user information
   */

  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  const isAuthenticated =
    Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}