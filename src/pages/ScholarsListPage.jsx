import { useEffect, useState } from "react";
import { browseScholars } from "../api/scholars";
import ScholarCard from "../components/ScholarCard";
import Pagination from "../components/Pagination";
import GeometricMotif from "../components/GeometricMotif";

const FIQAH_OPTIONS = [
  { value: "", label: "All schools" },
  { value: "HANAFI", label: "Hanafi" },
  { value: "SHAFI", label: "Shafi'i" },
  { value: "MALIKI", label: "Maliki" },
  { value: "HANBALI", label: "Hanbali" },
  { value: "JAFARI", label: "Ja'fari" },
  { value: "OTHER", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "popularity", label: "Most popular first" },
];

export default function ScholarsListPage() {
  const [search, setSearch] = useState("");
  const [fiqah, setFiqah] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const [scholars, setScholars] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    browseScholars({
      search: search || undefined,
      fiqah: fiqah || undefined,
      location: location || undefined,
      language: language || undefined,
      sort: sort || undefined,
      page,
      limit: 12,
    })
      .then((data) => {
        if (!active) return;
        setScholars(data.scholars);
        setPagination(data.pagination);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, fiqah, location, language, sort, page]);

  function handleFilterChange(setter) {
    return (e) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <>
      <section className="hero">
        <GeometricMotif className="hero-motif" />
        <div className="hero-inner">
          <span className="eyebrow">Ask Scholar</span>
          <h1>Find a scholar. Ask with confidence.</h1>
          <p>Browse verified scholars by school of thought, location, and language, then start a conversation.</p>
        </div>
      </section>

      <div className="container page" style={{ paddingTop: 0 }}>
        <div className="filter-bar">
          <div className="field">
            <label htmlFor="search">Search</label>
            <input id="search" placeholder="Name, specialization..." value={search} onChange={handleFilterChange(setSearch)} />
          </div>
          <div className="field">
            <label htmlFor="fiqah">School</label>
            <select id="fiqah" value={fiqah} onChange={handleFilterChange(setFiqah)}>
              {FIQAH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" placeholder="City, country" value={location} onChange={handleFilterChange(setLocation)} />
          </div>
          <div className="field">
            <label htmlFor="language">Language</label>
            <input id="language" placeholder="e.g. Arabic" value={language} onChange={handleFilterChange(setLanguage)} />
          </div>
          <div className="field">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={handleFilterChange(setSort)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <label>&nbsp;</label>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                setSearch("");
                setFiqah("");
                setLocation("");
                setLanguage("");
                setSort("");
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && <p>Loading scholars...</p>}

        {!loading && scholars.length === 0 && !error && (
          <div className="empty-state">
            <h3>No scholars match these filters</h3>
            <p>Try widening your search or clearing a filter.</p>
          </div>
        )}

        {!loading && scholars.length > 0 && (
          <div className="scholar-grid">
            {scholars.map((s) => (
              <ScholarCard key={s.id} scholar={s} />
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </>
  );
}