import client from "./client";

// ---- Scholars ----

export async function createScholarFull(formData) {
  const { data } = await client.post("/admin/scholars", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.scholar;
}

export async function inviteScholar({ email, name, fiqah }) {
  const { data } = await client.post("/admin/scholars/invite", { email, name, fiqah });
  return data.data; // { scholar, inviteToken, invitationExpiresAt }
}

export async function listScholarsAdmin(params = {}) {
  const { data } = await client.get("/admin/scholars", { params });
  return data.data; // { scholars, pagination }
}

export async function deleteScholar(id) {
  const { data } = await client.delete(`/admin/scholars/${id}`);
  return data;
}

export async function setScholarActiveStatus(id, isActive) {
  const { data } = await client.patch(`/admin/scholars/${id}/status`, { isActive });
  return data.data.scholar;
}

export async function resendScholarInvite(id) {
  const { data } = await client.post(`/admin/scholars/${id}/resend-invite`);
  return data.data;
}

// ---- Videos ----

/** Attaches a YouTube video to a scholar. Sends only the url + scholar id. */
export async function addScholarVideo({ scholarId, url }) {
  console.log(" scholarId: " ,  scholarId);
  console.log(" url: " ,  url);
  const { data } = await client.post("/admin/videos", { scholarId, url });
  return data.data; // { video }
}

// ---- Users ----

export async function listUsersAdmin(params = {}) {
  const { data } = await client.get("/admin/users", { params });
  return data.data; // { users, pagination }
}

export async function deleteUser(id) {
  const { data } = await client.delete(`/admin/users/${id}`);
  return data;
}

export async function uploadScholarDocument(formData) {
  console.log("Called! = = = = = = =w=dwd=w = sd 2324323= ");
  console.log(formData);
  const res = await client.post("/admin/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data; // { sourceId, sourceType, sourceUrl, title, chunksStored, scholarId }
}
