import { useState } from 'react';
import { useAppContext } from '@/lib/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, ShieldAlert, Eye, EyeOff, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { settings, updateSettings } = useAppContext();
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(settings.geminiApiKey);

  const handleSave = () => {
    updateSettings({ geminiApiKey: localApiKey });
    toast({
      title: "System Parameters Updated",
      description: "Neural configurations have been saved successfully.",
      className: "bg-background border-primary/50 text-foreground neon-border font-mono",
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-wider mb-2">System Configuration</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Adjust core operational parameters</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-secondary/50">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground uppercase tracking-widest text-sm">Security Level: Alpha</h2>
        </div>

        <div className="p-6 space-y-8">

          {/* Gemini API Key */}
          <div className="flex flex-col gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              <h3 className="font-display font-medium text-foreground tracking-wide">Gemini API Key</h3>
            </div>
            <p className="text-sm font-mono text-muted-foreground -mt-2">
              Enter your Google Gemini API key to enable real AI responses.{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
                data-testid="link-gemini-api"
              >
                Get a key at Google AI Studio
              </a>
            </p>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="AIza..."
                className="bg-background/50 border-white/10 text-foreground font-mono text-sm pr-12 focus-visible:ring-primary focus-visible:border-primary neon-border-focus"
                data-testid="input-gemini-api-key"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-toggle-key-visibility"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {localApiKey && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest">API Key Configured</span>
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <h3 className="font-display font-medium text-foreground tracking-wide mb-1">Visual Interface</h3>
              <p className="text-sm font-mono text-muted-foreground">Toggle core aesthetics</p>
            </div>
            <Select
              value={settings.theme}
              onValueChange={(val: 'dark' | 'light') => updateSettings({ theme: val })}
            >
              <SelectTrigger className="w-[180px] bg-background border-white/10 font-mono text-sm uppercase" data-testid="select-theme">
                <SelectValue placeholder="Select Theme" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10 font-mono text-sm uppercase">
                <SelectItem value="dark">Cyberpunk (Dark)</SelectItem>
                <SelectItem value="light">Daylight (Light)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Personality */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <h3 className="font-display font-medium text-foreground tracking-wide mb-1">Response Personality</h3>
              <p className="text-sm font-mono text-muted-foreground">Define dialogue tone</p>
            </div>
            <Select
              value={settings.personality}
              onValueChange={(val) => updateSettings({ personality: val })}
            >
              <SelectTrigger className="w-[180px] bg-background border-white/10 font-mono text-sm uppercase" data-testid="select-personality">
                <SelectValue placeholder="Select Personality" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10 font-mono text-sm uppercase">
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animations Toggle */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div>
              <h3 className="font-display font-medium text-foreground tracking-wide mb-1">Kinetic Effects</h3>
              <p className="text-sm font-mono text-muted-foreground">Enable interface animations</p>
            </div>
            <Switch
              checked={settings.animations}
              onCheckedChange={(val) => updateSettings({ animations: val })}
              className="data-[state=checked]:bg-primary"
              data-testid="switch-animations"
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-foreground tracking-wide mb-1">Auditory Feedback</h3>
              <p className="text-sm font-mono text-muted-foreground">System sound effects</p>
            </div>
            <Switch
              checked={settings.soundEffects}
              onCheckedChange={(val) => updateSettings({ soundEffects: val })}
              className="data-[state=checked]:bg-primary"
              data-testid="switch-sound"
            />
          </div>

        </div>

        <div className="p-6 bg-secondary/30 border-t border-white/5 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-primary/20 text-primary border border-primary hover:bg-primary/40 neon-border font-display uppercase tracking-widest gap-2"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4" />
            Commit Changes
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
