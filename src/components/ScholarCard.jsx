import { Link } from "react-router-dom";
import PopularityBadge from "./PopularityBadge";

const FIQAH_LABELS = {
  HANAFI: "Hanafi",
  SHAFI: "Shafi'i",
  MALIKI: "Maliki",
  HANBALI: "Hanbali",
  JAFARI: "Ja'fari",
  Independent: "Independent",
  OTHER: "Other",
};

export default function ScholarCard({ scholar }) {
  const initial = scholar.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <Link to={`/scholars/${scholar.id}`} className="card scholar-card">
      {scholar.picture ? (
        <img className="scholar-avatar" src={scholar.picture} alt={scholar.name} />
      ) : (
        <div className="scholar-avatar-fallback">{initial}</div>
      )}

      <h3>{scholar.name || "Unnamed scholar"}</h3>

      <div className="scholar-meta">
        <PopularityBadge scholar={scholar} />
        {scholar.fiqah && <span className="tag">{FIQAH_LABELS[scholar.fiqah] || scholar.fiqah}</span>}
        {scholar.location && <span className="tag">{scholar.location}</span>}
      </div>

      {scholar.bio && <p className="bio-preview">{scholar.bio}</p>}
    </Link>
  );
}

export { FIQAH_LABELS };