import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { askScholarQuestion } from "../api/chat";
import YouTubeTimestampLink from "./YouTubeTimestampLink";
import {
  appendMessage,
  buildHistoryText,
  clearMessages,
  createConversation,
  getActiveConversationId,
  listConversations,
  loadMessages,
  MAX_HISTORY_WORDS,
  setActiveConversationId,
} from "../utils/history";

export default function ChatPanel({ scholar }) {
  const { isAuthenticated, role } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [newConversationName, setNewConversationName] = useState("");
  const scrollRef = useRef(null);

  // Load this scholar's conversations, pick up whichever was last active.
  useEffect(() => {
    const convs = listConversations(scholar.id);
    const activeId = getActiveConversationId(scholar.id);
    setConversations(convs);
    setConversationId(activeId);
    setMessages(loadMessages(scholar.id, activeId));
    setCreatingConversation(false);
  }, [scholar.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  if (!isAuthenticated || role !== "USER") {
    return (
      <div className="card chat-panel">
        <div className="chat-login-prompt">
          <h3 style={{ margin: 0 }}>Log in to ask a question</h3>
          <p style={{ margin: 0 }}>Only registered users can start a conversation with {scholar.name}.</p>
          <Link to="/login" className="btn btn-primary btn-sm">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  function switchConversation(id) {
    setActiveConversationId(scholar.id, id);
    setConversationId(id);
    setMessages(loadMessages(scholar.id, id));
    setError("");
    setCreatingConversation(false);
  }

  function handleCreateConversation(e) {
    e.preventDefault();
    const conversation = createConversation(scholar.id, newConversationName);
    setConversations(listConversations(scholar.id));
    setNewConversationName("");
    setCreatingConversation(false);
    switchConversation(conversation.id);
  }

  const activeConversation = conversations.find((c) => c.id === conversationId);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || sending || !conversationId) return;

    setError("");
    const userMessage = { role: "user", content: trimmed, timestamp: new Date().toISOString() };

    // 1. Build history text from everything asked/answered so far in THIS
    //    conversation only (before this new question), capped at 2000 words.
    const priorMessages = loadMessages(scholar.id, conversationId);
    const historyText = buildHistoryText(priorMessages, MAX_HISTORY_WORDS);

    // 2. Persist + show the new question immediately.
    const updated = appendMessage(scholar.id, conversationId, userMessage);
    setMessages(updated);
    setQuestion("");
    setSending(true);

    try {
      // 3. Send current question + capped history + the scholar id and
      //    conversation id/name (the conversation "key") to the backend,
      //    so it replies within the correct conversation thread.
      const { answer, video } = await askScholarQuestion(scholar.id, {
        question: trimmed,
        history: historyText,
        conversationId,
        conversationName: activeConversation?.name,
      });

      const scholarMessage = { role: "scholar", content: answer, video, timestamp: new Date().toISOString() };
      const withAnswer = appendMessage(scholar.id, conversationId, scholarMessage);
      setMessages(withAnswer);
    } catch (err) {
      setError(err.message || "Could not send your question. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleClear() {
    if (!conversationId) return;
    clearMessages(scholar.id, conversationId);
    setMessages([]);
  }

  return (
    <div className="card chat-panel">
      <div className="chat-header">
        <div>
          <strong>Ask {scholar.name}</strong>
          <div className="field-hint">Your conversations are kept in this browser tab only.</div>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      <div className="conversation-bar">
        <div className="conversation-tabs">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`conversation-tab ${c.id === conversationId ? "active" : ""}`}
              onClick={() => switchConversation(c.id)}
              title={c.name}
            >
              {c.name}
            </button>
          ))}
        </div>
        {!creatingConversation ? (
          <button
            type="button"
            className="btn btn-outline btn-sm conversation-new-btn"
            onClick={() => setCreatingConversation(true)}
          >
            + New conversation
          </button>
        ) : (
          <form className="conversation-new-form" onSubmit={handleCreateConversation}>
            <input
              autoFocus
              placeholder="Conversation name"
              value={newConversationName}
              onChange={(e) => setNewConversationName(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit">
              Create
            </button>
            <button
              className="btn btn-outline btn-sm"
              type="button"
              onClick={() => {
                setCreatingConversation(false);
                setNewConversationName("");
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3 L25 15 L38 20 L25 25 L20 37 L15 25 L2 20 L15 15 Z" stroke="var(--color-brass)" strokeWidth="1.4" />
            </svg>
            <p style={{ margin: 0 }}>No questions yet. Ask {scholar.name} anything within their area of guidance.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "msg-user" : "msg-scholar"}`}>
            {m.content}
            {m.video && <YouTubeTimestampLink video={m.video} />}
            <span className="msg-time">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}

        {sending && (
          <div className="msg msg-scholar">
            <span className="loader" /> Thinking...
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ margin: "0 16px 10px" }}>
          {error}
        </div>
      )}

      <div className="word-count-note">History sent with each question is capped at {MAX_HISTORY_WORDS} words.</div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <textarea
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button className="btn btn-primary" type="submit" disabled={sending || !question.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}