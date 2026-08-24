import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Protected pages
import Trips from "./pages/Trips";
import TripDetails from "./pages/TripDetails";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          {/* =================================
              PUBLIC PAGES
          ================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/explore"
            element={<Explore />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* 
            IMPORTANT:
            The reset token comes from the
            email link:

            /reset-password/TOKEN
          */}

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* =================================
              PROTECTED PAGES
          ================================== */}

          <Route element={<ProtectedRoute />}>

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