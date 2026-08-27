import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page container" style={{ textAlign: "center" }}>
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/scholars" className="btn btn-primary">
        Back to browse
      </Link>
    </div>
  );
}
