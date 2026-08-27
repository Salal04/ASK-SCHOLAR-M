import client from "./client";

export async function browseScholars(params = {}) {
  const { data } = await client.get("/scholars", { params });
  return data.data; // { scholars, pagination }
}

export async function getScholarById(id) {
  const { data } = await client.get(`/scholars/${id}`);
  return data.data.scholar;
}
