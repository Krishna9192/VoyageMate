import { useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import {
  Compass,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSearch = () => {
    closeMenu();
    navigate("/explore?search=true");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link
            to="/"
            className="logo"
            onClick={closeMenu}
          >
            <Compass size={28} />
            <span>Voyage Mate</span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>

            <NavLink to="/explore">
              Explore
            </NavLink>

            <NavLink to="/trips">
              My Trips
            </NavLink>
          </div>

          <div className="nav-actions">
            <button
              className="icon-button"
              aria-label="Search destinations"
              type="button"
              onClick={handleSearch}
            >
              <Search size={20} />
            </button>

            <Link
              to="/profile"
              className="profile-button"
              aria-label="Profile"
              onClick={closeMenu}
            >
              <User size={20} />
            </Link>

            <button
              className="mobile-menu-button"
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) => !current
                )
              }
            >
              {menuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mobile-menu ${
          menuOpen ? "open" : ""
        }`}
      >
        <NavLink
          to="/"
          end
          onClick={closeMenu}
        >
          Home
        </NavLink>

        <NavLink
          to="/explore"
          onClick={closeMenu}
        >
          Explore
        </NavLink>

        <NavLink
          to="/trips"
          onClick={closeMenu}
        >
          My Trips
        </NavLink>

        <NavLink
          to="/profile"
          onClick={closeMenu}
        >
          Profile
        </NavLink>
      </div>
    </>
  );
}

export default Navbar;