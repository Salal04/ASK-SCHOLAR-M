import client from "./client";

export async function registerUser({ name, email, password }) {
  const { data } = await client.post("/auth/user/register", { name, email, password });
  return data.data; // { user, token }
}

export async function loginUser({ email, password }) {
  const { data } = await client.post("/auth/user/login", { email, password });
  return data.data; // { user, token }
}

export async function loginAdmin({ email, password }) {
  const { data } = await client.post("/auth/admin/login", { email, password });
  return data.data; // { admin, token }
}
