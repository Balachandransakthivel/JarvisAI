import React, { useState } from 'react';
import { Eye, Camera, Monitor, Sparkles, Loader2, Scan } from 'lucide-react';
import { analyzeVisionOnBackend } from '@/lib/api';
import { toast } from 'sonner';

export const VisionPanel: React.FC = () => {
  const [source, setSource] = useState<'screen' | 'webcam'>('screen');
  const [query, setQuery] = useState('Analyze the active display and detect elements');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.info(`JARVIS Vision Engine capturing ${source}...`);
    try {
      const res = await analyzeVisionOnBackend(source, query);
      setAnalysisResult(res.response || 'Screen analysis complete.');
      toast.success('Vision analysis rendered');
    } catch (err: any) {
      toast.error(`Vision Engine error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col glass-hud rounded-xl border border-[#ff7300]/25 p-5 relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#ff7300]/20 pb-3 mb-4">
        <div className="flex items-center gap-2 text-[#ff7300] font-display font-bold uppercase text-xs tracking-widest">
          <Eye className="w-4 h-4 text-glow-orange animate-pulse" />
          <span>JARVIS VISION AI & OCR ENGINE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30">
            MULTIMODAL ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Controls & Mode Selection */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-[#ff8c00] uppercase tracking-wider block font-bold">
              OPTICAL SOURCE INPUT
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSource('screen')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                  source === 'screen'
                    ? 'bg-[#ff7300]/20 border-[#ff7300] text-[#ffd8b8] shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                    : 'bg-[#050404] border-[#ff7300]/20 text-gray-400 hover:border-[#ff7300]/50'
                }`}
              >
                <Monitor className="w-6 h-6 text-[#ff7300]" />
                <span className="text-xs font-mono font-bold">[COMPUTER SCREEN]</span>
              </button>
              <button
                type="button"
                onClick={() => setSource('webcam')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                  source === 'webcam'
                    ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#ffd8b8] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                    : 'bg-[#050404] border-[#ff7300]/20 text-gray-400 hover:border-[#00d4ff]/50'
                }`}
              >
                <Camera className="w-6 h-6 text-[#00d4ff]" />
                <span className="text-xs font-mono font-bold">[WEBCAM CAMERA]</span>
              </button>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-3">
              <label className="text-[10px] font-mono text-[#ff8c00] uppercase tracking-wider block font-bold">
                VISION INSTRUCTION PROMPT
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What is on my screen? / Identify objects..."
                className="w-full bg-[#050404] border border-[#ff7300]/30 px-3 py-2 text-xs font-mono text-[#ffd8b8] rounded focus:outline-none focus:border-[#ff7300]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#ff7300]/20 border border-[#ff7300]/40 text-[#ff7300] hover:bg-[#ff7300]/30 rounded font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                EXECUTE VISION SCAN
              </button>
            </form>
          </div>

          {/* Optical Spec Footer */}
          <div className="p-3 bg-[#03060f] border border-[#ff7300]/20 rounded-lg text-[9px] font-mono space-y-1 text-gray-400">
            <p className="text-[#ff7300] font-bold uppercase">JARVIS OPTICAL SPECIFICATION</p>
            <p>• Screen OCR Matrix: PyTesseract / LayoutParser Enabled</p>
            <p>• Multimodal Neural Net: Gemini 2.0 Flash Vision / GPT-4 Vision</p>
            <p>• Object Detection Confidence Threshold: 94.2%</p>
          </div>
        </div>

        {/* Vision Analysis Output Studio */}
        <div className="flex flex-col glass-panel p-4 border border-[#ff7300]/30 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ff7300]/20 pb-2 mb-3">
            <span className="text-[10px] font-mono text-[#ff7300] font-bold uppercase flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5 text-[#00d4ff]" />
              ANALYSIS FEED OUTPUT
            </span>
            <span className="text-[9px] font-mono text-gray-400 uppercase">
              STATUS: {loading ? 'SCANNING...' : analysisResult ? 'READY' : 'IDLE'}
            </span>
          </div>

          <div className="flex-1 bg-[#03060f] rounded border border-[#ff7300]/20 p-4 font-mono text-xs text-[#ffd8b8] overflow-y-auto space-y-3 relative">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-[#00d4ff] space-y-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-xs uppercase tracking-widest animate-pulse">Capturing Frame & Executing Vision Reasoning...</p>
              </div>
            ) : analysisResult ? (
              <div className="whitespace-pre-wrap leading-relaxed">{analysisResult}</div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-center text-xs">
                Select input source (Screen or Webcam) and click "EXECUTE VISION SCAN" to process optical visual data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
