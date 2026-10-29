import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiAssistantService, type ChatMessage } from '../services/aiAssistantService';
import { AiOrbVisualization, type AiOrbState } from '../components/3d/AiOrbVisualization';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Bot,
  User,
  PhoneCall,
  ExternalLink,
  AlertCircle,
  Lightbulb,
  Compass,
  Radio,
  WifiOff
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Is it safe to travel after 9 PM in Delhi?',
  'How do I handle auto-rickshaw taxi overcharging?',
  'My passport was lost or stolen — what to do?',
  'Where are the nearest 24/7 trauma hospitals?',
  'What are the solo female safety guidelines?'
];

export const AiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text:
        'Namaste! I am your SURAKSHA Safety Companion. I provide real-time guidance on tourist safety corridors, local transport rules, scam prevention, and emergency protocols in India. How may I assist your journey today?',
      category: 'advisory',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [orbState, setOrbState] = useState<AiOrbState>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Monitor network connectivity for orb state
  useEffect(() => {
    const handleOnline = () => setOrbState('idle');
    const handleOffline = () => setOrbState('offline');

    if (!navigator.onLine) {
      setOrbState('offline');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setOrbState('thinking');

    try {
      const response = await AiAssistantService.queryAssistant(textToSend);
      setOrbState('responding');
      setMessages((prev) => [...prev, response]);

      // Return to idle / offline after a moment
      setTimeout(() => {
        setOrbState(navigator.onLine ? 'idle' : 'offline');
      }, 2500);
    } catch {
      setOrbState('unavailable');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to process query. For immediate emergency support, call 112 directly.',
          timestamp: new Date().toISOString()
        }
      ]);

      setTimeout(() => {
        setOrbState(navigator.onLine ? 'idle' : 'offline');
      }, 3000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: ChatMessage['suggestedAction']) => {
    if (!action) return;
    if (action.actionType === 'call') {
      window.location.href = `tel:${action.target}`;
    } else if (action.actionType === 'navigate') {
      navigate(action.target);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* 3D Reactive Orb & Assistant Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              Interactive Advisor
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Local Safety Logic
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            SURAKSHA AI Safety Companion
          </h1>

          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Verified travel advisory, scam prevention patterns, nighttime corridors, and direct emergency dispatches across India.
          </p>
        </div>

        {/* 3D Reactive Orb Visual Component */}
        <div className="shrink-0 flex items-center justify-center">
          <AiOrbVisualization state={orbState} size={130} />
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[65vh] overflow-hidden backdrop-blur-md">
        {/* Chat message scroll area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                    isUser
                      ? 'bg-cyan-600 text-white'
                      : 'bg-purple-950/90 text-purple-300 border border-purple-800/50'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-md ${
                    isUser
                      ? 'bg-cyan-600 text-white font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Category Badge & Timestamp */}
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                      isUser ? 'border-cyan-500/40 text-cyan-100' : 'border-slate-800/80 text-slate-400 font-mono'
                    }`}
                  >
                    {msg.category && !isUser && (
                      <span className="capitalize font-semibold text-cyan-400">
                        Type: {msg.category}
                      </span>
                    )}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Interactive Action Pill */}
                  {msg.suggestedAction && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleActionClick(msg.suggestedAction)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition"
                      >
                        {msg.suggestedAction.actionType === 'call' ? (
                          <PhoneCall className="w-3.5 h-3.5" />
                        ) : (
                          <Compass className="w-3.5 h-3.5" />
                        )}
                        <span>{msg.suggestedAction.label}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Analyzing travel safety database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Prompts:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] whitespace-nowrap transition active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about night safety, taxi fares, scam prevention, or emergency steps..."
            disabled={isTyping}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!inputText.trim() || isTyping}
            icon={<Send className="w-4 h-4" />}
            className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl px-5"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
