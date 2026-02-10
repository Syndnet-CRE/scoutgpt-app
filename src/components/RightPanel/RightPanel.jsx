import React from 'react';
import { MessageSquare } from 'lucide-react';
import ChatPanel from './ChatPanel';

export default function RightPanel({ messages, loading, onSend }) {
  return (
    <div className="w-96 h-full bg-scout-panel border-l border-scout-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-scout-border flex items-center gap-2.5">
        <div className="w-7 h-7 bg-gradient-to-br from-scout-accent to-purple-500 rounded-lg flex items-center justify-center">
          <MessageSquare size={14} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Scout AI</h2>
          <p className="text-xs text-scout-text-dim">Natural language search</p>
        </div>
      </div>

      {/* Chat */}
      <ChatPanel messages={messages} loading={loading} onSend={onSend} />
    </div>
  );
}
