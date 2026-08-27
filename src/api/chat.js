import client from "./client";

/**
 * Sends a question to a scholar, along with a capped transcript of the
 * prior conversation (built client-side, see utils/history.js).
 */
export async function askScholarQuestion(scholarId, { question, history }) {
  const { data } = await client.post(`/scholars/askQuestion/${scholarId}`, {question, history });
  return data.data; // { answer, askedAt }
}
