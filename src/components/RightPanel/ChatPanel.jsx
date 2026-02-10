import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User as UserIcon } from 'lucide-react';

export default function ChatPanel({ messages, loading, onSend }) {
  const [input, setInput] = useState('');
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    onSend(text);
  };

  const quickPrompts = [
    'Commercial properties in 78701',
    'Absentee-owned over 1 acre',
    'Recent sales over $1M',
    'High flood risk properties',
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''} animate-fade-in`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-scout-accent to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={13} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-scout-accent text-white rounded-br-sm'
                  : msg.error
                    ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                    : 'bg-white/5 text-scout-text border border-white/5 rounded-bl-sm'
              }`}
            >
              {msg.content.split('\n').map((line, j) => (
                <React.Fragment key={j}>
                  {line}
                  {j < msg.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
              {msg.properties && msg.properties.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-scout-text-dim">
                    {msg.properties.length} properties found — shown on map
                  </span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-scout-border flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon size={13} className="text-scout-text-dim" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-scout-accent to-purple-500 flex items-center justify-center shrink-0">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-scout-text-dim">
                <Loader2 size={14} className="animate-spin" />
                Searching properties...
              </div>
            </div>
          </div>
        )}

        {/* Quick prompts on first message */}
        {messages.length <= 1 && !loading && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-scout-text-dim">Try asking:</p>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSend(prompt)}
                className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-scout-text-dim hover:text-white hover:bg-white/10 hover:border-white/10 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-scout-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search properties..."
            disabled={loading}
            className="flex-1 bg-white/5 border border-scout-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-scout-text-dim focus:outline-none focus:border-scout-accent focus:ring-1 focus:ring-scout-accent/30 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3 py-2.5 bg-scout-accent rounded-lg text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
