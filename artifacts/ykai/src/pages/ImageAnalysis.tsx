import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Scan, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageAnalysis() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<null | any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        startScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setResult({
        objects: ['Biometric entity', 'Structural element', 'Light source'],
        confidence: '97.3%',
        classification: 'Unclassified terrain / Sector 7',
        time: '0.42s'
      });
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-wider mb-2">Visual Cortex</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Image pattern recognition matrix</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload & Preview Area */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col relative overflow-hidden min-h-[400px]">
          {!imagePreview ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg bg-black/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="font-display text-muted-foreground uppercase tracking-widest text-sm text-center px-4">
                Initialize visual input<br/>(Click to upload)
              </p>
            </div>
          ) : (
            <div className="flex-1 relative rounded-lg overflow-hidden flex items-center justify-center bg-black/40">
              <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain z-10" />
              
              {/* Scan Animation */}
              {isScanning && (
                <motion.div 
                  className="absolute inset-0 z-20 pointer-events-none"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="w-full h-1 bg-primary neon-border absolute"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay animate-pulse" />
                </motion.div>
              )}
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            data-testid="input-file-image"
          />

          {imagePreview && !isScanning && (
            <Button 
              variant="outline" 
              className="mt-4 border-white/10 text-muted-foreground hover:text-primary hover:border-primary/50 font-mono uppercase tracking-widest"
              onClick={() => fileInputRef.current?.click()}
            >
              Load New Image
            </Button>
          )}
        </div>

        {/* Results Area */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col relative">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <Scan className={`w-6 h-6 ${isScanning ? 'text-primary animate-pulse' : result ? 'text-primary' : 'text-muted-foreground'}`} />
            <h2 className="font-display font-semibold tracking-wide text-foreground">Analysis Matrix</h2>
          </div>

          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="font-mono text-primary text-sm uppercase tracking-widest animate-pulse">Running inference protocols...</p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col space-y-6"
              >
                <div className="flex items-center gap-2 text-primary neon-text">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-display uppercase tracking-widest text-sm">Scan Complete</span>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  <div className="bg-secondary p-3 rounded-lg border border-white/5">
                    <div className="text-muted-foreground uppercase text-[10px] mb-1">Confidence</div>
                    <div className="text-foreground text-lg">{result.confidence}</div>
                  </div>
                  
                  <div className="bg-secondary p-3 rounded-lg border border-white/5">
                    <div className="text-muted-foreground uppercase text-[10px] mb-2">Entities Detected</div>
                    <ul className="space-y-1">
                      {result.objects.map((obj: string, i: number) => (
                        <li key={i} className="text-foreground flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-primary before:rounded-full">
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary p-3 rounded-lg border border-white/5">
                      <div className="text-muted-foreground uppercase text-[10px] mb-1">Classification</div>
                      <div className="text-foreground text-xs leading-tight">{result.classification}</div>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg border border-white/5">
                      <div className="text-muted-foreground uppercase text-[10px] mb-1">Proc. Time</div>
                      <div className="text-foreground text-xs">{result.time}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground"
              >
                <AlertTriangle className="w-8 h-8 mb-3 opacity-50" />
                <p className="font-mono text-xs uppercase tracking-widest">Awaiting visual input<br/>for processing.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
