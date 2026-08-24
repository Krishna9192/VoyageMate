import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Trips from "./pages/Trips";
import TripDetails from "./pages/TripDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          {/* =========================
              FIRST PAGE
          ========================== */}

          <Route
            path="/"
            element={<Navigate to="/register" replace />}
          />

          {/* =========================
              PUBLIC PAGES
          ========================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              PUBLIC EXPLORE
          ========================== */}

          <Route
            path="/explore"
            element={<Explore />}
          />

          {/* =========================
              PROTECTED PAGES
          ========================== */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/home"
              element={<Home />}
            />

            <Route
              path="/trips"
              element={<Trips />}
            />

            <Route
              path="/trips/:tripId"
              element={<TripDetails />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;