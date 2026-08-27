import { useEffect, useMemo, useState } from "react";
import {
  addScholarVideo,
  createScholarFull,
  deleteScholar,
  deleteUser,
  inviteScholar,
  listScholarsAdmin,
  listUsersAdmin,
  resendScholarInvite,
  setScholarActiveStatus,
  uploadScholarDocument,
} from "../api/admin";
import { FIQAH_LABELS } from "../components/ScholarCard";

const TABS = [
  { key: "create", label: "Create scholar" },
  { key: "invite", label: "Invite scholar" },
  { key: "scholars", label: "Scholars" },
  { key: "users", label: "Users" },
  { key: "video", label: "Add video" },
  { key: "document", label: "Add document" },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("scholars");

  return (
    <div className="page container">
      <span className="eyebrow">Admin panel</span>
      <h1>Manage Ask Scholar</h1>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "create" && <CreateScholarForm />}
      {activeTab === "invite" && <InviteScholarForm />}
      {activeTab === "scholars" && <ScholarsTable />}
      {activeTab === "users" && <UsersTable />}
      {activeTab === "video" && <AddVideoForm />}
      {activeTab === "document" && <AddDocumentForm />}
    </div>
  );
}

// ------------------------------------------------------------------
// Create scholar (full account, admin sets password + profile)
// ------------------------------------------------------------------
function CreateScholarForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    fiqah: "",
    bio: "",
    specialization: "",
    qualifications: "",
    yearsOfExperience: "",
    languages: "",
    location: "",
  });
  const [picture, setPicture] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") fd.append(key, value);
      });
      if (picture) fd.append("picture", picture);

      const scholar = await createScholarFull(fd);
      setStatus({ type: "success", message: `Scholar account created for ${scholar.name}.` });
      setForm({
        name: "",
        email: "",
        password: "",
        fiqah: "",
        bio: "",
        specialization: "",
        qualifications: "",
        yearsOfExperience: "",
        languages: "",
        location: "",
      });
      setPicture(null);
      e.target.reset();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card stack" onSubmit={handleSubmit}>
      <h2 style={{ margin: 0 }}>Create a full scholar account</h2>
      <p style={{ marginTop: -8 }}>Sets a password immediately — the account is usable right away.</p>

      {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}

      <div className="form-grid">
        <div className="field">
          <label>Full name *</label>
          <input required value={form.name} onChange={update("name")} />
        </div>
        <div className="field">
          <label>Email *</label>
          <input type="email" required value={form.email} onChange={update("email")} />
        </div>
        <div className="field">
          <label>Password *</label>
          <input type="password" required minLength={6} value={form.password} onChange={update("password")} />
        </div>
        <div className="field">
          <label>School of thought (fiqah)</label>
          <select value={form.fiqah} onChange={update("fiqah")}>
            <option value="">Select...</option>
            {Object.entries(FIQAH_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Specialization</label>
          <input value={form.specialization} onChange={update("specialization")} placeholder="e.g. Fiqh al-Muamalat" />
        </div>
        <div className="field">
          <label>Years of experience</label>
          <input type="number" min="0" value={form.yearsOfExperience} onChange={update("yearsOfExperience")} />
        </div>
        <div className="field">
          <label>Languages</label>
          <input value={form.languages} onChange={update("languages")} placeholder="Arabic, English, Urdu" />
        </div>
        <div className="field">
          <label>Location</label>
          <input value={form.location} onChange={update("location")} placeholder="City, country" />
        </div>
      </div>

      <div className="field">
        <label>Qualifications</label>
        <textarea rows={2} value={form.qualifications} onChange={update("qualifications")} />
      </div>

      <div className="field">
        <label>Bio</label>
        <textarea rows={3} value={form.bio} onChange={update("bio")} />
      </div>

      <div className="field">
        <label>Profile picture</label>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPicture(e.target.files[0])} />
        <span className="field-hint">JPEG, PNG or WEBP, up to 5MB.</span>
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: "flex-start" }}>
        {loading ? <span className="loader" /> : "Create scholar account"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Invite scholar by email only
// ------------------------------------------------------------------
function InviteScholarForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [fiqah, setFiqah] = useState("");
  const [status, setStatus] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setInviteResult(null);
    setLoading(true);
    try {
      const result = await inviteScholar({ email, name: name || undefined, fiqah: fiqah || undefined });
      setStatus({ type: "success", message: `Invite created for ${email}.` });
      setInviteResult(result);
      setEmail("");
      setName("");
      setFiqah("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card stack" onSubmit={handleSubmit}>
      <h2 style={{ margin: 0 }}>Invite a scholar by email</h2>
      <p style={{ marginTop: -8 }}>
        The scholar sets their own password and profile later using the invite token below.
      </p>

      {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}

      {inviteResult && (
        <div className="alert alert-success" style={{ wordBreak: "break-all" }}>
          <strong>Invite token:</strong> {inviteResult.inviteToken}
          <br />
          <span className="field-hint">
            Expires {new Date(inviteResult.invitationExpiresAt).toLocaleString()}. In production this would be
            emailed to the scholar; share it manually for now.
          </span>
        </div>
      )}

      <div className="form-grid">
        <div className="field">
          <label>Email *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>School of thought (optional)</label>
          <select value={fiqah} onChange={(e) => setFiqah(e.target.value)}>
            <option value="">Select...</option>
            {Object.entries(FIQAH_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: "flex-start" }}>
        {loading ? <span className="loader" /> : "Send invite"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Add YouTube video: pick a scholar (search or dropdown) + paste a URL
// ------------------------------------------------------------------
function AddVideoForm() {
  const [scholars, setScholars] = useState([]);
  const [loadingScholars, setLoadingScholars] = useState(true);
  const [search, setSearch] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    listScholarsAdmin({ limit: 500 })
      .then((data) => {
        if (!active) return;
        const sorted = [...data.scholars].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        );
        setScholars(sorted);
      })
      .catch((err) => active && setStatus({ type: "error", message: err.message }))
      .finally(() => active && setLoadingScholars(false));
    return () => {
      active = false;
    };
  }, []);

  // Dropdown always lists every scholar sorted by name; the search box just
  // narrows that same sorted list down for faster picking by name.
  const filteredScholars = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scholars;
    return scholars.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [scholars, search]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!scholarId || !url.trim()) return;
    setStatus(null);
    setLoading(true);
    try {
      // Only the url + scholar id are sent to the backend.
      await addScholarVideo({ scholarId, url: url.trim() });
      const scholar = scholars.find((s) => s.id === scholarId);
      setStatus({ type: "success", message: `Video linked to ${scholar?.name || "scholar"}.` });
      setUrl("");
      setScholarId("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card stack" onSubmit={handleSubmit}>
      <h2 style={{ margin: 0 }}>Add a YouTube video</h2>
      <p style={{ marginTop: -8 }}>Link a YouTube video to a scholar so it can be referenced in chat answers.</p>

      {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="video-scholar-search">Search scholar by name</label>
          <input
            id="video-scholar-search"
            placeholder="Start typing a name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="video-scholar-select">Scholar *</label>
          <select
            id="video-scholar-select"
            required
            value={scholarId}
            onChange={(e) => setScholarId(e.target.value)}
            disabled={loadingScholars}
          >
            <option value="">{loadingScholars ? "Loading scholars..." : "Select a scholar..."}</option>
            {filteredScholars.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email}
              </option>
            ))}
          </select>
          {!loadingScholars && filteredScholars.length === 0 && (
            <span className="field-hint">No scholars match "{search}".</span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="video-url">YouTube video URL *</label>
        <input
          id="video-url"
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading || !scholarId || !url.trim()}
        style={{ alignSelf: "flex-start" }}
      >
        {loading ? <span className="loader" /> : "Add video"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Add document: pick a scholar (search or dropdown) + upload a file
// (PDF / DOCX / TXT). Same pattern as AddVideoForm above, except this
// uploads a file (multipart) instead of pasting a URL. Uploading with no
// scholar selected also works (backend stores it in a shared/global
// namespace) but the UI keeps scholar selection required, matching the
// video form's behaviour, since docs are almost always tied to one
// scholar's own knowledge base.
// ------------------------------------------------------------------
function AddDocumentForm() {
  const [scholars, setScholars] = useState([]);
  const [loadingScholars, setLoadingScholars] = useState(true);
  const [search, setSearch] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    listScholarsAdmin({ limit: 500 })
      .then((data) => {
        if (!active) return;
        const sorted = [...data.scholars].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        );
        setScholars(sorted);
      })
      .catch((err) => active && setStatus({ type: "error", message: err.message }))
      .finally(() => active && setLoadingScholars(false));
    return () => {
      active = false;
    };
  }, []);

  const filteredScholars = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scholars;
    return scholars.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [scholars, search]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!scholarId || !file) return;
    setStatus(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("scholarId", scholarId);

      const result = await uploadScholarDocument(fd);
      const scholar = scholars.find((s) => s.id === scholarId);
      setStatus({
        type: "success",
        message: `"${result.title}" added to ${scholar?.name || "scholar"}'s knowledge base (${result.chunksStored} chunks stored).`,
      });
      setFile(null);
      setScholarId("");
      e.target.reset();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card stack" onSubmit={handleSubmit}>
      <h2 style={{ margin: 0 }}>Add a document</h2>
      <p style={{ marginTop: -8 }}>
        Upload a PDF, DOCX, or TXT file to a scholar's knowledge base so it can be referenced in chat answers.
      </p>

      {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="doc-scholar-search">Search scholar by name</label>
          <input
            id="doc-scholar-search"
            placeholder="Start typing a name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="doc-scholar-select">Scholar *</label>
          <select
            id="doc-scholar-select"
            required
            value={scholarId}
            onChange={(e) => setScholarId(e.target.value)}
            disabled={loadingScholars}
          >
            <option value="">{loadingScholars ? "Loading scholars..." : "Select a scholar..."}</option>
            {filteredScholars.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email}
              </option>
            ))}
          </select>
          {!loadingScholars && filteredScholars.length === 0 && (
            <span className="field-hint">No scholars match "{search}".</span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="doc-file">Document file *</label>
        <input
          id="doc-file"
          type="file"
          required
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        <span className="field-hint">PDF, DOCX or TXT.</span>
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading || !scholarId || !file}
        style={{ alignSelf: "flex-start" }}
      >
        {loading ? <span className="loader" /> : "Add document"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Scholars table: list, resend invite, suspend/reactivate, delete
// ------------------------------------------------------------------
function ScholarsTable() {
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await listScholarsAdmin({ limit: 100 });
      setScholars(data.scholars);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete scholar "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await deleteScholar(id);
      setScholars((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(scholar) {
    setBusyId(scholar.id);
    try {
      const updated = await setScholarActiveStatus(scholar.id, !scholar.isActive);
      setScholars((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleResendInvite(id) {
    setBusyId(id);
    try {
      const result = await resendScholarInvite(id);
      alert(`New invite token: ${result.inviteToken}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="section-head">
        <h2 style={{ margin: 0 }}>All scholars</h2>
        <button className="btn btn-outline btn-sm" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && scholars.length === 0 && (
        <div className="empty-state">No scholars yet. Create or invite one from the tabs above.</div>
      )}

      {!loading && scholars.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Fiqah</th>
                <th>Status</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scholars.map((s) => (
                <tr key={s.id}>
                  <td>{s.name || <em>Pending</em>}</td>
                  <td>{s.email}</td>
                  <td>{s.fiqah ? FIQAH_LABELS[s.fiqah] || s.fiqah : "-"}</td>
                  <td>
                    <span className={`tag ${s.status === "ACTIVE" ? "badge-success" : ""}`}>{s.status}</span>
                  </td>
                  <td>
                    <span className={`tag ${s.isActive ? "badge-success" : "badge-danger"}`}>
                      {s.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    {s.status === "PENDING" && (
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={busyId === s.id}
                        onClick={() => handleResendInvite(s.id)}
                      >
                        Resend invite
                      </button>
                    )}
                    {s.status === "ACTIVE" && (
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={busyId === s.id}
                        onClick={() => handleToggleActive(s)}
                      >
                        {s.isActive ? "Suspend" : "Reactivate"}
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={busyId === s.id}
                      onClick={() => handleDelete(s.id, s.name || s.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Users table: list, delete
// ------------------------------------------------------------------
function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await listUsersAdmin({ limit: 100 });
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="section-head">
        <h2 style={{ margin: 0 }}>All users</h2>
        <button className="btn btn-outline btn-sm" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && users.length === 0 && <div className="empty-state">No users have signed up yet.</div>}

      {!loading && users.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={busyId === u.id}
                      onClick={() => handleDelete(u.id, u.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}