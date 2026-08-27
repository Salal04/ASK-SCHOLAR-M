import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, role, profile, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/scholars");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/scholars" className="brand">
          <svg className="brand-mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 3 L25 15 L38 20 L25 25 L20 37 L15 25 L2 20 L15 15 Z"
              stroke="#c9a24b"
              strokeWidth="1.6"
            />
          </svg>
          Ask Scholar
        </Link>

        <nav className="nav-links">
          <Link to="/scholars">Browse scholars</Link>

          {!isAuthenticated && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="nav-cta">
                Sign up
              </Link>
            </>
          )}

          {isAuthenticated && role === "USER" && (
            <>
              <span className="nav-role-tag">{profile?.name || "Account"}</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          )}

          {isAuthenticated && role === "ADMIN" && (
            <>
              <Link to="/admin">Admin panel</Link>
              <span className="nav-role-tag">Admin</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          )}

          {!isAuthenticated && <Link to="/admin/login">Admin</Link>}
        </nav>
      </div>
    </header>
  );
}
