import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Subject = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

const subjects: Subject[] = [
  { id: "math", label: "Mathematics", icon: "∑", color: "#f59e0b" },
  { id: "science", label: "Science", icon: "⚛", color: "#10b981" },
  { id: "history", label: "History", icon: "📜", color: "#8b5cf6" },
  { id: "language", label: "Language", icon: "✍", color: "#ef4444" },
  { id: "code", label: "Coding", icon: "</>" , color: "#3b82f6" },
  { id: "philosophy", label: "Philosophy", icon: "🔮", color: "#ec4899" },
];

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function AITeacher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState<Subject>(subjects[0]);
  const [level, setLevel] = useState("beginner");
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const systemPrompt = `You are an expert, enthusiastic AI tutor specializing in ${subject.label} for ${levelLabels[level]} students.

Your teaching style:
- Break down complex concepts into digestible pieces
- Use analogies and real-world examples
- Ask guiding questions to promote critical thinking
- Celebrate progress and encourage curiosity
- Adapt your language to the ${level} level
- Use markdown formatting: **bold** for key terms, \`code\` for technical terms, numbered lists for steps
- Keep responses focused and not overly long — aim for clarity over completeness
- End with a thought-provoking question or next step to keep the student engaged

Subject: ${subject.label} | Level: ${levelLabels[level]}`;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").join("") || "Sorry, I couldn't respond.";
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startLesson = () => {
    setStarted(true);
    setMessages([]);
    setTimeout(() => {
      sendMessage(`Hello! I'm ready to learn ${subject.label} at a ${level} level. Please introduce yourself and give me a brief overview of what we'll explore together.`);
    }, 100);
  };

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setInput("");
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
      .replace(/^(\d+)\. /gm, '<br/><span style="opacity:0.6">$1.</span> ')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8e4d8",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse at 20% 20%, ${subject.color}18 0%, transparent 60%), 
                     radial-gradient(ellipse at 80% 80%, ${subject.color}10 0%, transparent 50%)`,
        transition: "background 0.6s ease",
      }} />

      {!started ? (
        // Landing / Setup Screen
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "14px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5, marginBottom: "16px" }}>
              Powered by Claude
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: "normal", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Your Personal
              <br />
              <span style={{ color: subject.color, transition: "color 0.4s" }}>AI Tutor</span>
            </h1>
            <p style={{ marginTop: "20px", opacity: 0.5, fontSize: "1.1rem", fontWeight: "normal", maxWidth: "440px", lineHeight: 1.6 }}>
              Choose your subject, set your level, and begin a personalized learning journey.
            </p>
          </div>

          {/* Subject Picker */}
          <div style={{ width: "100%", maxWidth: "560px", marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.4, marginBottom: "12px" }}>Subject</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s)}
                  style={{
                    background: subject.id === s.id ? `${s.color}22` : "rgba(255,255,255,0.04)",
                    border: subject.id === s.id ? `1.5px solid ${s.color}` : "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "16px 12px",
                    cursor: "pointer",
                    color: subject.id === s.id ? s.color : "#e8e4d8",
                    fontFamily: "inherit",
                    fontSize: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                    transform: subject.id === s.id ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
                  <span style={{ opacity: 0.9 }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Level Picker */}
          <div style={{ width: "100%", maxWidth: "560px", marginBottom: "40px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.4, marginBottom: "12px" }}>Level</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {["beginner", "intermediate", "advanced"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  style={{
                    flex: 1,
                    background: level === l ? `${subject.color}22` : "rgba(255,255,255,0.04)",
                    border: level === l ? `1.5px solid ${subject.color}` : "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "12px",
                    cursor: "pointer",
                    color: level === l ? subject.color : "#e8e4d8",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                    transition: "all 0.2s",
                    textTransform: "capitalize",
                  }}
                >
                  {levelLabels[l]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startLesson}
            style={{
              background: subject.color,
              border: "none",
              borderRadius: "14px",
              padding: "18px 48px",
              fontSize: "1rem",
              fontFamily: "inherit",
              color: "#0a0a0f",
              fontWeight: "bold",
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
              boxShadow: `0 8px 32px ${subject.color}44`,
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
          >
            Begin Lesson →
          </button>
        </div>
      ) : (
        // Chat Screen
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", maxWidth: "780px", margin: "0 auto", width: "100%", padding: "0 16px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.6rem" }}>{subject.icon}</span>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: "bold", color: subject.color }}>{subject.label}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.4, textTransform: "capitalize", letterSpacing: "0.1em" }}>{level} level</div>
              </div>
            </div>
            <button
              onClick={reset}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "8px 16px", cursor: "pointer", color: "#e8e4d8",
                fontFamily: "inherit", fontSize: "0.8rem", opacity: 0.7,
              }}
            >
              ← Change Subject
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 0", display: "flex", flexDirection: "column", gap: "20px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                    background: `${subject.color}22`, border: `1.5px solid ${subject.color}66`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", color: subject.color,
                  }}>
                    {subject.icon}
                  </div>
                )}
                <div style={{
                  maxWidth: "80%",
                  background: msg.role === "user" ? `${subject.color}18` : "rgba(255,255,255,0.04)",
                  border: msg.role === "user" ? `1px solid ${subject.color}44` : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "14px 18px",
                  fontSize: "0.95rem",
                  lineHeight: "1.65",
                }}>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                  background: `${subject.color}22`, border: `1.5px solid ${subject.color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", color: subject.color,
                }}>
                  {subject.icon}
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px 18px 18px 4px", padding: "14px 20px",
                  display: "flex", gap: "6px", alignItems: "center",
                }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{
                      width: "7px", height: "7px", borderRadius: "50%", background: subject.color,
                      animation: "pulse 1.2s ease-in-out infinite",
                      animationDelay: `${j * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "16px 0 24px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{
              display: "flex", gap: "10px", alignItems: "flex-end",
              background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: "16px", padding: "12px 16px",
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask anything about ${subject.label}...`}
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e8e4d8", fontFamily: "inherit", fontSize: "0.95rem", resize: "none",
                  lineHeight: "1.5", maxHeight: "120px", overflowY: "auto",
                }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() && !loading ? subject.color : "rgba(255,255,255,0.1)",
                  border: "none", borderRadius: "10px", width: "38px", height: "38px",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  color: input.trim() && !loading ? "#0a0a0f" : "rgba(255,255,255,0.3)",
                  fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s",
                }}
              >
                ↑
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: "0.72rem", opacity: 0.3, marginTop: "10px" }}>
              Press Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
