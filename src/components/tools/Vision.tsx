import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Play, 
  Loader2, 
  Sparkles, 
  Code, 
  Eye, 
  FileArchive, 
  Settings, 
  Key, 
  Check, 
  X, 
  ShieldCheck,
  Zap,
  RefreshCw,
  Image as ImageIcon,
  Trash2,
  Globe
} from 'lucide-react';
import JSZip from 'jszip';
import { generateSvg, AIProvider } from '../../lib/aiService';
import { cn } from '../../lib/utils';

export default function Vision() {
  const [prompt, setPrompt] = useState('');
  const [svgCodes, setSvgCodes] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [generateCount, setGenerateCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  
  // Settings/Config
  const [activeProvider, setActiveProvider] = useState<AIProvider>(
    () => (localStorage.getItem('AI_PROVIDER') as AIProvider) || 'gemini'
  );
  const [geminiApiKeys, setGeminiApiKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('GEMINI_CUSTOM_API_KEYS');
    return saved ? JSON.parse(saved) : ['', '', '', '', ''];
  });
  const [groqApiKey, setGroqApiKey] = useState<string>(() => localStorage.getItem('GROQ_API_KEY') || '');
  const [claudeApiKey, setClaudeApiKey] = useState<string>(() => localStorage.getItem('CLAUDE_API_KEY') || '');
  const [deepseekApiKey, setDeepseekApiKey] = useState<string>(() => localStorage.getItem('DEEPSEEK_API_KEY') || '');
  const [autoFallback, setAutoFallback] = useState<boolean>(() => localStorage.getItem('AUTO_FALLBACK') !== 'false');
  const [showSettings, setShowSettings] = useState(false);

  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('AI_PROVIDER', activeProvider);
  }, [activeProvider]);

  useEffect(() => {
    localStorage.setItem('AUTO_FALLBACK', String(autoFallback));
    localStorage.setItem('GEMINI_CUSTOM_API_KEYS', JSON.stringify(geminiApiKeys));
    localStorage.setItem('GROQ_API_KEY', groqApiKey);
    localStorage.setItem('CLAUDE_API_KEY', claudeApiKey);
    localStorage.setItem('DEEPSEEK_API_KEY', deepseekApiKey);
  }, [autoFallback, geminiApiKeys, groqApiKey, claudeApiKey, deepseekApiKey]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Content = result.split(',')[1];
      setSelectedImage({
        data: base64Content,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPrompt('');
    setSvgCodes([]);
    setSelectedIndex(0);
    setError(null);
    setSelectedImage(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedImage) {
      setError("Please provide a prompt or an image reference.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let apiKey: string | string[] | undefined;
      let providerToUse = activeProvider;

      if (providerToUse === 'gemini') apiKey = geminiApiKeys.filter(k => k.trim() !== "");
      else if (providerToUse === 'groq') apiKey = groqApiKey;
      else if (providerToUse === 'claude') apiKey = claudeApiKey;
      else if (providerToUse === 'deepseek') apiKey = deepseekApiKey;

      const promptToSubmit = prompt || "Analyze this image and create a professional vector representation.";

      let codes: string[];
      try {
        codes = await generateSvg(promptToSubmit, generateCount, apiKey || undefined, providerToUse, selectedImage || undefined);
      } catch (err: any) {
        const errorMsg = (err.message || '').toLowerCase();
        const isQuotaOrBalance = errorMsg.includes("quota") || errorMsg.includes("balance") || errorMsg.includes("credit") || errorMsg.includes("402") || errorMsg.includes("429");

        if (autoFallback && providerToUse !== 'gemini' && isQuotaOrBalance) {
          console.warn("Provider failed, falling back to Gemini...", err);
          const fallbackKeys = geminiApiKeys.filter(k => k.trim() !== "");
          codes = await generateSvg(promptToSubmit, generateCount, fallbackKeys.length > 0 ? fallbackKeys : undefined, 'gemini', selectedImage || undefined);
        } else {
          throw err;
        }
      }

      setSvgCodes(codes);
      setSelectedIndex(0);
      setActiveTab('preview');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'Failed to generate SVG. Please check your API keys or try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (svgCodes[selectedIndex]) {
      navigator.clipboard.writeText(svgCodes[selectedIndex]);
    }
  };

  const handleDownloadSingle = () => {
    if (!svgCodes[selectedIndex]) return;
    const blob = new Blob([svgCodes[selectedIndex]], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amirhub-svg-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (svgCodes.length <= 1) {
      handleDownloadSingle();
      return;
    }

    const zip = new JSZip();
    svgCodes.forEach((code, index) => {
      zip.file(`variation-${index + 1}.svg`, code);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amirhub-svg-collection-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight font-sans">AI Image Generator</h2>
            <p className="text-[10px] text-[#a1a1a1] font-mono uppercase tracking-[0.2em]">Vector Synthesis Hub</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {svgCodes.length > 0 && (
            <div className="flex bg-white/[0.05] rounded-lg border border-white/10 p-1 mr-4">
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-white/10 rounded-md transition-all text-white/60 hover:text-white"
                title="Copy SVG"
              >
                <Copy size={16} />
              </button>
              <button 
                onClick={svgCodes.length > 1 ? handleDownloadAll : handleDownloadSingle}
                className="p-2 hover:bg-white/10 rounded-md transition-all text-white/60 hover:text-white"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          )}
          
          <button 
            onClick={() => {
              const url = 'https://ais-pre-dh4f7cbqswv4ztr26gqzwi-742219517014.asia-southeast1.run.app';
              window.open(url, '_blank');
              navigator.clipboard.writeText(url);
            }}
            className="p-2.5 rounded-xl transition-all border bg-white/5 border-white/10 text-white/40 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 group"
            title="Open Direct Link & Copy to Clipboard"
          >
            <Globe size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2.5 rounded-xl transition-all border mr-12",
              showSettings ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <Settings size={20} className={cn(showSettings && "animate-spin-slow")} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-[380px] border-r border-white/5 bg-white/[0.01] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Visual Reference</label>
              {selectedImage && (
                <button onClick={() => setSelectedImage(null)} className="text-[10px] text-rose-500 hover:underline uppercase tracking-widest font-bold">Clear</button>
              )}
            </div>
            {selectedImage ? (
              <div className="relative group aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} alt="Ref" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <p className="text-[10px] font-bold uppercase tracking-widest">Image Uploaded</p>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group">
                <ImageIcon size={24} className="text-white/20 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 group-hover:text-white/40Transition">Upload Identity Image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Creative Directives</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vector vision..."
              className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10 resize-none text-white/80 leading-relaxed font-sans"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Variation Count</span>
              <span className="text-[10px] font-mono text-indigo-400">{generateCount}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={generateCount} 
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              className="w-full accent-indigo-500 opacity-50 hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-3">
             {/* Turbo API Status */}
             {activeProvider === 'gemini' && (
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-2">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <Zap size={12} className={cn("transition-colors", geminiApiKeys.filter(k => k).length > 0 ? "text-indigo-400 fill-indigo-400" : "text-white/20")} />
                     <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Turbo Nodes</span>
                   </div>
                   <span className="text-[9px] font-mono text-indigo-400/60">{geminiApiKeys.filter(k => k).length}/5 Active</span>
                 </div>
                 <div className="flex gap-1.5 h-1">
                   {[0, 1, 2, 3, 4].map((i) => (
                     <div 
                       key={i} 
                       className={cn(
                         "flex-1 rounded-full transition-all duration-500",
                         geminiApiKeys[i] ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/5"
                       )} 
                     />
                   ))}
                 </div>
                 <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-mono mt-3 text-center">
                   {geminiApiKeys.filter(k => k).length > 1 ? "Parallel Processing Enabled" : "Single Stream Mode"}
                 </p>
               </div>
             )}

             {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-[10px] text-rose-400 font-medium leading-relaxed mb-2 flex flex-col gap-3 shadow-2xl shadow-rose-500/5">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-rose-500/20 rounded-lg shrink-0 h-fit">
                      <X size={14} className="text-rose-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-rose-300 uppercase tracking-widest text-[9px]">Neural Engine Exception</p>
                      <p className="text-white/60 lowercase">{error}</p>
                    </div>
                  </div>

                  {/* Actionable Feedback */}
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">Protocol Resolution</p>
                    
                    {(error.toLowerCase().includes("key") || error.toLowerCase().includes("invalid") || error.toLowerCase().includes("403") || error.toLowerCase().includes("permission")) ? (
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <p className="text-indigo-300/80">API keys might be invalid or expired. Check your <button onClick={() => setShowSettings(true)} className="underline hover:text-indigo-200">Neural Settings</button> and ensure the keys are active.</p>
                      </div>
                    ) : (error.toLowerCase().includes("quota") || error.toLowerCase().includes("429") || error.toLowerCase().includes("limit") || error.toLowerCase().includes("balance") || error.toLowerCase().includes("402")) ? (
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <p className="text-amber-300/80">Rate limit reached or balance exhausted. Wait 60 seconds, switch providers, or add multiple keys in settings to bypass limits.</p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-white/20 mt-1.5 shrink-0" />
                        <p className="text-white/40 italic">Connectivity anomaly detected. Resetting the node or adjusting the creative directives may resolve this.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={handleGenerate}
                      className="flex-1 bg-rose-500 text-white py-2 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-rose-400 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
                      Retry Sync
                    </button>
                    <button 
                      onClick={() => setError(null)}
                      className="px-3 bg-white/5 hover:bg-white/10 text-white/40 py-2 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
             )}
             <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl transition-all",
                isLoading 
                  ? "bg-white/5 text-white/20 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-[#f0f0f0] active:scale-95"
              )}
             >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={16} className="fill-black" />
                  Synthesize Vector
                </>
              )}
             </button>
             <button 
              onClick={handleClear}
              className="w-full py-4 text-[10px] uppercase tracking-[0.3em] text-white/20 hover:text-white/60 transition-colors font-bold"
             >
              Flush Memory
             </button>
          </div>
        </div>

        {/* Right Preview Area */}
        <div className="flex-1 bg-black relative flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setActiveTab('preview')}
              className={cn(
                "px-8 py-4 text-[10px] uppercase font-bold tracking-widest boder-b-2 transition-all",
                activeTab === 'preview' ? "border-indigo-500 text-white bg-white/[0.02]" : "border-transparent text-white/20 hover:text-white/40"
              )}
            >
              <Eye size={14} className="inline mr-2" />
              Visual Preview
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={cn(
                "px-8 py-4 text-[10px] uppercase font-bold tracking-widest boder-b-2 transition-all",
                activeTab === 'code' ? "border-indigo-500 text-white bg-white/[0.02]" : "border-transparent text-white/20 hover:text-white/40"
              )}
            >
              <Code size={14} className="inline mr-2" />
              Source XML
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-12">
            {svgCodes.length > 0 ? (
              <div className="w-full h-full flex flex-col gap-12">
                <div className="flex-1 flex items-center justify-center bg-white/[0.02] rounded-[40px] border border-white/5 p-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
                  {activeTab === 'preview' ? (
                    <div 
                      className="max-w-full max-h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      dangerouslySetInnerHTML={{ __html: svgCodes[selectedIndex] }}
                    />
                  ) : (
                    <div className="w-full h-full overflow-hidden flex flex-col">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Variation {selectedIndex + 1} Code</span>
                          <button onClick={handleCopy} className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1 font-bold">
                            <Copy size={12} /> COPY
                          </button>
                       </div>
                       <pre className="flex-1 w-full bg-black/40 rounded-2xl p-6 text-[10px] font-mono text-white/40 overflow-y-auto custom-scrollbar border border-white/5 whitespace-pre-wrap lowercase">
                        {svgCodes[selectedIndex]}
                       </pre>
                    </div>
                  )}
                </div>

                {svgCodes.length > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    {svgCodes.map((code, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={cn(
                          "w-20 h-20 rounded-2xl border-2 transition-all overflow-hidden bg-white/[0.02] active:scale-95",
                          selectedIndex === idx ? "border-indigo-500 ring-4 ring-indigo-500/20" : "border-white/5 hover:border-white/20"
                        )}
                        dangerouslySetInnerHTML={{ __html: code }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 opacity-20">
                <div className="w-32 h-32 rounded-[40px] border-2 border-dashed border-white/20 flex items-center justify-center">
                  <Sparkles size={48} />
                </div>
                <div className="text-center">
                   <p className="text-sm font-medium tracking-tight mb-1">Awaiting Directives</p>
                   <p className="text-[10px] uppercase tracking-[0.2em] font-mono">Neural layers are primed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
           <div className="w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-[40px] p-10 relative shadow-2xl overflow-hidden">
              <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold tracking-tight mb-8 flex items-center gap-3">
                <Settings className="text-indigo-400" />
                Network Protocols
              </h3>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">AI Neural Engine</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['gemini', 'claude', 'groq', 'deepseek'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setActiveProvider(p as AIProvider)}
                        className={cn(
                          "py-4 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                          activeProvider === p ? "bg-indigo-500 border-indigo-400 text-white" : "bg-white/[0.03] border-white/10 text-white/40 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">Secret Access Keys</label>
                    {activeProvider === 'gemini' && (
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest font-bold">Turbo Rotation Active</span>
                    )}
                  </div>
                  
                  {activeProvider === 'gemini' ? (
                    <div className="space-y-2">
                       {geminiApiKeys.map((key, idx) => (
                         <div key={idx} className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {key ? <Check size={12} className="text-emerald-500" /> : <Key size={12} className="text-white/20" />}
                              <span className="text-[8px] font-mono text-white/10">{idx + 1}</span>
                            </div>
                            <input 
                              type="password"
                              placeholder={`Gemini Node ${idx + 1} API Key...`}
                              value={key}
                              onChange={(e) => {
                                const newKeys = [...geminiApiKeys];
                                newKeys[idx] = e.target.value;
                                setGeminiApiKeys(newKeys);
                              }}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                            />
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                      <input 
                        type="password"
                        placeholder={`Enter ${activeProvider} API Key...`}
                        value={
                          activeProvider === 'groq' ? groqApiKey :
                          activeProvider === 'claude' ? claudeApiKey :
                          activeProvider === 'deepseek' ? deepseekApiKey : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeProvider === 'groq') setGroqApiKey(val);
                          else if (activeProvider === 'claude') setClaudeApiKey(val);
                          else if (activeProvider === 'deepseek') setDeepseekApiKey(val);
                        }}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                      />
                    </div>
                  )}
                  
                  {activeProvider === 'gemini' && geminiApiKeys.filter(k => k).length === 0 && (
                    <p className="text-[10px] text-white/20 italic">Global keys are active. Enter custom keys to increase speed and bypass shared limits.</p>
                  )}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <div 
                    onClick={() => setAutoFallback(!autoFallback)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className={cn(
                      "w-10 h-5 rounded-full relative transition-all duration-300",
                      autoFallback ? "bg-indigo-500" : "bg-white/10"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300",
                        autoFallback ? "left-6" : "left-1"
                      )} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">Emergency Fallback (Gemini)</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#f0f0f0] transition-all"
                >
                  Apply Protocols
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
