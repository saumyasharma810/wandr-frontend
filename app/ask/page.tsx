"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { sendChatStream, getConversations, getConversation, deleteConversation } from "../lib/api";
import { UiChatMessage, ConversationPreview } from "../lib/types";
import { useAuth } from "../contexts/AuthContext";
import { MOCK_CHAT } from "../lib/mock-data";

function renderInline(text: string): React.ReactNode[] {
  // handles **bold** and *italic*
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) parts.push(<strong key={key++} style={{ fontWeight: 600 }}>{match[1]}</strong>);
    else if (match[2] !== undefined) parts.push(<em key={key++}>{match[2]}</em>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {renderInline(line)}
        </span>
      ))}
    </>
  );
}

function previewTitle(text: string): string {
  const words = text.trim().split(/\s+/);
  return words.slice(0, 7).join(" ") + (words.length > 7 ? "…" : "");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AskWandrPage() {
  const { isAuthenticated, isLoading } = useAuth();

  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch {
      // silently fail — sidebar just stays empty
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadConversations();
  }, [isAuthenticated, loadConversations]);

  async function loadConversation(id: number) {
    try {
      const msgs = await getConversation(id);
      setMessages(msgs.map((m) => ({
        id: String(m.id),
        role: m.role,
        content: m.content,
      })));
      setConversationId(id);
    } catch {
      // ignore
    }
  }

  function startNewChat() {
    setMessages([]);
    setConversationId(null);
    inputRef.current?.focus();
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.conversation_id !== id));
      if (conversationId === id) startNewChat();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: UiChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    let newConvId: number | null = null;

    try {
      await sendChatStream(
        { message: text, conversation_id: conversationId },
        (id) => {
          newConvId = id;
          setConversationId(id);
        },
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
          );
        },
        (fullText) => {
          // Backend sends the complete text at the end — overwrite whatever chunks arrived
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
          );
        },
      );
      // Reload sidebar so new conversation appears
      await loadConversations();
      if (newConvId !== null) setConversationId(newConvId);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: err instanceof Error ? `Error: ${err.message}` : "Something went wrong." }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isLoading) return null;

  // ── GUEST MODE ────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 56px)", backgroundColor: "#FAF8F5" }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: "#E8E2D9" }}>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
            Ask Wandr
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8C8279" }}>Where are you wandering next?</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-6" style={{ maxWidth: "680px", margin: "0 auto" }}>
            {MOCK_CHAT.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%]">
                  {msg.role === "user" ? (
                    <div style={{ backgroundColor: "#C4773B", color: "#FFFFFF", borderRadius: "12px 12px 4px 12px", padding: "12px 16px", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div>
                      <div className="leading-relaxed" style={{ color: "#2C2825", fontSize: "0.9375rem", lineHeight: 1.75 }}>
                        <MarkdownText text={msg.content} />
                      </div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <span className="text-xs" style={{ color: "#8C8279" }}>Based on →</span>
                          {msg.citations.map((c) => (
                            <span key={c} className="px-2.5 py-0.5 text-xs" style={{ backgroundColor: "#F0E6D8", color: "#C4773B", borderRadius: "9999px" }}>{c}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs mt-2 italic" style={{ color: "#8C8279" }}>Crafted by Wandr</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t" style={{ borderColor: "#E8E2D9", backgroundColor: "#FAF8F5" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E2D9", borderRadius: "8px" }}>
              <span className="flex-1 text-sm" style={{ color: "#8C8279" }}>Sign in to ask Wandr your own questions…</span>
              <Link href="/auth" className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#C4773B", borderRadius: "6px", textDecoration: "none" }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED MODE ────────────────────────────────────────────────────────
  return (
    <div className="flex" style={{ height: "calc(100vh - 56px)", backgroundColor: "#FAF8F5" }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside
          className="flex flex-col flex-shrink-0"
          style={{
            width: "260px",
            borderRight: "1px solid #E8E2D9",
            backgroundColor: "#F2EFE9",
            overflow: "hidden",
          }}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8C8279", letterSpacing: "0.1em" }}>
              Chats
            </span>
            <button
              onClick={startNewChat}
              title="New chat"
              style={{
                background: "none",
                border: "1px solid #E8E2D9",
                borderRadius: "6px",
                color: "#2C2825",
                cursor: "pointer",
                padding: "3px 8px",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              + New
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto pb-4">
            {conversations.length === 0 ? (
              <p className="px-4 py-3 text-xs" style={{ color: "#8C8279" }}>No conversations yet.</p>
            ) : (
              conversations.map((conv) => {
                const active = conv.conversation_id === conversationId;
                return (
                  <div
                    key={conv.conversation_id}
                    className="group flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg cursor-pointer"
                    style={{
                      backgroundColor: active ? "#FAF8F5" : "transparent",
                      borderLeft: active ? "2px solid #C4773B" : "2px solid transparent",
                    }}
                    onClick={() => loadConversation(conv.conversation_id)}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "#EDE8DF";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: active ? "#2C2825" : "#5C5550", fontWeight: active ? 500 : 400 }}>
                        {previewTitle(conv.preview)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#8C8279" }}>
                        {formatDate(conv.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(conv.conversation_id, e)}
                      disabled={deletingId === conv.conversation_id}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#B5696A",
                        fontSize: "0.85rem",
                        padding: "2px 4px",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* Main chat */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b flex-shrink-0" style={{ borderColor: "#E8E2D9" }}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title="Toggle sidebar"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8C8279", padding: "2px 4px", fontSize: "1rem", lineHeight: 1 }}
          >
            ☰
          </button>
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
              Ask Wandr
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#8C8279" }}>Where are you wandering next?</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-6" style={{ maxWidth: "680px", margin: "0 auto" }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-xl font-medium mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
                  Where are you wandering next?
                </p>
                <p className="text-sm" style={{ color: "#8C8279" }}>Ask me anything about travel — I know your history.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animation: "wandr-msg-in 0.25s ease-out" }}
              >
                <div className="max-w-[85%]">
                  {msg.role === "user" ? (
                    <div style={{ backgroundColor: "#C4773B", color: "#FFFFFF", borderRadius: "12px 12px 4px 12px", padding: "12px 16px", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div>
                      <div className="leading-relaxed" style={{ color: "#2C2825", fontSize: "0.9375rem", lineHeight: 1.75 }}>
                        <MarkdownText text={msg.content} />
                        {/* Blinking cursor while streaming this message */}
                        {streaming && msg.id === messages[messages.length - 1]?.id && (
                          <span style={{ display: "inline-block", width: "2px", height: "1em", backgroundColor: "#C4773B", marginLeft: "2px", animation: "wandr-cursor 0.8s step-end infinite", verticalAlign: "text-bottom" }} />
                        )}
                      </div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <span className="text-xs" style={{ color: "#8C8279" }}>Based on →</span>
                          {msg.citations.map((c) => (
                            <span key={c} className="px-2.5 py-0.5 text-xs" style={{ backgroundColor: "#F0E6D8", color: "#C4773B", borderRadius: "9999px" }}>{c}</span>
                          ))}
                        </div>
                      )}
                      {!streaming && <p className="text-xs mt-2 italic" style={{ color: "#8C8279" }}>Crafted by Wandr</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#E8E2D9", backgroundColor: "#FAF8F5" }}>
          <div className="flex items-end gap-3" style={{ maxWidth: "680px", margin: "0 auto" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask about a destination, compare trips, plan what's next…"
              rows={1}
              className="flex-1 resize-none"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${focused ? "#C4773B" : "#E8E2D9"}`,
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "0.9375rem",
                color: "#2C2825",
                outline: "none",
                boxShadow: focused ? "0 0 0 3px #F0E6D8" : "none",
                lineHeight: 1.5,
                maxHeight: "120px",
                overflow: "auto",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="flex-shrink-0 px-5 py-2.5 text-sm font-medium text-white"
              style={{
                backgroundColor: "#C4773B",
                borderRadius: "8px",
                border: "none",
                cursor: input.trim() && !streaming ? "pointer" : "not-allowed",
                opacity: input.trim() && !streaming ? 1 : 0.5,
              }}
            >
              {streaming ? "…" : "Send"}
            </button>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: "#8C8279" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes wandr-msg-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wandr-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
