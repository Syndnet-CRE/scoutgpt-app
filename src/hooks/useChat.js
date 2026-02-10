import { useState, useCallback } from 'react';
import { sendChatMessage } from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey — I'm Scout, your CRE research assistant. I can search properties, analyze market data, and find opportunities across Travis County. What are you looking for?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [highlightedProperties, setHighlightedProperties] = useState([]);

  const send = useCallback(async (text, mapContext = {}) => {
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendChatMessage(text, mapContext);

      const assistantMsg = {
        role: 'assistant',
        content: response.text,
        properties: response.properties || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.properties && response.properties.length > 0) {
        setHighlightedProperties(response.properties);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Something went wrong with that search. Could you try rephrasing?",
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightedProperties([]);
  }, []);

  return { messages, loading, send, highlightedProperties, clearHighlights };
}
