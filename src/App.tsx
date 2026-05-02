import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  FileImage, 
  Maximize2, 
  Database, 
  ArrowUpRight, 
  Plus, 
  LayoutGrid,
  Settings,
  X,
  User,
  Zap,
  Code2,
  LogIn,
  LogOut,
  ShieldCheck,
  Lock,
  Key,
  Globe,
  Terminal,
  ExternalLink,
  ChevronRight,
  Mail,
  Facebook,
  ArrowLeft,
  RefreshCw,
  Fingerprint,
  MessageCircle,
  Phone,
  Eye,
  Check,
  Layers,
  Menu,
  FileSpreadsheet
} from 'lucide-react';
import { ToolId } from './types';
import { cn } from './lib/utils';
import { auth, signInWithGoogle, syncUserToFirestore } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  updateProfile, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

// Tool Components
import Lexicon from './components/tools/Lexicon';
import Chronos from './components/tools/Chronos';

interface BentoProps {
  id: ToolId;
  title: string;
  description: string;
  icon: any;
  color: string;
  url?: string;
  className?: string;
  onClick: (id: ToolId, url?: string) => void;
  preview?: React.ReactNode;
  isEditMode?: boolean;
  onRemove?: (id: ToolId) => void;
}

const BentoCard = ({ id, title, description, icon: Icon, color, url, className, onClick, preview, isEditMode, onRemove }: BentoProps) => {
  const CardWrapper = url ? motion.a : motion.div;
  const wrapperProps = url && !isEditMode
    ? { href: url, target: "_blank", rel: "noopener noreferrer" }
    : { onClick: () => onClick(id, url) };

  return (
    <CardWrapper
      layoutId={`card-${id}`}
      {...wrapperProps}
      className={cn(
        "group relative p-8 rounded-[32px] cursor-pointer overflow-hidden transition-all duration-500 border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl flex flex-col justify-between",
        className,
        isEditMode && "ring-2 ring-indigo-500/50 hover:ring-indigo-500 shadow-2xl shadow-indigo-500/10"
      )}
      whileHover={!isEditMode ? { y: -5 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {/* Remove Button for Edit Mode */}
      <AnimatePresence>
        {isEditMode && onRemove && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(id);
            }}
            className="absolute top-4 right-4 z-[50] w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative z-10 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-inner",
            id === 'vision' && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10",
            id === 'lexicon' && "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/10",
            id === 'chronos' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10",
            id === 'svg-preview' && "bg-teal-500/20 text-teal-400 border-teal-500/30 shadow-teal-500/10",
            id === 'png-to-svg' && "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10",
            id === 'csv-gen' && "bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-orange-500/10",
          )}>
            <Icon size={24} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
               <ArrowUpRight size={20} className={cn("transition-colors", url ? "text-indigo-400" : "text-white/20 group-hover:text-white")} />
            </motion.div>
            {url && <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest mt-1">External</span>}
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">{title}</h3>
        <p className="text-sm text-[#a1a1a1] leading-relaxed font-light">{description}</p>
      </div>

      {preview && (
        <div className="mt-8 relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          {preview}
        </div>
      )}

      {/* Dynamic colorful blobs based on tool ID */}
      <div className={cn(
        "absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[80px] opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-125",
        id === 'vision' && "bg-indigo-500",
        id === 'lexicon' && "bg-amber-500",
        id === 'chronos' && "bg-emerald-500",
        id === 'svg-preview' && "bg-teal-500",
        id === 'png-to-svg' && "bg-cyan-500",
        id === 'csv-gen' && "bg-orange-500",
      )} />
    </CardWrapper>
  );
};

const DevPortal = ({ onBack }: { onBack: () => void }) => {
  const links = [
    { title: 'AI Image Generator', icon: Sparkles, url: 'https://recraft-demo.vercel.app/', color: 'bg-indigo-500' },
    { title: 'Image Upscaler', icon: Maximize2, url: 'https://aistudio.google.com/apps/21eadafe-db2b-4d1a-a66c-237bcf6abd82?showPreview=true', color: 'bg-emerald-500' },
    { title: 'Metadata Gen', icon: Database, url: 'https://aistudio.google.com/apps/33ac9eb1-bb46-4dab-af0b-e1d743fdeabe?showAssistant=true', color: 'bg-rose-500' },
    { title: 'SVG Converter', icon: FileImage, url: 'https://aistudio.google.com/u/5/apps/832e3d6f-6b36-42ef-914c-1053fabf9c0c?showAssistant=true', color: 'bg-amber-500' },
    { title: 'SVG Previewer', icon: Eye, url: 'https://aistudio.google.com/apps/c4c1385c-5c1f-4998-90a9-349badbbc4d0?showAssistant=true', color: 'bg-cyan-500' },
    { title: 'System Terminal', icon: Terminal, url: 'https://aistudio.google.com/u/5/apps/0e01c486-66b6-477c-82be-2401d2ab2e9b?showAssistant=true', color: 'bg-slate-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col p-8 overflow-y-auto"
    >
      <div className="max-w-xl mx-auto w-full pt-20">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Code2 className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Developer Portal</h2>
              <p className="text-[10px] text-[#525252] uppercase tracking-[0.2em] font-mono mt-1 underline-offset-4 decoration-emerald-500 underline">Priority Environment</p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {links.map((link, idx) => (
            <motion.a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex items-center justify-between p-6 bg-white/[0.03] hover:bg-white group-hover:text-black rounded-[24px] border border-white/10 hover:border-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110", link.color)}>
                  <link.icon size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-medium group-hover:text-black transition-colors">{link.title}</span>
                  <span className="text-[10px] text-[#525252] uppercase tracking-widest font-bold group-hover:text-black/40 transition-colors">Internal Access</span>
                </div>
              </div>
              <ChevronRight className="text-white/20 group-hover:text-black group-hover:translate-x-2 transition-all" size={24} />
            </motion.a>
          ))}
        </div>

        <footer className="mt-20 text-center">
          <p className="text-[10px] text-[#525252] uppercase tracking-[0.5em] font-light">Root access granted to Amirhub Control</p>
        </footer>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard Customization
  const [isEditMode, setIsEditMode] = useState(false);
  const [visibleToolIds, setVisibleToolIds] = useState<ToolId[]>(['vision', 'svg-preview', 'png-to-svg', 'csv-gen', 'lexicon', 'chronos']);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    const savedLayout = localStorage.getItem('amirhub-dashboard-layout');
    if (savedLayout) {
      try {
        setVisibleToolIds(JSON.parse(savedLayout));
      } catch (e) {
        console.error("Failed to parse dashboard layout", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('amirhub-dashboard-layout', JSON.stringify(visibleToolIds));
  }, [visibleToolIds]);

  const removeTool = (id: ToolId) => {
    setVisibleToolIds(prev => prev.filter(t => t !== id));
  };

  const restoreLayout = () => {
    setVisibleToolIds(['vision', 'svg-preview', 'png-to-svg', 'csv-gen', 'lexicon', 'chronos']);
    setIsEditMode(false);
  };

  // Auth States
  const [authView, setAuthView] = useState<'options' | 'login' | 'signup' | 'otp'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [correctOtp, setCorrectOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Developer Mode States
  const [isDevLoginOpen, setIsDevLoginOpen] = useState(false);
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);
  const [devUsername, setDevUsername] = useState('');
  const [devPassword, setDevPassword] = useState('');
  const [devError, setDevError] = useState('');

  // Profile States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setNewDisplayName(currentUser.displayName || '');
        // For existing users or Google users, we might want to skip OTP or enforce it
        // For this demo, let's say Google users are auto-verified
        if (currentUser.providerData[0]?.providerId === 'google.com') {
          setIsVerified(true);
        }
      } else {
        setIsVerified(false);
        setAuthView('options');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await syncUserToFirestore(userCredential.user);
      
      // Generate OTP and move to OTP view
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setCorrectOtp(code);
      setAuthView('otp');
      // In real app, you'd send this via email/SMS. 
      // For demo, we'll log it and maybe show a hint.
      console.log("Member Verification Code:", code);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserToFirestore(userCredential.user);
      setIsVerified(true);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = () => {
    const entered = otpCode.join('');
    if (entered === correctOtp) {
      setIsVerified(true);
    } else {
      setAuthError('Incorrect verification code. Please try again.');
    }
  };

  const handleSignOut = () => {
    signOut(auth);
    setIsDevAuthenticated(false);
    setIsProfileOpen(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDisplayName.trim()) return;

    setIsUpdatingProfile(true);
    try {
      // Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: newDisplayName.trim()
      });

      // Sync with Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: newDisplayName.trim(),
        lastLogin: serverTimestamp()
      });

      setIsProfileOpen(false);
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (devUsername === 'amirhub' && devPassword === 'As9058761@') {
      setIsDevAuthenticated(true);
      setIsDevLoginOpen(false);
      setDevError('');
    } else {
      setDevError('Invalid credentials. Access denied.');
    }
  };

  const tools = [
    {
      id: 'vision' as ToolId,
      title: 'AI Image Generator',
      description: 'Neural-powered image creation and synthesis engine.',
      icon: Sparkles,
      color: 'transparent',
      url: 'https://recraft-demo.vercel.app/',
      className: 'md:col-span-2 md:row-span-2',
      preview: (
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-16 h-20 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center">
               <Zap size={12} className="text-white/20" />
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'svg-preview' as ToolId,
      title: 'SVG Previewer',
      description: 'Professional suite for viewing and inspecting vector graphics.',
      icon: Eye,
      color: 'transparent',
      url: 'https://svg-code-previewer-amir.vercel.app/',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'png-to-svg' as ToolId,
      title: 'PNG to SVG converter',
      description: 'Batch convert your raster images to high-quality vector graphics.',
      icon: Layers,
      color: 'transparent',
      url: 'https://batch-png-svg--matador2panna.replit.app',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'csv-gen' as ToolId,
      title: 'CSV Metadata Generator',
      description: 'Streamlined metadata generation and CSV processing toolset.',
      icon: FileSpreadsheet,
      color: 'transparent',
      url: 'https://amrhubscsv.vercel.app',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'lexicon' as ToolId,
      title: 'SVG to JPG Converter',
      description: 'High-fidelity vector to raster conversion engine.',
      icon: FileImage,
      color: 'transparent',
      url: 'https://ais-pre-wldzpbhem2o6vsxflfavff-773225479123.asia-southeast1.run.app',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'chronos' as ToolId,
      title: 'Image Upscaler',
      description: 'Upscale images to meet Shutterstock requirements (min 4MP/2MB).',
      icon: Maximize2,
      color: 'transparent',
      url: 'https://ais-pre-jhkkfbfqamooyepfipa4xa-742219517014.asia-southeast1.run.app',
      className: 'md:col-span-1 md:row-span-2 flex-col-reverse',
      preview: (
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-6 h-6 bg-white/5 rounded shadow-sm border border-white/5" />
          ))}
        </div>
      )
    }
  ];

  const handleToolClick = (id: ToolId, url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setActiveTool(id);
    }
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'lexicon': return <Lexicon />;
      case 'chronos': return <Chronos />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full"
        />
      </div>
    );
  }

  // Authentication is now optional. We no longer block the UI if !user.

  return (
    <div className="min-h-screen bg-[#060608] text-[#ededed] selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Immersive Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-teal-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Navigation - Professional Glassmorphism Header */}
      <header className="sticky top-0 z-[100] border-b border-indigo-500/20 bg-[#060608]/50 backdrop-blur-xl group">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <nav className="flex items-center justify-between px-8 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-11 h-11 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-2xl">
                <Zap size={22} className="text-indigo-400 fill-indigo-400/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">Amirhub</span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-indigo-400/80 font-bold -mt-1">Nexus Center</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] uppercase tracking-[0.2em] font-bold text-[#71717a]">
            {['Dashboard', 'Resources', 'Integrations'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="hover:text-white transition-all relative group py-2"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
            <div className="w-px h-4 bg-white/10 mx-2" />
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck size={12} />
              <span className="tabular-nums">{user ? "Authorized Node" : "Guest Access"}</span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex items-center gap-2 hover:text-white transition-all py-2"
              >
                More Tools
                <motion.div animate={{ rotate: isMoreMenuOpen ? 180 : 0 }}>
                  <ChevronRight size={14} className="rotate-90" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-64 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-2 ml-2">All System Tools</span>
                      {tools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            handleToolClick(tool.id, tool.url);
                            setIsMoreMenuOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group text-left"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 transition-all",
                            tool.id === 'vision' && "bg-indigo-500/10 text-indigo-400",
                            tool.id === 'svg-preview' && "bg-teal-500/10 text-teal-400",
                            tool.id === 'png-to-svg' && "bg-cyan-500/10 text-cyan-400",
                            tool.id === 'csv-gen' && "bg-orange-500/10 text-orange-400",
                            tool.id === 'lexicon' && "bg-amber-500/10 text-amber-400",
                            tool.id === 'chronos' && "bg-emerald-500/10 text-emerald-400",
                          )}>
                            <tool.icon size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-white leading-tight">{tool.title}</p>
                            <p className="text-[9px] text-white/40 truncate w-32">{tool.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
  
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-3 bg-white/5 pl-1.5 pr-4 py-1.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/20 group-hover:border-indigo-400/50 transition-colors">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center">
                      <User size={14} className="text-indigo-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-white leading-none truncate max-w-[80px]">
                    {user.displayName?.split(' ')[0] || 'Member'}
                  </span>
                  <span className="text-[8px] text-white/40 font-mono mt-0.5">Active Session</span>
                </div>
              </button>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                <LogIn size={14} />
                Access Node
              </button>
            )}
          </div>
        </nav>
      </header>
  
      {/* Main Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-indigo-400 mb-3"
            >
              <div className="h-px w-8 bg-indigo-500/50" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Workspace Overview</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
              Productivity <br /> <span className="text-white/40">Enhanced.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border shadow-lg",
                isEditMode 
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20" 
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              )}
            >
              {isEditMode ? <Check size={14} /> : <Settings size={14} />}
              {isEditMode ? "Save Layout" : "Customize"}
            </motion.button>

            {visibleToolIds.length < tools.length && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restoreLayout}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 transition-all shadow-lg"
              >
                <RefreshCw size={14} />
                Restore All
              </motion.button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8 min-h-[700px]">
          <AnimatePresence mode="popLayout">
            {!activeTool && tools
              .filter(tool => visibleToolIds.includes(tool.id))
              .map((tool, idx) => (
                <motion.div
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: idx * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 25
                  }}
                  className={tool.className}
                >
                  <BentoCard 
                    {...tool} 
                    isEditMode={isEditMode} 
                    onRemove={removeTool}
                    onClick={handleToolClick} 
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
  
        <footer className="mt-32 py-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-indigo-400" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-white">Amirhub Security</span>
            </div>
            <p className="text-[10px] text-[#525252] font-mono">ROOT_ACCESS: GRANTED // STATUS: NOMINAL</p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDevLoginOpen(true)}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 hover:from-indigo-600 hover:to-blue-600 text-indigo-300 hover:text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-indigo-500/20 shadow-2xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Code2 size={16} className="relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10">Developer Interface</span>
          </motion.button>

          <div className="flex items-center gap-6">
             <a href="https://www.facebook.com/share/1GtRdCLaD8/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                <Facebook size={18} />
             </a>
             <a href="mailto:immdamirulislam@gmail.com" className="p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                <Mail size={18} />
             </a>
          </div>
        </footer>
      </main>

      {/* Profile Management Overlay */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[40px] p-10 relative shadow-2xl overflow-hidden"
            >
              {/* Background gradient hint */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
              
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-12">
                <div className="relative group mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 ring-4 ring-white/5">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <User size={32} className="text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#0d0d0d] flex items-center justify-center">
                    <ShieldCheck size={14} className="text-black" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Identity Settings</h2>
                <p className="text-[10px] text-[#525252] uppercase tracking-[0.2em] font-mono mt-1">Global Member Profile</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#525252] font-bold ml-4">Full Identity Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[20px] py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#525252] font-bold ml-4">Verified Mail</label>
                  <div className="w-full bg-white/[0.01] border border-white/5 rounded-[20px] py-5 px-6 text-sm text-[#525252] italic cursor-not-allowed">
                    {user?.email}
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdatingProfile}
                    className={cn(
                      "w-full py-5 bg-white text-black rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#f0f0f0] transition-all flex items-center justify-center gap-2",
                      isUpdatingProfile && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isUpdatingProfile ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                      />
                    ) : (
                      <>
                        <Zap size={14} className="fill-black" />
                        Save Identifier
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-5 bg-rose-500/10 text-rose-500 rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 border border-rose-500/10"
                  >
                    <LogOut size={14} />
                    Terminate Session
                  </button>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-[9px] text-[#2a2a2a] uppercase tracking-[0.3em] font-mono">Secure Node / UID: {user?.uid.slice(0, 8)}...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Login Modal */}
      <AnimatePresence>
        {isDevLoginOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              
              <button 
                onClick={() => setIsDevLoginOpen(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                  <Lock size={32} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Security Check</h2>
                <p className="text-[10px] text-[#525252] uppercase tracking-widest font-mono mt-1">Authorized Personnel Only</p>
              </div>

              <form onSubmit={handleDevLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#525252] font-bold ml-2">Identifier</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text"
                      value={devUsername}
                      onChange={(e) => setDevUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#525252] font-bold ml-2">Access Key</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="password"
                      value={devPassword}
                      onChange={(e) => setDevPassword(e.target.value)}
                      placeholder="Secret Key"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {devError && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center"
                  >
                    {devError}
                  </motion.p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Verify Identity
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Portal Rendered Post-Auth */}
      <AnimatePresence>
        {isDevAuthenticated && (
          <DevPortal onBack={() => setIsDevAuthenticated(false)} />
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/8801978516155"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[90] w-14 h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-[#25D366]/20 hover:bg-[#22c35e] transition-all border border-white/10 group"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle size={32} className="fill-white" strokeWidth={1} />
          <Phone size={14} className="absolute text-[#25D366] fill-[#25D366] rotate-[15deg] translate-y-[-1px]" />
        </div>
        <div className="absolute right-full mr-4 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Contact WhatsApp
        </div>
      </motion.a>

      {/* Tool Overlay */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-4 md:p-12 flex items-center justify-center"
          >
            <motion.div
              layoutId={`card-${activeTool}`}
              className="w-full h-full max-w-7xl bg-[#0a0a0a] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative flex flex-col"
            >
              <div className="absolute top-6 right-6 z-[60]">
                <button
                  onClick={() => setActiveTool(null)}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl active:scale-95"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {renderActiveTool()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
