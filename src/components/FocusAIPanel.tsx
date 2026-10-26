import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Plus, 
  PanelLeftClose, 
  PanelLeft, 
  Clock, 
  Target, 
  Award, 
  TrendingUp,
  X,
  Sparkles,
  Bot
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { UserProfile, TaskCard, DenemeRecord } from '../types';

interface FocusAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  tasks: TaskCard[];
  denemeler: DenemeRecord[];
  onAddTask?: (title: string, duration: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export const FocusAIPanel: React.FC<FocusAIPanelProps> = ({
  isOpen,
  onClose,
  userProfile,
  tasks,
  denemeler,
  onAddTask
}) => {
  // AI Identity name
  const [aiName, setAiName] = useState<string>(() => {
    return localStorage.getItem('focus_ai_name') || 'Focus AI';
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempAiName, setTempAiName] = useState<string>(aiName);

  // Sound / TTS setting
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('focus_ai_tts') !== 'false';
  });

  // Sessions and Active Chat
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('focus_ai_sessions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'session-default',
        title: 'Genel Rehberlik & Strateji',
        createdAt: Date.now(),
        messages: [
          {
            id: 'm-init',
            sender: 'ai',
            text: `Merhaba ${userProfile.name}! Ben ${localStorage.getItem('focus_ai_name') || 'Focus AI'}. Çalışma verimini artırmak, netlerini yükseltmek veya stratejini planlamak için buradayım. Bana sesli ya da yazılı olarak dilediğin soruyu sorabilirsin.`,
            timestamp: Date.now()
          }
        ]
      }
    ];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem('focus_ai_active_session') || 'session-default';
  });

  // UI Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Input & Status State
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // References
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Get active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Save sessions on change
  useEffect(() => {
    try {
      localStorage.setItem('focus_ai_sessions', JSON.stringify(sessions));
      localStorage.setItem('focus_ai_active_session', activeSessionId);
    } catch {
      // ignore
    }
  }, [sessions, activeSessionId]);

  // Save AI name
  const handleSaveAiName = () => {
    const trimmed = tempAiName.trim() || 'Focus AI';
    setAiName(trimmed);
    localStorage.setItem('focus_ai_name', trimmed);
    setIsEditingName(false);
  };

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isThinking]);

  // Clean audio/speech on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopVoiceInput();
      window.speechSynthesis?.cancel();
    }
  }, [isOpen]);

  // Calculate stats for summary card
  const totalMinutes = userProfile.totalFocusMinutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const focusTimeDisplay = hours > 0 ? `${hours} sa ${mins} dk` : `${mins} dk`;

  const activeTask = tasks.find(t => !t.completed) || tasks[0];
  const lastTaskTitle = activeTask ? activeTask.title : 'Henüz aktif görev yok';

  const tytList = denemeler.filter(d => d.type === 'TYT');
  const avgTyt = tytList.length > 0 
    ? (tytList.reduce((acc, c) => acc + c.totalNet, 0) / tytList.length).toFixed(1)
    : '85.5';

  const aytList = denemeler.filter(d => d.type === 'AYT');
  const avgAyt = aytList.length > 0 
    ? (aytList.reduce((acc, c) => acc + c.totalNet, 0) / aytList.length).toFixed(1)
    : '62.0';

  // Voice output via Web Speech Synthesis
  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      // Simulate speech pulse
      const pulseInterval = window.setInterval(() => {
        setAudioLevel(0.4 + Math.random() * 0.55);
      }, 100);
      (utterance as any)._pulseInterval = pulseInterval;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setAudioLevel(0);
      if ((utterance as any)._pulseInterval) {
        clearInterval((utterance as any)._pulseInterval);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setAudioLevel(0);
      if ((utterance as any)._pulseInterval) {
        clearInterval((utterance as any)._pulseInterval);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Setup Web Speech Recognition + Mic Analyser
  const startVoiceInput = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen metin ile yazın.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128);
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        stopVoiceInput();
      };

      recognition.onend = () => {
        stopVoiceInput();
      };

      recognition.start();
    } catch {
      stopVoiceInput();
    }
  };

  const stopVoiceInput = () => {
    setIsListening(false);
    setAudioLevel(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
  };

  // Toggle voice listening
  const toggleListening = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  // Local fallback response generator if offline or Gemini API key not present
  const generateContextualResponse = (prompt: string): string => {
    const q = prompt.toLowerCase();
    const name = userProfile.name;

    if (q.includes('hava') || q.includes('durum')) {
      return `Sevgili ${name}, bugün dışarıdaki hava ne olursa olsun, odandaki ve zihnindeki çalışma iklimi senin elinde! Masanı toparla, havalandır ve odaklanmak için ideal sıcaklığı sağla.`;
    }
    if (q.includes('net') || q.includes('tyt') || q.includes('ayt') || q.includes('deneme')) {
      return `${name}, mevcut TYT ortalaman ${avgTyt} ve AYT ortalaman ${avgAyt} seviyesinde. Hedefin olan ${userProfile.targetDepartment || userProfile.targetGoal || 'üniversite'} için en kritik sıçrama: haftalık 1 genel + 2 branş denemesi çözüp, yapamadığın soruları "Kes-Yapıştır Hata Defteri"ne kaydetmektir.`;
    }
    if (q.includes('odak') || q.includes('dikkat') || q.includes('dağılıyor') || q.includes('sıkıldım')) {
      return `Bunu hissetmen çok insani ${name}. Şu anda toplam ${focusTimeDisplay} çalışma süresine ulaşmış durumdasın. Şimdi derin bir nefes al, 5 dakikalık bir su/hareket molası ver ve ardından Sanal Kütüphane modunda tek bir 25 dakikalık Pomodoro başlat.`;
    }
    if (q.includes('görev') || q.includes('plan') || q.includes('ne yapmalıyım')) {
      return `Şu anki aktif odağın: "${lastTaskTitle}". Tavsiyem bu görevi tamamlayıp ardından günün zorlayıcı bir konusuna 40 dakikalık derin blok etüt açman. İstersen hemen bir görev ekleyebilirsin!`;
    }
    if (q.includes('merhaba') || q.includes('selam') || q.includes('nasılsın')) {
      return `Harika bir gün ${name}! Ben ${aiName}. Senin hedeflerine giden yolda en disiplinli çalışma partnerinim. Bugün neyi hallediyoruz?`;
    }

    return `${name}, ${userProfile.targetExamRank || 'hedefin'} için her gün attığın her küçük adım birikiyor. Konuları böl, süre tut ve dikkat dağıtıcıları kapat. Marcus Aurelius'un dediği gibi: "Engel yolun kendisidir." Sana nasıl yardımcı olabilirim?`;
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now()
    };

    // Update active session with user message
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: s.messages.length <= 1 ? (query.slice(0, 26) + '...') : s.title,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    }));

    setInputText('');
    setIsThinking(true);

    let reply = '';
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `Sen ${aiName} adında, Türk öğrenciye birebir rehberlik eden, sıcak, ilham verici, disiplinli bir YKS ve odaklanma koçusun.
Öğrencinin adı: ${userProfile.name}.
Hedefi: ${userProfile.targetDepartment || userProfile.targetGoal || 'Tıp/Mühendislik/Hukuk'} (Hedef sıralama: ${userProfile.targetExamRank || 'İlk 5000'}).
Toplam çalışma süresi: ${focusTimeDisplay}.
Son çalıştığı görev: ${lastTaskTitle}.
Deneme netleri: TYT ortalaması ${avgTyt}, AYT ortalaması ${avgAyt}.
Lütfen yanıtlarını Türkçe olarak, öğrenciye adıyla (${userProfile.name}) hitap ederek, öz, motive edici ve net maddelerle ver. Uzun ve sıkıcı metinlerden kaçın.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nÖğrencinin sorusu: ${query}` }] }
          ]
        });

        reply = response.text || generateContextualResponse(query);
      } catch {
        reply = generateContextualResponse(query);
      }
    } else {
      // Harmonic local intelligence fallback
      await new Promise(res => setTimeout(res, 500));
      reply = generateContextualResponse(query);
    }

    const aiMsg: ChatMessage = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: reply,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, aiMsg]
        };
      }
      return s;
    }));

    setIsThinking(false);
    speakText(reply);
  };

  // Create new chat session
  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Yeni Sohbet',
      createdAt: Date.now(),
      messages: [
        {
          id: 'm-' + Date.now(),
          sender: 'ai',
          text: `Yeni bir oturuma başladık ${userProfile.name}. Nasıl yardımcı olabilirim?`,
          timestamp: Date.now()
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  // Delete chat session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // Don't leave zero sessions, just reset
      const resetSession: ChatSession = {
        id: 'session-default',
        title: 'Genel Rehberlik & Strateji',
        createdAt: Date.now(),
        messages: [
          {
            id: 'm-init',
            sender: 'ai',
            text: `Merhaba ${userProfile.name}! Ben ${aiName}. Sıfırdan yeni bir seans başlattık. Ne üzerine konuşalım?`,
            timestamp: Date.now()
          }
        ]
      };
      setSessions([resetSession]);
      setActiveSessionId('session-default');
      return;
    }

    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  if (!isOpen) return null;

  // Compute aura size & glow based on audioLevel / listening / speaking
  const auraScale = isListening || isSpeaking 
    ? 1 + audioLevel * 0.45 
    : isThinking 
      ? 1.15 
      : 1;

  const auraOpacity = isListening || isSpeaking ? 0.95 : 0.65;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0e14] text-white select-none overflow-hidden animate-fadeIn font-sans">
      {/* Background Soft Fluid Lighting Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="dark-fluid-blob-1 absolute w-[60vmax] h-[60vmax] -top-[15%] -left-[10%] rounded-full blur-[140px] opacity-25"
          style={{ backgroundColor: 'rgba(99, 102, 241, 0.4)' }}
        />
        <div 
          className="dark-fluid-blob-3 absolute w-[55vmax] h-[55vmax] -bottom-[15%] -right-[10%] rounded-full blur-[140px] opacity-25"
          style={{ backgroundColor: 'rgba(236, 72, 153, 0.35)' }}
        />
        <div 
          className="dark-fluid-blob-5 absolute w-[40vmax] h-[40vmax] top-[30%] right-[15%] rounded-full blur-[130px] opacity-20"
          style={{ backgroundColor: 'rgba(6, 182, 212, 0.3)' }}
        />
      </div>

      {/* ---------------- TOP BAR ---------------- */}
      <div className="relative z-30 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/10 backdrop-blur-xl bg-black/40">
        {/* Left: Back button & Pencere (Drawer toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full glass hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
            title="Ana Ekrana Dön"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Geri</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className={`p-2 rounded-full glass transition-colors flex items-center gap-1.5 text-xs cursor-pointer ${
              isSidebarOpen ? 'bg-indigo-500/25 border-indigo-400/40 text-white' : 'text-slate-300 hover:text-white'
            }`}
            title="Geçmiş Sohbetler Penceresi"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 text-indigo-400" /> : <PanelLeft className="w-4 h-4" />}
            <span className="hidden sm:inline font-medium">Pencere</span>
          </button>
        </div>

        {/* Center: AI Name Wordmark & Status */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white drop-shadow-sm">
              {aiName}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-light">
            {isListening ? 'Sizi dinliyor...' : isSpeaking ? 'Konuşuyor...' : isThinking ? 'Düşünüyor...' : 'Çevrimiçi & Hazır'}
          </span>
        </div>

        {/* Right: Sound toggle & Settings button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !ttsEnabled;
              setTtsEnabled(next);
              localStorage.setItem('focus_ai_tts', String(next));
              if (!next) window.speechSynthesis?.cancel();
            }}
            className={`p-2 rounded-full glass transition-colors cursor-pointer ${
              ttsEnabled ? 'text-indigo-400' : 'text-slate-500'
            }`}
            title={ttsEnabled ? 'Sesli Yanıt Açık' : 'Sesli Yanıt Kapalı'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setTempAiName(aiName);
              setIsEditingName(true);
            }}
            className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-slate-300 hover:text-white cursor-pointer"
            title="Yapay Zeka Ayarları"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---------------- MAIN CONTAINER ---------------- */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* SIDEBAR: Past Chat Sessions Drawer */}
        <div 
          className={`absolute sm:relative z-20 inset-y-0 left-0 w-72 bg-slate-950/90 sm:bg-black/30 border-r border-white/10 backdrop-blur-2xl transform transition-transform duration-300 flex flex-col ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:-translate-x-72 sm:w-0 sm:border-none overflow-hidden'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">Geçmiş Sohbetler</span>
            <button
              onClick={handleCreateNewSession}
              className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Yeni Sohbet Başlat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni</span>
            </button>
          </div>

          {/* Drawer Session List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  if (window.innerWidth < 640) setIsSidebarOpen(false);
                }}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left text-xs transition-colors cursor-pointer group ${
                  s.id === activeSessionId
                    ? 'bg-indigo-600/30 border border-indigo-500/40 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate text-xs">{s.title}</p>
                  <p className="text-[10px] text-slate-500 font-light">
                    {new Date(s.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-rose-500/20 text-rose-400 transition-opacity cursor-pointer"
                  title="Sohbeti Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER CONTENT: Halo, Aura, Live Summary & Chat Stream */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Top Half: Halo + Siri Aura + Live Summary Card */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-start space-y-4">
            {/* LUMINOUS WHITE HALO & MULTI-COLOR APPLE SIRI AURA */}
            <div className="relative py-4 sm:py-6 flex items-center justify-center">
              {/* Spinning Colorful Siri Aura Ring */}
              <div 
                className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full pointer-events-none transition-all duration-300 animate-spin"
                style={{
                  animationDuration: isListening || isSpeaking ? '2.5s' : '9s',
                  transform: `scale(${auraScale * 1.15})`,
                  opacity: auraOpacity,
                  background: 'conic-gradient(from 0deg, #38bdf8, #818cf8, #c084fc, #f472b6, #fb923c, #38bdf8)',
                  filter: 'blur(24px)'
                }}
              />

              {/* Second Harmonic Inner Aura */}
              <div 
                className="absolute w-32 h-32 sm:w-38 sm:h-38 rounded-full pointer-events-none transition-all duration-300"
                style={{
                  transform: `scale(${auraScale})`,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(99,102,241,0.5) 45%, transparent 75%)',
                  filter: 'blur(16px)'
                }}
              />

              {/* Luminous Pure White Circular Halo (App Wordmark Halo) */}
              <div 
                onClick={toggleListening}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3.5px] border-white flex items-center justify-center cursor-pointer transition-transform duration-300 shadow-[0_0_35px_rgba(255,255,255,0.95),inset_0_0_20px_rgba(255,255,255,0.6)]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  transform: `scale(${auraScale})`
                }}
                title={isListening ? 'Dinlemeyi durdur' : 'Konuşmak için dokunun'}
              >
                {/* Center Core Sparkle & Mic feedback */}
                <div className="w-12 h-12 rounded-full bg-white/20 blur-[6px] flex items-center justify-center" />
                {isListening ? (
                  <Mic className="absolute w-7 h-7 text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)] animate-pulse" />
                ) : isSpeaking ? (
                  <Volume2 className="absolute w-7 h-7 text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)] animate-bounce" />
                ) : (
                  <Sparkles className="absolute w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                )}
              </div>
            </div>

            {/* HALO SUBTITLE / TAP HINT */}
            <div className="text-center space-y-0.5">
              <p className="text-xs font-semibold text-slate-300">
                {isListening ? 'Konuşmanız dinleniyor...' : isSpeaking ? 'Yanıt seslendiriliyor...' : 'Sesli konuşmak için haleye veya mikrofona dokunun'}
              </p>
            </div>

            {/* REAL LIVE SUMMARY STATS CARD (Live student metrics below halo) */}
            <div className="w-full max-w-xl p-3 sm:p-4 rounded-2xl liquid-glass-modal border border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              {/* 1. Toplam Odak */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>Toplam Odak</span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-white mt-1">
                  {focusTimeDisplay}
                </span>
              </div>

              {/* 2. Son Görev */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Target className="w-3 h-3 text-pink-400" />
                  <span>Aktif Görev</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-1 truncate" title={lastTaskTitle}>
                  {lastTaskTitle}
                </span>
              </div>

              {/* 3. Hedef Sıralama */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>Hedef</span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-amber-300 mt-1 truncate" title={userProfile.targetExamRank || 'İlk 5.000'}>
                  {userProfile.targetExamRank || 'İlk 5.000'}
                </span>
              </div>

              {/* 4. Deneme Netleri */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Deneme Ort.</span>
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-300 mt-1 truncate">
                  T:{avgTyt} / A:{avgAyt}
                </span>
              </div>
            </div>

            {/* CHAT MESSAGES STREAM */}
            <div className="w-full max-w-xl space-y-3 pt-2">
              {activeSession?.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-md'
                        : 'bg-white/10 border border-white/15 text-slate-100 rounded-tl-none backdrop-blur-xl shadow-lg'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span className="mt-1 block text-[9px] text-right opacity-60">
                      {new Date(m.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-slate-300 w-32 animate-pulse">
                  <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>Düşünüyor...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ---------------- BOTTOM AREA: Spacious Rounded Input Box ---------------- */}
          <div className="relative z-20 w-full p-4 sm:p-5 border-t border-white/10 bg-black/50 backdrop-blur-2xl flex flex-col items-center">
            {/* Quick Suggestion Pills */}
            <div className="w-full max-w-2xl mb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                'Günün çalışma planını yap',
                'TYT netlerimi nasıl artırırım?',
                'Dikkatim dağılıyor ne yapmalıyım?',
                'Hava ve çalışma motivasyonu'
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1.5 rounded-full text-[11px] bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Spacious Rounded Rectangular Box with Softened Corners */}
            <div className="w-full max-w-2xl min-h-[58px] p-2 rounded-2xl sm:rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center gap-2 shadow-2xl focus-within:border-indigo-400 transition-colors">
              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_#f43f5e]'
                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                }`}
                title={isListening ? 'Dinlemeyi durdur' : 'Sesle konuş'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`${aiName}'a bir şey sorun, planlama isteyin veya sesle konuşun...`}
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-400 px-2 py-1.5"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`p-3 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  inputText.trim() 
                    ? 'btn-accent text-white shadow-lg' 
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
                title="Gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SETTINGS MODAL: AI Name Customization ---------------- */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="liquid-glass-modal w-full max-w-sm p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-bold text-white">Yapay Zeka Ayarları</h4>
              <button 
                onClick={() => setIsEditingName(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs text-slate-300 font-medium">Asistan Adı</label>
              <input
                type="text"
                value={tempAiName}
                onChange={(e) => setTempAiName(e.target.value)}
                placeholder="Örn: Focus AI, Atlas, Arya..."
                className="w-full clean-input px-3.5 py-2.5 text-xs text-white"
              />
              <p className="text-[10px] text-slate-400">
                Bu isim asistanın başlığında ve selamlama hitaplarında kullanılacaktır.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="px-4 py-2 rounded-full border border-white/15 text-xs text-slate-300 hover:text-white"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveAiName}
                className="btn-accent px-5 py-2 text-xs font-bold"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
