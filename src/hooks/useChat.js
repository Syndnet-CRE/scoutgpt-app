import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../services/api';

const GREETING = {
  role: 'assistant',
  content:
    "Hey — I'm Scout, your CRE research assistant. I have access to 444K+ properties across Travis County. Ask me anything about properties, ownership, transactions, or market trends.",
  timestamp: new Date(),
};

export function useChat() {
  const [messages, setMessages] = useState([GREETING]);
  const [loading, setLoading] = useState(false);
  const [highlightedProperties, setHighlightedProperties] = useState([]);
  const [chatMarkers, setChatMarkers] = useState([]);

  // Keep a ref to messages so the send callback always sees current state
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const send = useCallback(async (text) => {
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build API messages from conversation history
      // Skip the canned greeting (index 0), only send real exchanges
      const currentMsgs = [...messagesRef.current, userMsg];
      const apiMessages = [];

      for (let i = 1; i < currentMsgs.length; i++) {
        const m = currentMsgs[i];
        if ((m.role === 'user' || m.role === 'assistant') && !m.error) {
          apiMessages.push({ role: m.role, content: m.content });
        }
      }

      // Safety: ensure we have at least the current user message
      if (apiMessages.length === 0) {
        apiMessages.push({ role: 'user', content: text });
      }

      const response = await sendChatMessage(apiMessages);
      console.log('[CHAT] Response received:', { text: response.text?.substring(0, 80), propertiesCount: response.properties?.length, properties: response.properties?.slice(0, 5) });

      const assistantMsg = {
        role: 'assistant',
        content: response.text,
        properties: response.properties || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.properties && response.properties.length > 0) {
        const numericIds = response.properties.map(Number);
        console.log('[CHAT] Setting highlighted properties:', numericIds.length, 'first 5:', numericIds.slice(0, 5));
        setHighlightedProperties(numericIds);
      } else {
        console.log('[CHAT] No properties in response, clearing highlights');
        setHighlightedProperties([]);
      }

      if (response.propertyMarkers && response.propertyMarkers.length > 0) {
        setChatMarkers(response.propertyMarkers);
      } else {
        setChatMarkers([]);
      }
    } catch (err) {
      console.error('[CHAT] Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || "Something went wrong with that search. Could you try rephrasing?",
          error: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightedProperties([]);
    setChatMarkers([]);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([GREETING]);
    setHighlightedProperties([]);
    setChatMarkers([]);
  }, []);

  return { messages, loading, send, highlightedProperties, setHighlightedProperties, clearHighlights, chatMarkers, resetChat };
}
