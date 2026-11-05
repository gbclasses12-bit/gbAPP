import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit,
  Send,
  User,
  Copy,
  Check,
  Volume2,
  Trash2,
  Zap,
  Atom,
  Dna,
  Calculator,
  Compass,
} from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const GBAI: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-ai',
      role: 'assistant',
      text: 'Namaste! Main hoon **GB AI Ultra**, Sarvottam Yadav dwara taiyaar kiya gaya hybrid AI Study Tutor (Powered by **ChatGPT Reasoning + Gemini 3.8 Flash + Cloud Deep Knowledge**). 🚀\n\nAap mujhse **NEET**, **JEE Main & Advanced**, **Physics**, **Chemistry**, **Biology**, ya **Maths** ka koi bhi doubt, formula derivation, numerical, shortcut tricks ya memory mnemonics poochh sakte hain!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    const customApiKey = localStorage.getItem('gb_gemini_api_key') || undefined;

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          customApiKey,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned ' + res.status);
      }

      const data = await res.json();
      const aiMsg: AIMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        text: data.text || 'Koi uttar prapt nahi hua. Kripya punah prayas karein.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('GB AI Error:', err);
      const fallbackMsg: AIMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        text: `**GB AI Solution for:** "${query}"\n\n1. Pehle fundamental definitions aur standard formula recall karein.\n2. Step-by-step units aur signs (+/-) verify karein.\n3. Is concept ke 5 practice MCQs solve karein.\n\n*Aap aur details puchh sakte hain!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown asterisks for clean speech
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'ai-cleared',
        role: 'assistant',
        text: 'Chat history cleared. Poochhiye apna naya sawal ya doubt! 🚀',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPills = [
    { label: 'Physics Doubt', prompt: 'Explain Lenz Law with real-life examples and formula', icon: Zap },
    { label: 'Chemistry SN1 vs SN2', prompt: 'Difference between SN1 and SN2 reaction with mechanism', icon: Atom },
    { label: 'Krebs Cycle', prompt: 'Explain Krebs Cycle (Citric Acid Cycle) key steps for NEET', icon: Dna },
    { label: 'Integration Trick', prompt: 'How to integrate by parts easily with ILATE rule?', icon: Calculator },
    { label: 'NEET Strategy', prompt: 'Daily timetable and revision strategy for NEET 2027 top score', icon: Compass },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a11] text-white relative overflow-hidden select-text">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-[#0f1422] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-black text-white leading-tight">
                GB AI Ultra
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 border border-sky-400/30 text-sky-300 text-[9px] font-bold">
                ChatGPT • Gemini • Cloud
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Sarvottam Yadav • NEET & JEE Multi-Engine Tutor
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Pills Bar */}
      <div className="px-3 py-2 bg-[#0c111d] border-b border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {quickPills.map((pill, i) => {
          const Icon = pill.icon;
          return (
            <button
              key={i}
              onClick={() => handleSend(pill.prompt)}
              className="px-3 py-1.5 rounded-full bg-[#162035] hover:bg-sky-500/20 border border-slate-700 hover:border-sky-400/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Icon className="w-3.5 h-3.5 text-sky-400" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <BrainCircuit className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-[20px] p-3.5 shadow-md relative group ${
                  isUser
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-xs'
                    : 'bg-[#121929] border border-slate-800 text-slate-100 rounded-tl-xs'
                }`}
              >
                <div className="text-xs font-bold mb-1 flex items-center justify-between gap-2">
                  <span className={isUser ? 'text-sky-200' : 'text-sky-400'}>
                    {isUser ? 'You' : 'GB AI Tutor'}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
                  {msg.text}
                </div>

                {/* Assistant message action buttons */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800 text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="p-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Copy Answer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="p-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Listen</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <BrainCircuit className="w-4 h-4 animate-pulse" />
            </div>
            <div className="rounded-[18px] bg-[#121929] border border-slate-800 px-4 py-3 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-2 font-medium">
                GB AI is solving your doubt...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with clear spacing above floating navbar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-[#0e1422] border-t border-slate-800/90 flex items-center gap-2 shrink-0 mb-20 relative z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask physics, chemistry, biology, or maths doubt..."
          className="flex-1 px-4 py-2.5 rounded-full bg-[#162035] border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400"
        />

        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 shadow-md cursor-pointer active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4 fill-current translate-x-0.5" />
        </button>
      </form>
    </div>
  );
};
