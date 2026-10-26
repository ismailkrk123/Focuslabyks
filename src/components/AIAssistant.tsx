import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  BrainCircuit
} from 'lucide-react';

interface AIAssistantProps {
  onSuggestTask?: (title: string, durationMinutes: number) => void;
  onOpenFocusAI?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggestedTask?: { title: string; duration: number };
}

const QUICK_QUESTIONS = [
  'YKS TYT için netlerimi nasıl artırabilirim?',
  'Ders çalışırken dikkatim dağılıyor, ne yapmalıyım?',
  'Günde kaç pomodoro yapmak idealdir?',
  'Bugün için bana 3 odak görevi önerir misin?'
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ onSuggestTask, onOpenFocusAI }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Merhaba! Ben FocusLab akıllı rehberin. Çalışma stratejini planlamak, netlerini artırmak veya hedeflerini netleştirmek için buradayım. Dilediğin soruyu sorabilirsin.'
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Inactivity auto-fade
  const [isUserActive, setIsUserActive] = useState<boolean>(true);
  const inactivityTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      setIsUserActive(true);
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }
      inactivityTimeoutRef.current = window.setTimeout(() => {
        setIsUserActive(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query.trim()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let suggestedTask: { title: string; duration: number } | undefined;

      const lower = query.toLowerCase();
      if (lower.includes('tyt') || lower.includes('net') || lower.includes('yks')) {
        reply = 'TYT netlerini artırmanın altın kuralı: Süre baskısını yönetmek ve yanlış analizi yapmaktır. Her gün 1 adet 20 soruluk paragraf ve 10 soruluk problem rutini eklemen netlerini 2-3 haftada 8-10 net sıçratacaktır.';
        suggestedTask = { title: 'TYT: 20 Paragraf + 10 Problem Hız Egzersizi', duration: 35 };
      } else if (lower.includes('dikkat') || lower.includes('odak') || lower.includes('dağılıyor')) {
        reply = 'Zihnini dağıtan en büyük etken multitasking ve bildirimlerdir. Sanal Kütüphane moduna geçip "Brown Noise" veya "Yağmurlu Pencere" sesini aç. Masanda sadece çalıştığın konu kalsın. 25 dakikalık tek bir seansla başla.';
        suggestedTask = { title: '25 Dk Sıfır Bildirim Derin Odak', duration: 25 };
      } else if (lower.includes('pomodoro') || lower.includes('kaç') || lower.includes('süre')) {
        reply = 'Günde 6 ila 8 kaliteli Pomodoro seansı (yaklaşık 3-4 saat saf odak), verimli bir öğrenci için en yüksek verimlilik bandıdır. 8 seanstan sonra bilişsel yorgunluk başlar; bu yüzden molalarda ekrandan uzaklaşmak kritiktir.';
      } else if (lower.includes('görev') || lower.includes('öner')) {
        reply = 'Günün için dengeli bir akış hazırladım: 1) En zor dersin konu tekrarı, 2) Soru bankasından pekiştirme, 3) Akşam genel tekrarı.';
        suggestedTask = { title: 'Konu Özeti + 30 Soru Pekiştirme', duration: 50 };
      } else {
        reply = 'Harika bir hedef peşindesin. Marcus Aurelius’un dediği gibi: “Her eylemini, hayatının en önemli göreviymiş gibi derin bir odakla yap.” Şimdi küçük bir adımla başlayalım.';
        suggestedTask = { title: 'Hedefe Doğru 45 Dk Blok Çalışma', duration: 45 };
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: reply,
          suggestedTask
        }
      ]);
      setIsTyping(false);
    }, 550);
  };

  const isButtonVisible = isOpen || isUserActive;

  return (
    <>
      {/* Sol alt (Bottom-Left) Floating Minimal Round Button (Auto-fades on inactivity) */}
      <div 
        className={`fixed bottom-5 left-5 z-40 transition-all duration-300 ${
          isButtonVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <button
          onClick={() => {
            if (onOpenFocusAI) {
              onOpenFocusAI();
            } else {
              setIsOpen(true);
            }
          }}
          aria-label="FocusAI Asistan"
          className="w-11 h-11 rounded-full glass glass-nav flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all text-[var(--txt)] cursor-pointer"
          title="FocusAI Akıllı Rehber"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* AI Assistant Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
          <div className="panel w-full max-w-md p-5 shadow-2xl flex flex-col h-[500px] max-h-[85vh] relative rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-indigo-400 flex items-center justify-center">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--txt)] flex items-center gap-1.5">
                    <span>FocusAI Akıllı Rehber</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-mono">Çevrimiçi</span>
                  </h3>
                  <p className="text-[10px] text-[var(--muted)] font-light">Çalışma stratejisi, net artırma & motivasyon</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--txt)] p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
              {chatHistory.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--txt)]'
                    }`}
                  >
                    {msg.text}

                    {msg.suggestedTask && onSuggestTask && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
                        <span className="text-[10px] text-indigo-300 font-semibold truncate">
                          + {msg.suggestedTask.title} ({msg.suggestedTask.duration} dk)
                        </span>
                        <button
                          onClick={() => {
                            if (msg.suggestedTask) {
                              onSuggestTask(msg.suggestedTask.title, msg.suggestedTask.duration);
                              setIsOpen(false);
                            }
                          }}
                          className="btn-accent py-1 px-2.5 text-[10px] font-bold shrink-0"
                        >
                          Kutucuk Ekle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--muted)] w-20">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-200" />
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-[var(--border)]">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full text-[10px] bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--txt)] whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Bir soru sorun veya çalışma tavsiyesi isteyin..."
                className="flex-1 clean-input px-3.5 py-2 text-xs text-[var(--txt)]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="btn-accent p-2 rounded-full"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
