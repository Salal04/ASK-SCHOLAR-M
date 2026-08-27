const CONV_PREFIX = "askScholar_convs_"; // list of conversations for a scholar
const ACTIVE_PREFIX = "askScholar_active_"; // which conversation id is selected
const MSG_PREFIX = "askScholar_chat_"; // messages for one scholar+conversation
const MAX_HISTORY_WORDS = 2000;

function convListKey(scholarId) {
  return `${CONV_PREFIX}${scholarId}`;
}
function activeKey(scholarId) {
  return `${ACTIVE_PREFIX}${scholarId}`;
}
function msgKey(scholarId, conversationId) {
  return `${MSG_PREFIX}${scholarId}_${conversationId}`;
}

function newConversationId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

/**
 * Returns the list of conversations for a scholar ({ id, name, createdAt }),
 * creating a default first conversation if none exist yet.
 */
export function listConversations(scholarId) {
  const existing = readJSON(convListKey(scholarId), []);
  if (existing.length > 0) return existing;

  const first = { id: newConversationId(), name: "Conversation 1", createdAt: new Date().toISOString() };
  writeJSON(convListKey(scholarId), [first]);
  return [first];
}

/** Creates a new conversation for a scholar and makes it the active one. */
export function createConversation(scholarId, name) {
  const conversations = listConversations(scholarId);
  const conversation = {
    id: newConversationId(),
    name: (name || "").trim() || `Conversation ${conversations.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  writeJSON(convListKey(scholarId), [...conversations, conversation]);
  setActiveConversationId(scholarId, conversation.id);
  return conversation;
}

/** Gets the currently selected conversation id for a scholar (falls back to the first). */
export function getActiveConversationId(scholarId) {
  const conversations = listConversations(scholarId);
  const stored = sessionStorage.getItem(activeKey(scholarId));
  if (stored && conversations.some((c) => c.id === stored)) return stored;
  return conversations[0].id;
}

export function setActiveConversationId(scholarId, conversationId) {
  sessionStorage.setItem(activeKey(scholarId), conversationId);
}

/** Loads the stored Q&A messages for one scholar+conversation from sessionStorage. */
export function loadMessages(scholarId, conversationId) {
  return readJSON(msgKey(scholarId, conversationId), []);
}

/** Persists the full message list for one scholar+conversation to sessionStorage. */
export function saveMessages(scholarId, conversationId, messages) {
  writeJSON(msgKey(scholarId, conversationId), messages);
}

/** Appends one message ({ role: 'user'|'scholar', content, timestamp, ... }) and saves it. */
export function appendMessage(scholarId, conversationId, message) {
  const messages = loadMessages(scholarId, conversationId);
  const updated = [...messages, message];
  saveMessages(scholarId, conversationId, updated);
  return updated;
}

export function clearMessages(scholarId, conversationId) {
  sessionStorage.removeItem(msgKey(scholarId, conversationId));
}

/**
 * Builds a plain-text transcript of prior messages, trimmed to the most
 * recent MAX_HISTORY_WORDS words (oldest content is dropped first). This is
 * scoped to whichever conversation's messages are passed in, so the 2000
 * word cap only ever applies to the current conversation.
 */
export function buildHistoryText(messages, wordLimit = MAX_HISTORY_WORDS) {
  const lines = messages.map((m) => `${m.role === "user" ? "Questioner" : "Scholar"}: ${m.content}`);
  const fullTranscript = lines.join("\n");

  const words = fullTranscript.split(/\s+/).filter(Boolean);
  if (words.length <= wordLimit) return fullTranscript;

  // Keep the last `wordLimit` words (most recent context).
  return words.slice(words.length - wordLimit).join(" ");
}

export { MAX_HISTORY_WORDS };
