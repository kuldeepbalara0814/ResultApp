import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function GeminiAssistantModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'नमस्ते! मैं आपका एआई असिस्टेंट हूँ। आप मुझसे सिस्टम से जुड़ी कोई भी जानकारी या मदद मांग सकते हैं।' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        const err = await response.json();
        setMessages(prev => [...prev, { role: 'model', text: `Error: ${err.error || 'Failed to get response'}` }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'सर्वर से कनेक्ट करने में त्रुटि हुई।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col h-[80vh] shadow-2xl">
        {/* Header */}
        <div className="bg-teal-500/10 border-b border-teal-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-400 p-1.5 rounded-lg">
              <Bot className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Gemini Assistant</h2>
              <p className="text-xs text-teal-400">Admin Support</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-teal-500 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-70">
                  {msg.role === 'model' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  <span className="text-[10px] uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'Gemini'}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-3 text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                <span className="text-sm">टाइप कर रहा है...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-slate-800 bg-[#0B1120]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="मैसेज टाइप करें..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-400/50 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-teal-500 hover:bg-teal-400 text-slate-900 p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
              }
