import { useAppContext } from '@/lib/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { settings, updateSettings } = useAppContext();
  const { toast } = useToast();

  const handleSave = () => {
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
          
          {/* Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <h3 className="font-display font-medium text-foreground tracking-wide mb-1">Visual Interface</h3>
              <p className="text-sm font-mono text-muted-foreground">Toggle core aesthetics</p>
            </div>
            <Select 
              value={settings.theme} 
              onValueChange={(val: 'dark'|'light') => updateSettings({ theme: val })}
            >
              <SelectTrigger className="w-[180px] bg-background border-white/10 font-mono text-sm uppercase">
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
              <SelectTrigger className="w-[180px] bg-background border-white/10 font-mono text-sm uppercase">
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
