import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { helpdeskApi } from '../../api';

interface Message {
  id: string;
  text: string;
  fromAgent: boolean;
  time: string;
}

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    try {
      const session = await helpdeskApi.createChatSession();
      setSessionKey(session.session_key);
      const ws = new WebSocket(`${WS_BASE}/ws/chat/${session.session_key}/`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setMessages([{
          id: 'welcome',
          text: 'Hi! How can we help you today? An agent will be with you shortly.',
          fromAgent: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'message' && data.is_from_agent) {
          const msg: Message = {
            id: Date.now().toString(),
            text: data.message,
            fromAgent: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, msg]);
          if (!open || minimized) setUnread((u) => u + 1);
        }
      };

      ws.onclose = () => setConnected(false);
    } catch (err) {
      console.error('Chat session failed:', err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
    if (!sessionKey) startSession();
  };

  const handleClose = () => {
    wsRef.current?.close();
    setOpen(false);
    setSessionKey(null);
    setConnected(false);
    setMessages([]);
  };

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      fromAgent: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    wsRef.current.send(JSON.stringify({ type: 'message', message: input.trim() }));
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed', bottom: '155px', right: '26px', zIndex: 450,
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--color-primary)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: 'var(--shadow-lg)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          title="Chat with us"
        >
          <MessageCircle size={24} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: 'var(--color-error)', color: '#fff',
              borderRadius: '50%', width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700,
            }}>
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '155px', right: '26px', zIndex: 450,
          width: 340, borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
          border: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn 0.25s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--color-primary)', color: '#fff',
            padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageCircle size={18} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Live Support</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {connected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setMinimized((v) => !v)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, background: 'var(--color-bg)',
                padding: '1rem', overflowY: 'auto',
                maxHeight: 320, display: 'flex', flexDirection: 'column', gap: '0.75rem',
              }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.fromAgent ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: msg.fromAgent ? '0 12px 12px 12px' : '12px 0 12px 12px',
                      background: msg.fromAgent ? 'var(--color-surface-2)' : 'var(--color-primary)',
                      color: msg.fromAgent ? 'var(--color-text)' : '#fff',
                      fontSize: '0.875rem', lineHeight: 1.5,
                    }}>
                      <p>{msg.text}</p>
                      <p style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem', textAlign: 'right' }}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                background: 'var(--color-bg)',
                borderTop: '1px solid var(--color-border)',
                padding: '0.75rem 1rem',
                display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
              }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '0.5rem 0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)', fontSize: '0.875rem', outline: 'none',
                    resize: 'none',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || !connected}
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--color-primary)', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', flexShrink: 0,
                    opacity: !input.trim() || !connected ? 0.5 : 1,
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
