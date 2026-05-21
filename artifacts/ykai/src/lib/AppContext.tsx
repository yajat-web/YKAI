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

type AppState = {
  activeMode: AIMode;
  setActiveMode: (mode: AIMode) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  settings: {
    theme: 'dark' | 'light';
    personality: string;
    soundEffects: boolean;
    animations: boolean;
  };
  updateSettings: (settings: Partial<AppState['settings']>) => void;
};

const DEFAULT_MODE: AIMode = {
  id: 'general',
  name: 'General AI',
  description: 'All-purpose neural assistant',
  icon: 'Brain'
};

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
  const [settings, setSettings] = useState({
    theme: 'dark' as const,
    personality: 'Professional',
    soundEffects: true,
    animations: true
  });

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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
