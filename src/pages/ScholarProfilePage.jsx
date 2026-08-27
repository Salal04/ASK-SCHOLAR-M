import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getScholarById } from "../api/scholars";
import ChatPanel from "../components/ChatPanel";
import { FIQAH_LABELS } from "../components/ScholarCard";
import PopularityBadge from "../components/PopularityBadge";

export default function ScholarProfilePage() {
  const { id } = useParams();
  const [scholar, setScholar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getScholarById(id)
      .then((data) => active && setScholar(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !scholar) {
    return (
      <div className="page container">
        <div className="alert alert-error">{error || "Scholar not found."}</div>
        <p style={{ marginTop: 16 }}>
          <Link to="/scholars">&larr; Back to browse</Link>
        </p>
      </div>
    );
  }

  const initial = scholar.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="page container">
      <p>
        <Link to="/scholars">&larr; Back to browse</Link>
      </p>

      <div className="card profile-header">
        {scholar.picture ? (
          <img className="profile-avatar" src={scholar.picture} alt={scholar.name} />
        ) : (
          <div className="profile-avatar-fallback">{initial}</div>
        )}

        <div>
          <h1 style={{ marginBottom: 6 }}>{scholar.name}</h1>
          <div className="scholar-meta">
            <PopularityBadge scholar={scholar} />
            {scholar.fiqah && <span className="tag">{FIQAH_LABELS[scholar.fiqah] || scholar.fiqah}</span>}
            {scholar.location && <span className="tag">{scholar.location}</span>}
            {scholar.isVerified && <span className="tag badge-success">Verified</span>}
          </div>

          {scholar.bio && <p style={{ marginTop: 14 }}>{scholar.bio}</p>}

          <div className="profile-fact-grid">
            <PopularityBadge scholar={scholar} size="lg" />
            {scholar.specialization && (
              <div className="profile-fact">
                <span className="fact-label">Specialization</span>
                <span className="fact-value">{scholar.specialization}</span>
              </div>
            )}
            {typeof scholar.yearsOfExperience === "number" && (
              <div className="profile-fact">
                <span className="fact-label">Experience</span>
                <span className="fact-value">{scholar.yearsOfExperience} years</span>
              </div>
            )}
            {scholar.languages?.length > 0 && (
              <div className="profile-fact">
                <span className="fact-label">Languages</span>
                <span className="fact-value">{scholar.languages.join(", ")}</span>
              </div>
            )}
          </div>

          {scholar.qualifications && (
            <div style={{ marginTop: 8 }}>
              <span className="eyebrow">Qualifications</span>
              <p style={{ marginTop: 6 }}>{scholar.qualifications}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <ChatPanel scholar={scholar} />
      </div>
    </div>
  );
}