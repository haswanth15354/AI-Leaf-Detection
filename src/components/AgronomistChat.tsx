import React, { useState, useRef, useEffect } from 'react';
import { DiagnosisResult } from '../types/disease';
import { Send, X, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface AgronomistChatProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis?: DiagnosisResult | null;
}

const QUICK_PROMPTS = [
  'Can I safely eat fruit or vegetables from this plant?',
  'Is this treatment safe around pets and beneficial bees?',
  'How do I sanitize my pruning shears to stop spread?',
  'What companion plants help deter this disease naturally?',
  'How long will it take for healthy new foliage to emerge?',
];

export const AgronomistChat: React.FC<AgronomistChatProps> = ({ isOpen, onClose, diagnosis }) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const plantGreeting = diagnosis
        ? language === 'te'
          ? `నమస్కారం! నేను డా. ఫ్లోరా, మీ వ్యవసాయ నిపుణురాలిని. మీ ${diagnosis.plant.commonName} మొక్కలో ${diagnosis.primaryDiagnosis.name} (${t(diagnosis.primaryDiagnosis.severity)} తీవ్రత) గుర్తించాను. చికిత్స, భద్రత లేదా మొక్క కోలుకోవడం గురించి ఏమైనా ప్రశ్నలున్నాయా?`
          : `Hello! I'm Dr. Flora, your Master Agronomist. I've analyzed your **${diagnosis.plant.commonName}** diagnosed with **${diagnosis.primaryDiagnosis.name}** (${diagnosis.primaryDiagnosis.severity} severity). What questions do you have about treatment, safety, or garden recovery?`
        : language === 'te'
          ? 'నమస్కారం! నేను డా. ఫ్లోరా, మీ వ్యవసాయ నిపుణురాలిని. మీ పంటలు, ఆకుల వ్యాధులు లేదా తోట ఆరోగ్యం గురించి ఎలా సహాయపడగలను?'
          : `Hello! I'm Dr. Flora, your Master Agronomist and Plant Pathologist. How can I assist with your crops, foliage diseases, or garden health today?`;

      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: plantGreeting,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [isOpen, diagnosis, language, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          diagnosisSummary: diagnosis
            ? {
                plant: diagnosis.plant,
                diagnosis: diagnosis.primaryDiagnosis,
                symptoms: diagnosis.symptoms,
                treatment: diagnosis.treatmentPlan,
              }
            : null,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get answer from Dr. Flora');
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.answer || "I apologize, I couldn't formulate a diagnosis response right now. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Sorry, I encountered a temporary connection issue. Please check your network or try asking again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Dr. Flora AI</h3>
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('Master Agronomist')}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {diagnosis ? `${t('Consulting for')} ${diagnosis.plant.commonName}` : t('Agricultural pathology guidance')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-950/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{t('Dr. Flora is formulating agronomy advice...')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-900/60 overflow-x-auto flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-zinc-400 shrink-0">{t('Quick Questions:')}</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs whitespace-nowrap transition border border-zinc-700/60 shrink-0"
              >
                {t(prompt)}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Ask Dr. Flora about treatment, soil, safety...')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
