import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type AIMode = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ykai';
  timestamp: Date;
};

type Settings = {
  theme: 'dark' | 'light';
  personality: string;
  soundEffects: boolean;
  animations: boolean;
  geminiApiKey: string;
};

type AppState = {
  activeMode: AIMode;
  setActiveMode: (mode: AIMode) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateLastMessage: (text: string) => void;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
};

const DEFAULT_MODE: AIMode = {
  id: 'general',
  name: 'General AI',
  description: 'All-purpose neural assistant',
  icon: 'Brain'
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  personality: 'Professional',
  soundEffects: true,
  animations: true,
  geminiApiKey: '',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('ykai-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeMode, setActiveMode] = useState<AIMode>(DEFAULT_MODE);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Neural systems online. How can I assist you today?',
      sender: 'ykai',
      timestamp: new Date()
    }
  ]);
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const updateLastMessage = (text: string) => {
    setMessages(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], text };
      }
      return updated;
    });
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem('ykai-settings', JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  };

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (!settings.animations) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  }, [settings.theme, settings.animations]);

  return (
    <AppContext.Provider value={{
      activeMode,
      setActiveMode,
      messages,
      addMessage,
      updateLastMessage,
      settings,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
