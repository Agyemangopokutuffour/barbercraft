import React, { useState, useRef, useEffect } from 'react';
import { CHATBOT_API_URL } from '../config';

const ExpandIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

const CollapseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

const ChatWidget = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null);

  const toggleExpand = () => setExpanded((v) => !v);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMessage = { role: 'user', content: text };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${CHATBOT_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_history: history }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('rate-limit');
        }
        throw new Error(`http-${res.status}`);
      }

      const data = await res.json();
      const reply = data?.reply || 'Sorry, I could not find an answer for that. Try rephrasing?';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      if (err.message === 'rate-limit') {
        setError("You're sending messages a bit fast. Give me a moment and try again.");
      } else {
        setError("I couldn't reach the chat service. Please try again in a moment.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const panelClasses = expanded
    ? 'fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden bg-ink-raised animate-settle-in sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[80vh] sm:w-[600px] sm:max-w-[calc(100vw-3rem)] sm:rounded-sm sm:border sm:border-white/15 sm:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]'
    : 'fixed bottom-56 right-6 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-3rem))] max-h-[calc(100vh-16rem)] flex-col overflow-hidden rounded-sm border border-white/15 bg-ink-raised shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)] animate-settle-in';

  return (
    <div className={panelClasses}>
      <div className="flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3">
        <div>
          <p className="eyebrow">BarberCraft</p>
          <h2 className="font-display text-lg font-semibold uppercase tracking-tight text-towel">
            Chat Support
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpand}
            aria-label={expanded ? 'Collapse chat panel' : 'Expand chat panel'}
            aria-expanded={expanded}
            title={expanded ? 'Collapse' : 'Expand'}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-white/15 text-silver transition-colors hover:border-amber hover:text-amber"
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-white/15 text-silver transition-colors hover:border-amber hover:text-amber"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="px-1 font-mono text-[0.7rem] uppercase tracking-wider text-silver/70">
            Ask about services, pricing, or booking — I'm here to help.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-steel-raised px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <p className="max-w-[90%] rounded-sm border border-amber/30 bg-ink px-3 py-2 font-mono text-[0.72rem] text-amber">
              {error}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-white/10 bg-ink px-3 py-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          aria-label="Chat message"
          className="input-dark flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-leather text-towel transition-colors duration-200 hover:bg-[#8f2a3a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↑
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;