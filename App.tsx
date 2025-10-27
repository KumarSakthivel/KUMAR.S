// Fix: Add definitions for Web Speech API to fix TypeScript errors
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any; // Simplified for this use case
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

// Fix: Add definition for SpeechSynthesisErrorEvent to improve error handling.
interface SpeechSynthesisErrorEvent extends Event {
    readonly charIndex: number;
    readonly elapsedTime: number;
    readonly error: string;
    readonly name: string;
    readonly utterance: SpeechSynthesisUtterance;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// Fix: Augment the global Window interface for SpeechRecognition APIs within a module.
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

import React, { useState, useEffect, createContext, useContext, useCallback, useRef, PropsWithChildren, useMemo } from 'react';
import type { Theme, Page, Project, ChatMessage, Task, Note, UserProfile, Language, ToastMessage, ToastType, Notification } from './types';
import { HomeIcon, ChatIcon, SearchIcon, ProjectsIcon, SunIcon, MoonIcon, ProfileIcon, PlusIcon, EditIcon, DeleteIcon, SendIcon, CloseIcon, CheckIcon, SpinnerIcon, GoogleIcon, MicrosoftIcon, UserIcon, PhoneIcon, EmailIcon, LockIcon, PinIcon, PinSolidIcon, MicrophoneIcon, ExportIcon, BackIcon, EyeIcon, EyeSlashIcon, NotificationIcon, LightbulbIcon, CheckCircleIcon, SpeakerIcon, StopIcon, CopyIcon, ClockIcon, LogoutIcon, CameraIcon, PlayIcon, PauseIcon, EnglishFlagIcon, TamilFlagIcon, PausedWaveIcon } from './components/Icons';
import { generateChatResponse, summarizeText } from './services/geminiService';

// --- App Context ---
interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoggedIn: boolean;
  login: (userData: { name: string; email: string }, remember?: boolean) => void;
  logout: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'timestamp' | 'isPinned' | 'chatHistory' | 'status'>) => void;
  deleteProject: (id: string) => void;
  updateProject: (updatedProject: Project) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'timestamp'>) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  toastMessage: ToastMessage | null;
  showToast: (message: string, type?: ToastType) => void;
  isForgotPasswordOpen: boolean;
  openForgotPassword: () => void;
  closeForgotPassword: () => void;
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isExportModalOpen: boolean;
  openExportModal: () => void;
  closeExportModal: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  searchHistory: string[];
  addSearchToHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('rememberMe') === 'true');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
        name: '',
        email: '',
        phone: '123-456-7890',
        avatar: undefined,
    };
  });
  const [projects, setProjects] = useState<Project[]>(() => [
    {
      id: '1',
      title: 'AI Research Paper',
      description: 'A comprehensive study on the impact of large language models in modern education.',
      category: 'Research',
      timestamp: '2 weeks ago',
      deadline: '2024-08-15',
      priority: 'High',
      status: 'Active',
      isPinned: true,
      chatHistory: [],
    },
    {
      id: '2',
      title: 'Q3 Marketing Campaign',
      description: 'Launch plan for the new product line, targeting social media and content creators.',
      category: 'Work',
      timestamp: '1 month ago',
      deadline: '2024-07-30',
      priority: 'Medium',
      status: 'Active',
      isPinned: false,
      chatHistory: [],
    },
    {
        id: '3',
        title: 'Learn Advanced React',
        description: 'Completed a course on advanced React patterns including hooks, context, and performance optimization.',
        category: 'Education',
        timestamp: '3 days ago',
        deadline: '2024-06-20',
        priority: 'Low',
        status: 'Completed',
        isPinned: false,
        chatHistory: [],
      },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
      {id: '1', text: 'Finalize Q3 report slides', completed: false, dueDate: 'Tomorrow'},
      {id: '2', text: 'Review project proposal with team', completed: false, dueDate: 'Friday'},
      {id: '3', text: 'Submit weekly progress update', completed: true, dueDate: 'Yesterday'},
  ]);
  const [notes, setNotes] = useState<Note[]>([
      {id: '1', text: 'AI conference keynote was inspiring. Need to look into generative adversarial networks more.', timestamp: '2 days ago'},
      {id: '2', text: 'Idea for new app feature: voice-to-text transcription for project notes.', timestamp: '1 week ago'},
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', text: 'New comment on "AI Research Paper"', timestamp: '5m ago', isRead: false, type: 'project', link: 'projects', contextId: '1' },
    { id: '2', text: 'Your task "Finalize Q3 report" is due tomorrow', timestamp: '1h ago', isRead: false, type: 'task', link: 'home' },
    { id: '3', text: 'Profile update was successful', timestamp: '1d ago', isRead: true, type: 'general', link: 'profile' },
  ]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    root.style.backgroundColor = theme === 'light' ? '#f0f4f8' : '#121212';
    root.style.fontFamily = "'Century Gothic', 'Poppins', 'sans-serif'";
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);
  
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  
  const login = (userData: { name: string; email: string }, remember: boolean = false) => {
    if (remember) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    const newProfile = { ...userProfile, name: userData.name, email: userData.email };
    setUserProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userProfile');
    setUserProfile({
        name: '',
        email: '',
        phone: '123-456-7890',
        avatar: undefined,
    });
    setIsLoggedIn(false);
    setCurrentPage('home'); 
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openQuickAdd = () => setIsQuickAddOpen(true);
  const closeQuickAdd = () => setIsQuickAddOpen(false);
  const openForgotPassword = () => setIsForgotPasswordOpen(true);
  const closeForgotPassword = () => setIsForgotPasswordOpen(false);
  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToastMessage(newToast);
    setTimeout(() => {
        setToastMessage(current => (current?.id === newToast.id ? null : current));
    }, 3000);
  }, []);
  
  const addProject = (project: Omit<Project, 'id' | 'timestamp' | 'isPinned' | 'chatHistory' | 'status'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      isPinned: false,
      chatHistory: [],
      status: 'Active',
    };
    setProjects(prev => [newProject, ...prev]);
    showToast("Project added to your workspace", 'success');
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };
  
  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (activeProject?.id === updatedProject.id) {
        setActiveProject(updatedProject);
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
      const newTask: Task = { ...task, id: Date.now().toString(), completed: false };
      setTasks(prev => [newTask, ...prev]);
  }
  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t));
  }
  const addNote = (note: Omit<Note, 'id' | 'timestamp'>) => {
      const newNote: Note = { ...note, id: Date.now().toString(), timestamp: 'Just now'};
      setNotes(prev => [newNote, ...prev]);
  }

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    showToast("Profile updated successfully", 'success');
  };
  
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const addSearchToHistory = useCallback((query: string) => {
    const cleanedQuery = query.trim().toLowerCase();
    if (!cleanedQuery) return;
    setSearchHistory(prev => {
        const newHistory = [
            query.trim(),
            ...prev.filter(item => item.trim().toLowerCase() !== cleanedQuery)
        ];
        return newHistory.slice(0, 10);
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
      setSearchHistory([]);
      showToast('Search history cleared.', 'info');
  }, [showToast]);

  const value = { theme, toggleTheme, isLoggedIn, login, logout, currentPage, setCurrentPage, projects, addProject, deleteProject, updateProject, tasks, addTask, toggleTask, notes, addNote, isModalOpen, openModal, closeModal, isQuickAddOpen, openQuickAdd, closeQuickAdd, toastMessage, showToast, isForgotPasswordOpen, openForgotPassword, closeForgotPassword, activeProject, setActiveProject, userProfile, updateUserProfile, language, setLanguage, isExportModalOpen, openExportModal, closeExportModal, notifications, markNotificationAsRead, markAllNotificationsAsRead, searchHistory, addSearchToHistory, clearSearchHistory };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// --- Keyboard Shortcuts Hook ---
const useHotkeys = (hotkeys: { combo: string; callback: () => void }[]) => {
    const hotkeysRef = useRef(hotkeys);
    hotkeysRef.current = hotkeys;
  
    useEffect(() => {
      let sequence: string[] = [];
      let timer: number | undefined;
  
      const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          return;
        }
        const key = event.key.toLowerCase();
        const isMac = navigator.userAgent.includes('Mac');
        clearTimeout(timer);
        sequence.push(key);
        timer = window.setTimeout(() => { sequence = []; }, 1000);
  
        for (const hotkey of hotkeysRef.current) {
          const parts = hotkey.combo.toLowerCase().split(' ');
          if (parts.length > 1) { // Sequence hotkey
            if (sequence.join(' ').endsWith(parts.join(' '))) {
              event.preventDefault();
              hotkey.callback();
              sequence = [];
              return;
            }
          } else { // Modifier hotkey
            const comboParts = parts[0].split('+');
            const mainKey = comboParts.pop();
            if (key !== mainKey) continue;
            
            const mod = comboParts.includes('mod');
            const shift = comboParts.includes('shift');
            const alt = comboParts.includes('alt');
  
            const platformMod = isMac ? event.metaKey : event.ctrlKey;
            
            if (platformMod === mod && event.shiftKey === shift && event.altKey === alt) {
              event.preventDefault();
              hotkey.callback();
              return;
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => { window.removeEventListener('keydown', handleKeyDown); };
    }, []); 
};

// --- UI Components ---
const Logo: React.FC = () => {
    const { theme } = useAppContext();
    const isDark = theme === 'dark';
    
    return (
        <h1 className="text-2xl font-bold font-montserrat tracking-wide">
            <span className={isDark ? "text-dark-text" : "text-light-text"}>Learnio</span>
            <span 
                className={`relative inline-block bg-clip-text text-transparent ${
                    isDark
                        ? 'bg-gradient-to-r from-dark-accent to-green-300'
                        : 'bg-light-accent'
                }`}
            >
                .AI
            </span>
        </h1>
    );
};

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useAppContext();
    return (
        <button onClick={toggleTheme} className="p-2 rounded-full transition-colors duration-300 text-light-text dark:text-dark-text hover:bg-black/10 dark:hover:bg-white/10">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
    );
};

const InputWithIcon: React.FC<{ 
    icon: React.ReactNode, 
    placeholder: string, 
    type?: string, 
    value?: string, 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    rightIcon?: React.ReactNode,
    onRightIconClick?: () => void
}> = ({ icon, rightIcon, onRightIconClick, ...props }) => (
    <div className="relative flex items-center">
        <span className="absolute left-4 text-gray-400 pointer-events-none">{icon}</span>
        <input 
            {...props} 
            className={`w-full pl-12 ${rightIcon ? 'pr-12' : 'pr-4'} py-3 bg-transparent border-2 border-gray-400/30 rounded-lg focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors`} 
        />
        {rightIcon && (
            <button type="button" onClick={onRightIconClick} className="absolute right-4 text-gray-400 hover:text-light-text dark:hover:text-dark-text transition-colors">
                {rightIcon}
            </button>
        )}
    </div>
);


// --- Modals ---
const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{submitted ? 'Check Your Email' : 'Forgot Password?'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><CloseIcon /></button>
                </div>
                {submitted ? (
                    <p>If an account with that email exists, we've sent a password reset link.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm opacity-80">Enter your email address and we'll send you a link to reset your password.</p>
                        <InputWithIcon icon={<EmailIcon />} placeholder="Email ID" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button type="submit" className="w-full py-3 font-bold text-white dark:text-dark-background rounded-lg bg-light-accent dark:bg-dark-accent hover:opacity-90 transition-all duration-300">Send Reset Link</button>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- Login Page ---
const LoginPage: React.FC = () => {
    const { login, openForgotPassword, showToast } = useAppContext();
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    // State for create account form
    const [createName, setCreateName] = useState('');
    const [createPhone, setCreatePhone] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createConfirmPassword, setCreateConfirmPassword] = useState('');

    const handleOAuth = (provider: 'google' | 'microsoft') => {
      console.log(`Initiating ${provider} OAuth sign-in...`);
      setLoadingProvider(provider);
      // In a real app, you would redirect to the OAuth provider here.
      // For this demo, we'll simulate a delay and then log in.
      setTimeout(() => {
          const name = 'Social User';
          const email = 'social.user@example.com';
          login({ name, email }, rememberMe);
          showToast(`Welcome, ${name} 🎓`, 'success');
          setLoadingProvider(null);
      }, 1500);
    };

    const handleManualLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password to continue.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            return;
        }
        
        // Derive name from email for display purposes
        const nameFromEmail = email.split('@')[0]
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        login({ name: nameFromEmail, email: email }, rememberMe);
        showToast(`Welcome, ${nameFromEmail} 🎓`, 'success');
    };
  
    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!createName || !createEmail || !createPassword || createPassword !== createConfirmPassword) {
            setError('Please fill out all fields and ensure passwords match.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            return;
        }
        login({ name: createName, email: createEmail }, rememberMe);
        showToast(`Welcome, ${createName} 🎓`, 'success');
    };

    const socialButtonClasses = "w-full h-[46px] flex items-center justify-center space-x-3 py-3 rounded-lg border hover:scale-105 hover:shadow-lg active:scale-100 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700";

    const socialLogins = (
      <div className="space-y-3">
            <button 
                onClick={() => handleOAuth('google')} 
                disabled={!!loadingProvider}
                className={socialButtonClasses}
                aria-label="Continue with Google"
            >
                {loadingProvider === 'google' ? <SpinnerIcon /> : (
                  <>
                    <GoogleIcon className="w-6 h-6"/>
                    <span className="font-semibold text-sm">Continue with Google</span>
                  </>
                )}
            </button>
            <button 
                onClick={() => handleOAuth('microsoft')} 
                disabled={!!loadingProvider}
                className={socialButtonClasses}
                aria-label="Continue with Microsoft"
            >
                 {loadingProvider === 'microsoft' ? <SpinnerIcon /> : (
                  <>
                    <MicrosoftIcon className="w-6 h-6"/>
                    <span className="font-semibold text-sm">Continue with Microsoft</span>
                  </>
                 )}
            </button>
        </div>
    );
  
    const createAccountForm = (
      <form className={`space-y-4 animate-fade-up ${isShaking ? 'animate-shake' : ''}`} style={{ animationDuration: '0.3s' }} onSubmit={handleCreateAccount}>
          <h3 className="text-xl font-bold text-center">Create Your Account</h3>
          <InputWithIcon icon={<UserIcon />} placeholder="Full Name" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          <InputWithIcon icon={<PhoneIcon />} placeholder="Phone Number" type="tel" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} />
          <InputWithIcon icon={<EmailIcon />} placeholder="Email ID" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
          <InputWithIcon 
              icon={<LockIcon />} 
              placeholder="Password" 
              type={showCreatePassword ? 'text' : 'password'}
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              rightIcon={showCreatePassword ? <EyeSlashIcon /> : <EyeIcon />}
              onRightIconClick={() => setShowCreatePassword(!showCreatePassword)}
          />
          <InputWithIcon 
              icon={<LockIcon />} 
              placeholder="Confirm Password" 
              type={showCreatePassword ? 'text' : 'password'}
              value={createConfirmPassword}
              onChange={(e) => setCreateConfirmPassword(e.target.value)}
              rightIcon={showCreatePassword ? <EyeSlashIcon /> : <EyeIcon />}
              onRightIconClick={() => setShowCreatePassword(!showCreatePassword)}
          />
           {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
          <button type="submit" className="w-full py-3 font-bold text-white rounded-lg bg-light-accent dark:bg-dark-accent hover:opacity-90 dark:text-dark-background transition-all duration-300 shadow-lg dark:shadow-dark-accent/30 hover:shadow-xl dark:hover:shadow-dark-accent/50 group dark:hover:animate-glow">
              ✅ Create Account
          </button>
          <button type="button" onClick={() => setIsCreatingAccount(false)} className="w-full py-2 text-sm text-center hover:underline opacity-80">
            🔙 Back to Login
          </button>
      </form>
    );
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text transition-colors duration-400 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent dark:from-blue-900/20 dark:via-purple-900/20 dark:to-transparent"></div>
          <div className="w-full max-w-md p-8 space-y-8 bg-white/50 dark:bg-black/50 backdrop-blur-2xl rounded-2xl shadow-2xl z-10 animate-fade-up">
              <div className="text-center">
                  <div className="flex justify-center mb-4">
                      <Logo />
                  </div>
                  <h2 className="text-3xl font-bold">Welcome You</h2>
                  <p className="mt-2 text-sm opacity-80">"Your goals, your path, your Learnio.AI."</p>
              </div>
              
              {isCreatingAccount ? createAccountForm : (
                  <div className="space-y-6 animate-fade-up" style={{ animationDuration: '0.3s' }}>
                      <form className={`space-y-4 ${isShaking ? 'animate-shake' : ''}`} onSubmit={handleManualLogin}>
                          <InputWithIcon icon={<EmailIcon />} placeholder="Email ID" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                          <InputWithIcon 
                              icon={<LockIcon />} 
                              placeholder="Password" 
                              type={showLoginPassword ? 'text' : 'password'} 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)}
                              rightIcon={showLoginPassword ? <EyeSlashIcon /> : <EyeIcon />}
                              onRightIconClick={() => setShowLoginPassword(!showLoginPassword)}
                           />
                          {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                          <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm cursor-pointer">
                                <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-400/50 text-light-accent focus:ring-light-accent dark:bg-transparent dark:border-gray-500" 
                                />
                                <span className="ml-2 text-light-text/80 dark:text-dark-text/80">Remember Me</span>
                            </label>
                            <button type="button" onClick={openForgotPassword} className="text-sm font-medium text-light-accent dark:text-dark-accent hover:underline transition-all duration-300">
                                Forgot Password?
                            </button>
                          </div>
                          <button
                              type="submit"
                              className="w-full py-3 font-bold text-white rounded-lg bg-light-accent dark:bg-dark-accent hover:opacity-90 dark:text-dark-background transition-all duration-300 shadow-lg dark:shadow-dark-accent/30 hover:shadow-xl active:bg-[#D8BFD8] active:text-dark-background"
                          >
                              Sign In
                          </button>
                      </form>

                      <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-gray-400/30"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                              <span className="px-3 bg-white/50 dark:bg-black/50 text-light-text/80 dark:text-dark-text/80 backdrop-blur-sm">
                                  Or continue with
                              </span>
                          </div>
                      </div>

                      {socialLogins}

                      <p className="text-center text-sm">
                          Not a member?{' '}
                          <button type="button" onClick={() => setIsCreatingAccount(true)} className="font-semibold text-light-accent dark:text-dark-accent hover:underline">
                              Create New Account
                          </button>
                      </p>
                  </div>
              )}
          </div>
      </div>
    );
};


// --- Main App Pages & Layout ---
const Sidebar: React.FC = () => {
    const { currentPage, setCurrentPage, setActiveProject } = useAppContext();
    const navItems = [
        { name: 'Home', icon: HomeIcon, page: 'home' as Page, tooltip: 'Go to Home (G then H)' },
        { name: 'Chat', icon: ChatIcon, page: 'chat' as Page, tooltip: 'Start a new chat (G then C)' },
        { name: 'Search', icon: SearchIcon, page: 'search' as Page, tooltip: 'Search everything (Mod+K)' },
        { name: 'Projects', icon: ProjectsIcon, page: 'projects' as Page, tooltip: 'View your projects (G then P)' },
    ];
    
    const handleNav = (page: Page) => {
        setActiveProject(null);
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col h-full bg-light-card/80 dark:bg-dark-card/50 backdrop-blur-md border-r border-light-border dark:border-dark-border transition-colors duration-400 ease-in-out">
            <div className="p-6 mb-4 flex justify-center">
                 <Logo />
            </div>
            <nav className="flex-1 space-y-2 px-4">
                {navItems.map(item => (
                    <button 
                        key={item.name}
                        title={item.tooltip}
                        onClick={() => handleNav(item.page)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-300 group ${
                            currentPage === item.page
                                ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background font-semibold shadow-md'
                                : 'hover:bg-black/5 dark:hover:bg-white/5 text-light-text dark:text-dark-text'
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>
            <div className="h-20 p-4 border-t border-light-border dark:border-dark-border">
                {/* Placeholder for future sidebar actions */}
            </div>
        </div>
    );
};

const Header: React.FC = () => {
    const { logout, setCurrentPage, userProfile, notifications, markAllNotificationsAsRead, markNotificationAsRead, setActiveProject, projects } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    
    const hasUnreadNotifications = useMemo(() => notifications.some(n => !n.isRead), [notifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        markNotificationAsRead(notification.id);
  
        if (notification.link) {
            if (notification.link === 'projects' && notification.contextId) {
                const projectToActivate = projects.find(p => p.id === notification.contextId);
                if (projectToActivate) {
                    setActiveProject(projectToActivate);
                }
            }
            setCurrentPage(notification.link);
        }
        setIsNotificationsOpen(false);
      };

    const notificationIcons = {
        project: <ProjectsIcon className="w-5 h-5 text-blue-500" />,
        task: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
        general: <LightbulbIcon className="w-5 h-5 text-yellow-500" />,
    };

    return (
        <header className="flex items-center justify-end p-4 bg-transparent">
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                <div className="relative" ref={notificationsRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(prev => !prev)}
                        className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-light-text dark:text-dark-text"
                    >
                        <NotificationIcon />
                        {hasUnreadNotifications && (
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-light-background dark:border-dark-background"></span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-light-card dark:bg-dark-card rounded-lg shadow-xl border border-light-border dark:border-dark-border z-20 animate-fade-up" style={{ animationDuration: '0.2s' }}>
                            <div className="flex justify-between items-center p-3 border-b border-light-border dark:border-dark-border">
                                <h3 className="font-bold">Notifications</h3>
                                <button 
                                    onClick={markAllNotificationsAsRead}
                                    className="text-sm font-semibold text-light-accent dark:text-dark-accent hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!hasUnreadNotifications}
                                >
                                    Mark all as read
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <button 
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`w-full text-left flex items-start gap-3 p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${!n.isRead ? '' : 'opacity-60'}`}
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {notificationIcons[n.type]}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{n.text}</p>
                                                <p className="text-xs opacity-70">{n.timestamp}</p>
                                            </div>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2 ml-auto"></div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center p-6 text-sm opacity-70">
                                        You have no new notifications.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} title="Profile" className="w-10 h-10 rounded-full hover:ring-2 ring-light-accent dark:ring-dark-accent transition-all flex items-center justify-center bg-light-accent/20 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent overflow-hidden">
                       {userProfile.avatar ? (
                            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className='font-bold'>{getInitials(userProfile.name)}</span>
                        )}
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card rounded-lg shadow-xl border border-light-border dark:border-dark-border z-20 animate-fade-up" style={{ animationDuration: '0.2s' }}>
                            <div className="py-1">
                                <button
                                    onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }}
                                    className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    <span>My Profile</span>
                                </button>
                                <button
                                    onClick={() => { logout(); setIsMenuOpen(false); }}
                                    className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <LogoutIcon className="w-4 h-4" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const HomePage: React.FC = () => {
    const { userProfile, projects, setActiveProject, setCurrentPage, tasks, toggleTask, notes, addNote, openQuickAdd, notifications } = useAppContext();
    const [newNote, setNewNote] = useState('');

    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(today);

    const stats = useMemo(() => ({
        activeProjects: projects.filter(p => p.status === 'Active').length,
        tasksDue: tasks.filter(t => !t.completed && (t.dueDate === 'Today' || t.dueDate === 'Tomorrow')).length,
        unreadNotifications: notifications.filter(n => !n.isRead).length,
        completedProjects: projects.filter(p => p.status === 'Completed').length,
    }), [projects, tasks, notifications]);

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNote.trim()) {
            addNote({ text: newNote });
            setNewNote('');
        }
    };
    
    const StatCard: React.FC<{ icon: React.ReactNode, value: number, title: string, color: string, onClick?: () => void }> = ({ icon, value, title, color, onClick }) => (
        <div onClick={onClick} className={`relative flex items-center p-4 rounded-xl shadow-sm border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}>
            <div className={`absolute -left-4 -top-4 w-16 h-16 rounded-full opacity-10 ${color}`}></div>
            <div className={`p-3 rounded-lg mr-4 ${color} text-white`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm opacity-70">{title}</p>
            </div>
        </div>
    );
    
    const uncompletedTasks = useMemo(() => tasks.filter(t => !t.completed).slice(0, 5), [tasks]);
    const recentProjects = useMemo(() => projects.slice(0, 4), [projects]);

    return (
        <div className="p-8 h-full overflow-y-auto relative">
            {/* Header */}
            <div className="animate-fade-up">
                <h1 className="text-4xl font-bold text-light-text dark:text-dark-text">Welcome back, {userProfile.name.split(' ')[0]}!</h1>
                <p className="text-lg text-light-text/70 dark:text-dark-text/70 mt-1 mb-8">{formattedDate}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <StatCard icon={<ProjectsIcon />} value={stats.activeProjects} title="Active Projects" color="bg-blue-500" onClick={() => setCurrentPage('projects')} />
                <StatCard icon={<ClockIcon />} value={stats.tasksDue} title="Tasks Due Soon" color="bg-orange-500" />
                <StatCard icon={<NotificationIcon />} value={stats.unreadNotifications} title="Unread Alerts" color="bg-red-500" />
                <StatCard icon={<CheckCircleIcon />} value={stats.completedProjects} title="Completed Projects" color="bg-green-500" onClick={() => setCurrentPage('projects')} />
            </div>
            
            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Projects Card */}
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-xl font-bold mb-4">Recent Projects</h3>
                        <div className="space-y-3">
                            {recentProjects.length > 0 ? recentProjects.map(p => (
                                <div key={p.id} onClick={() => { setCurrentPage('projects'); setActiveProject(p); }} className="p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-light-accent dark:text-dark-accent">{p.title}</p>
                                        <p className="text-sm text-light-text/60 dark:text-dark-text/60 line-clamp-1">{p.description}</p>
                                    </div>
                                    {p.isPinned && <PinSolidIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <ProjectsIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>
                                    <p className="text-light-text/60 dark:text-dark-text/60">No recent projects yet.</p>
                                    <button onClick={() => setCurrentPage('projects')} className="mt-2 text-sm font-semibold text-light-accent dark:text-dark-accent hover:underline">Start a new project</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Tasks Card */}
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Upcoming Tasks</h3>
                            <button onClick={openQuickAdd} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-light-accent dark:text-dark-accent"><PlusIcon/></button>
                        </div>
                        <div className="space-y-2">
                            {uncompletedTasks.length > 0 ? uncompletedTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={task.completed} 
                                            onChange={() => toggleTask(task.id)}
                                            className="h-5 w-5 rounded-full border-gray-400/50 text-green-500 focus:ring-green-400 cursor-pointer"
                                        />
                                        <div className="ml-3">
                                            <p className="font-medium">{task.text}</p>
                                            <p className="text-sm text-light-text/60 dark:text-dark-text/60">{task.dueDate}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <CheckCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>
                                    <p className="text-light-text/60 dark:text-dark-text/60">You're all caught up!</p>
                                    <button onClick={openQuickAdd} className="mt-2 text-sm font-semibold text-light-accent dark:text-dark-accent hover:underline">Add a new task</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Notes Card */}
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border animate-fade-up lg:h-full flex flex-col" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-xl font-bold mb-4">Quick Notes</h3>
                    <form onSubmit={handleAddNote} className="mb-4">
                        <textarea 
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="What's on your mind?"
                            rows={3}
                            className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md focus:outline-none focus:border-light-accent dark:focus:border-dark-accent"
                        />
                        <button type="submit" className="w-full mt-2 py-2 font-semibold text-white rounded-lg bg-light-accent dark:bg-dark-accent hover:opacity-90 dark:text-dark-background transition-colors">Add Note</button>
                    </form>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {notes.slice(0, 4).map(note => (
                            <div key={note.id} className="p-3 bg-yellow-500/10 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 line-clamp-2">{note.text}</p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400/70 mt-1">{note.timestamp}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={openQuickAdd}
                className="fixed bottom-8 right-8 z-20 w-16 h-16 bg-light-accent dark:bg-dark-accent rounded-full text-white dark:text-dark-background shadow-lg dark:shadow-dark-accent/30 hover:shadow-xl dark:hover:shadow-dark-accent/50 flex items-center justify-center transition-transform hover:scale-110 dark:animate-glow"
                title="Quick Add Idea/Task (Mod+Shift+A)"
            >
                <LightbulbIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { userProfile, updateUserProfile } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(userProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({ ...formData, avatar: event.target?.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserProfile(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(userProfile);
        setIsEditing(false);
    };
    
    useEffect(() => {
      if (!isEditing) {
        setFormData(userProfile);
      }
    }, [userProfile, isEditing]);

    const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-full">{icon}</div>
            <div>
                <p className="text-sm font-semibold opacity-70">{label}</p>
                <p className="text-lg">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 h-full overflow-y-auto animate-fade-up">
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>
            <div className="max-w-2xl mx-auto bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
                
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-light-accent/20 dark:bg-dark-accent/20 flex items-center justify-center text-4xl font-bold text-light-accent dark:text-dark-accent overflow-hidden border-4 border-light-card dark:border-dark-card shadow-inner">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{getInitials(formData.name)}</span>
                            )}
                        </div>
                        {isEditing && (
                            <>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background rounded-full hover:opacity-90 transition-all shadow-md"
                                    title="Change profile picture"
                                >
                                    <CameraIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div className="space-y-6">
                        {isEditing ? (
                            <>
                                <InputWithIcon icon={<UserIcon />} placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                <InputWithIcon icon={<EmailIcon />} placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                <InputWithIcon icon={<PhoneIcon />} placeholder="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </>
                        ) : (
                            <>
                                <InfoRow icon={<UserIcon className="text-light-text/80 dark:text-dark-text/80" />} label="Full Name" value={userProfile.name} />
                                <InfoRow icon={<EmailIcon className="text-light-text/80 dark:text-dark-text/80" />} label="Email Address" value={userProfile.email} />
                                <InfoRow icon={<PhoneIcon className="text-light-text/80 dark:text-dark-text/80" />} label="Phone Number" value={userProfile.phone} />
                            </>
                        )}
                    </div>
                    <div className="flex justify-end items-center space-x-4 mt-8 pt-6 border-t border-light-border dark:border-dark-border">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-lg font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancel</button>
                                <button type="submit" className="flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold text-white dark:text-dark-background bg-light-accent dark:bg-dark-accent hover:opacity-90 transition-all">
                                    <CheckIcon className="w-5 h-5"/>
                                    <span>Save Changes</span>
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold text-white dark:text-dark-background bg-light-accent dark:bg-dark-accent hover:opacity-90 transition-all">
                                <EditIcon className="w-5 h-5" />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { deleteProject, updateProject, setActiveProject } = useAppContext();
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cardRef.current) {
            cardRef.current.style.opacity = '0';
            cardRef.current.style.transform = 'scale(0.9)';
        }
        setTimeout(() => deleteProject(project.id), 500);
    };
    
    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateProject({ ...project, isPinned: !project.isPinned });
    }

    const handleStatusChange = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = project.status === 'Active' ? 'Completed' : 'Active';
        updateProject({ ...project, status: newStatus });
    }

    const priorityColors = {
        High: 'bg-red-500/20 text-red-500 dark:bg-red-500/10 dark:text-red-400',
        Medium: 'bg-orange-500/20 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400',
        Low: 'bg-blue-500/20 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
    };

    return (
        <div 
            ref={cardRef} 
            onClick={() => setActiveProject(project)} 
            className={`bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-light-border dark:border-dark-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer animate-fade-up ${project.status === 'Completed' ? 'opacity-60' : ''}`}
        >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-1 pr-2 line-clamp-1">{project.title}</h3>
              <button onClick={handlePin} className="p-1 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors flex-shrink-0">
                  {project.isPinned ? <PinSolidIcon className="text-yellow-500"/> : <PinIcon />}
              </button>
            </div>
            <p className="text-sm opacity-50 mb-3">{project.category}</p>
            <p className="opacity-80 mb-4 line-clamp-2 h-10">{project.description}</p>
            <div className="flex items-center space-x-2 text-sm opacity-70 mb-4">
                <ClockIcon className="w-4 h-4" />
                <span>Deadline: {project.deadline}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColors[project.priority]}`}>{project.priority}</span>
                <div className="flex space-x-2">
                    <button onClick={handleStatusChange} title={project.status === 'Active' ? "Mark as Completed" : "Mark as Active"} className="p-2 rounded-full hover:bg-green-500/20 text-green-500 transition-colors">
                        <CheckCircleIcon className={project.status === 'Completed' ? 'text-green-500' : 'text-gray-400'} />
                    </button>
                    <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors">
                        <DeleteIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProjectDetail: React.FC = () => {
    const { activeProject, setActiveProject, updateProject, showToast, language, openExportModal } = useAppContext();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeProject?.chatHistory]);

    if (!activeProject) return null;

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
        const updatedHistory = [...activeProject.chatHistory, userMessage];
        updateProject({ ...activeProject, chatHistory: updatedHistory });
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await generateChatResponse(input, language);
            const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
            updateProject({ ...activeProject, chatHistory: [...updatedHistory, aiMessage] });
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: 'An error occurred. Please try again.' };
            updateProject({ ...activeProject, chatHistory: [...updatedHistory, errorMessage] });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSummary = async () => {
        setIsLoading(true);
        showToast("Generating summary...");
        const chatText = activeProject.chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
        const summary = await summarizeText(chatText);
        const summaryMessage: ChatMessage = { id: Date.now().toString(), sender: 'ai', text: `Project Summary:\n${summary}`};
        updateProject({ ...activeProject, chatHistory: [...activeProject.chatHistory, summaryMessage] });
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col h-full p-4 animate-fade-up">
            <div className="flex items-center mb-4 border-b border-light-border dark:border-dark-border pb-4">
                <button onClick={() => setActiveProject(null)} className="mr-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><BackIcon /></button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{activeProject.title}</h1>
                    <p className="text-sm opacity-60">{activeProject.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleSummary} disabled={isLoading} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors disabled:opacity-50">Summarize</button>
                    <button title="Edit Project" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><EditIcon /></button>
                    <button title="Export Project Data" onClick={openExportModal} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><ExportIcon /></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                {activeProject.chatHistory.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background' : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border'}`}>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xl p-4 rounded-2xl bg-light-card dark:bg-dark-card flex items-center space-x-2">
                           <SpinnerIcon /> <span>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex items-center space-x-2 p-2 bg-light-card dark:bg-dark-card rounded-xl shadow-md border border-light-border dark:border-dark-border">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Continue the conversation..." className="flex-1 bg-transparent focus:outline-none px-2 py-1" disabled={isLoading} />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background disabled:opacity-50 transition-all"><SendIcon /></button>
            </div>
        </div>
    )
}

const ProjectsPage: React.FC = () => {
    const { projects, activeProject, openModal } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

    const filteredAndSortedProjects = useMemo(() => {
        let tempProjects = [...projects];

        if (activeFilter !== 'all') {
            tempProjects = tempProjects.filter(p => p.status.toLowerCase() === activeFilter);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            tempProjects = tempProjects.filter(p => 
                p.title.toLowerCase().includes(lowerCaseQuery) ||
                p.description.toLowerCase().includes(lowerCaseQuery)
            );
        }

        return tempProjects.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                           .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    }, [projects, searchQuery, activeFilter]);
    
    if (activeProject) return <ProjectDetail />;

    return (
        <div className="p-8 h-full overflow-y-auto animate-fade-up">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-4xl font-bold">Projects</h1>
                <button
                    onClick={openModal}
                    className="flex items-center justify-center space-x-2 px-5 py-3 rounded-lg font-semibold text-white dark:text-dark-background bg-light-accent dark:bg-dark-accent hover:opacity-90 transition-all duration-300 group shadow-md dark:shadow-dark-accent/20 hover:shadow-lg dark:hover:shadow-dark-accent/40 hover:animate-pop"
                >
                    <PlusIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                    <span>Start New Project</span>
                </button>
            </div>
            
            <div className="mb-6 p-4 bg-light-card/80 dark:bg-dark-card/50 backdrop-blur-sm rounded-lg border border-light-border dark:border-dark-border">
                <b className="font-bold block mb-3 text-lg">Filter & Search</b>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-5 h-5"/></span>
                        <input 
                            type="text"
                            placeholder="Search by name or description..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors"
                        />
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {(['all', 'active', 'completed'] as const).map(f => (
                            <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 text-sm font-semibold rounded-md capitalize transition-colors ${activeFilter === f ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredAndSortedProjects.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-lg opacity-70">No projects match your criteria. Try adjusting your filters or starting a new project!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedProjects.map(project => <ProjectCard key={project.id} project={project} />)}
                </div>
            )}
        </div>
    );
};

const AiMessageContent: React.FC<{ text: string }> = ({ text }) => {
    const paragraphs = text.split(/\n\s*\n/).filter(line => line.trim() !== '');
  
    const parsedParagraphs = paragraphs.map((paragraph, index) => {
        const match = paragraph.match(/^(\d+\.\s*)\*\*(.*?):\*\*\s?(.*)/s);
        if (match) {
          const [, number, subtitle, explanation] = match;
          return (
            <p key={index} className="mb-1 last:mb-0">
              <span className="font-semibold">{number}</span>
              <strong className="font-bold">{subtitle}:</strong>
              {' '}
              {explanation.trim()}
            </p>
          );
        }
        return <p key={index} className="mb-1 last:mb-0">{paragraph}</p>;
      });
  
    return (
      <div className="space-y-3 font-sans text-light-text dark:text-dark-text">
        {parsedParagraphs}
      </div>
    );
};
  
const ChatPage: React.FC = () => {
    const { showToast, language, setLanguage, userProfile } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const [speakingMessage, setSpeakingMessage] = useState<{ id: string, isPaused: boolean } | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    
    useEffect(() => {
        const synth = window.speechSynthesis;
        const updateVoices = () => {
            setVoices(synth.getVoices());
        };
        
        synth.onvoiceschanged = updateVoices;
        updateVoices();

        return () => {
            synth.onvoiceschanged = null;
            synth.cancel();
        };
    }, []);

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input, lang: language };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
  
        try {
            const aiResponseText = await generateChatResponse(currentInput, language);
            const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText, lang: language };
            setMessages(prev => [...prev, aiMessage]);
            showToast("Your Learnio.AI answer is ready!", 'info');
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: 'An error occurred. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleListen = () => {
        if (isListening) {
            speechRecognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("Sorry, voice recognition is not supported in your browser.", 'error');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'en' ? 'en-US' : 'ta-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
    };

    const handlePlayPause = (message: ChatMessage) => {
        const synth = window.speechSynthesis;
        if (speakingMessage?.id === message.id) {
            if (speakingMessage.isPaused) {
                synth.resume();
                setSpeakingMessage({ id: message.id, isPaused: false });
            } else {
                synth.pause();
                setSpeakingMessage({ id: message.id, isPaused: true });
            }
        } else {
            // Fix: Check if any voice is available for the selected language
            const hasVoice = voices.some(voice => voice.lang.startsWith(message.lang));
            if (!hasVoice) {
                const langName = message.lang === 'ta' ? 'Tamil' : 'English';
                showToast(`🔈 ${langName} voice is not available on your device/browser.`, 'error');
                return;
            }

            synth.cancel();
            const textToSpeak = message.text.replace(/\*\*(.*?):\*\*/g, '$1:');
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            
            // Fix: Set language code, prefer US English for wider compatibility
            const langCode = message.lang === 'ta' ? 'ta-IN' : 'en-US';
            utterance.lang = langCode;
            
            // Fix: Find the best available voice, prioritizing local voices
            let selectedVoice = voices.find(v => v.lang === langCode && v.localService);
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang === langCode);
            }
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.startsWith(message.lang) && v.localService);
            }
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.startsWith(message.lang));
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.onend = () => setSpeakingMessage(null);
            // Fix: Implement robust error handling for speech synthesis
            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                console.error(`Speech synthesis error: ${e.error}`, e);
                setSpeakingMessage(null);
                let errorMessage = 'Sorry, an unknown text-to-speech error occurred.';
                switch (e.error) {
                    case 'not-allowed':
                        errorMessage = 'Speech synthesis is not allowed. Please check permissions.';
                        break;
                    case 'synthesis-unavailable':
                    case 'language-unavailable':
                    case 'voice-unavailable':
                        errorMessage = 'The requested language or voice is not available.';
                        break;
                    case 'synthesis-failed':
                        errorMessage = 'Speech synthesis failed to start.';
                        break;
                    case 'network':
                        errorMessage = 'A network error occurred during speech synthesis.';
                        break;
                }
                showToast(errorMessage, 'error');
            };
            synth.speak(utterance);
            utteranceRef.current = utterance;
            setSpeakingMessage({ id: message.id, isPaused: false });
        }
    };
    
    const handleStop = () => {
        window.speechSynthesis.cancel();
        setSpeakingMessage(null);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text.replace(/\*\*(.*?):\*\*/g, '$1:'));
        showToast('Answer copied to clipboard!');
    };

    const handleNewChat = () => {
        setMessages([]);
        setInput('');
        setIsLoading(false);
        handleStop();
    };
  
    return (
        <div className="flex h-full animate-fade-up font-sans">
            <div className="hidden md:flex w-72 h-full bg-light-card/60 dark:bg-dark-card/40 backdrop-blur-sm border-r border-light-border dark:border-dark-border p-4 flex-col">
                 <button
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold text-white dark:text-dark-background bg-light-accent dark:bg-dark-accent hover:opacity-90 transition-all duration-300 group shadow-md"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>New Chat</span>
                </button>
            </div>
            <div className="flex-1 flex flex-col h-full p-2 sm:p-4">
                <div className="flex-1 overflow-y-auto pr-2 sm:pr-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.length === 0 && !isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-light-text/70 dark:text-dark-text/70 pt-20">
                                <div className="p-4 bg-light-card dark:bg-dark-card rounded-full mb-4 border border-light-border dark:border-dark-border">
                                   <Logo />
                                </div>
                                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">How can I help you today?</h2>
                                <div className='my-4 p-2 bg-light-card dark:bg-dark-card rounded-full border border-light-border dark:border-dark-border flex items-center gap-2'>
                                    <button onClick={() => setLanguage('en')} className={`p-2 rounded-full ${language === 'en' ? 'bg-light-accent/20 dark:bg-dark-accent/20' : ''}`}><EnglishFlagIcon/></button>
                                    <button onClick={() => setLanguage('ta')} className={`p-2 rounded-full ${language === 'ta' ? 'bg-light-accent/20 dark:bg-dark-accent/20' : ''}`}><TamilFlagIcon/></button>
                                </div>
                            </div>
                        )}
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-light-accent dark:bg-dark-accent flex-shrink-0 mt-2 hidden sm:block"/>}
                                <div className={`max-w-full md:max-w-2xl p-4 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background' : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border animate-fade-up leading-relaxed'}`}>
                                    {msg.sender === 'ai' ? <AiMessageContent text={msg.text} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    {msg.sender === 'ai' && (
                                        <div className="flex items-center space-x-1 mt-3 pt-2 border-t border-black/10 dark:border-white/10">
                                            {speakingMessage?.id !== msg.id ? (
                                                <button onClick={() => handlePlayPause(msg)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Read aloud">
                                                    <SpeakerIcon />
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => handlePlayPause(msg)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title={speakingMessage.isPaused ? "Resume" : "Pause"}>
                                                        {speakingMessage.isPaused ? <PlayIcon /> : <PausedWaveIcon />}
                                                    </button>
                                                    <button onClick={handleStop} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Stop">
                                                        <StopIcon />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleCopy(msg.text)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Copy text">
                                                <CopyIcon />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {msg.sender === 'user' && 
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 mt-2 hidden sm:flex items-center justify-center bg-gray-200 dark:bg-gray-700 font-bold text-sm">
                                        {getInitials(userProfile.name)}
                                    </div>
                                }
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-light-accent dark:bg-dark-accent flex-shrink-0 mt-2 hidden sm:block"/>
                                <div className="max-w-2xl p-4 rounded-2xl bg-light-card dark:bg-dark-card flex items-center space-x-2 border border-light-border dark:border-dark-border">
                                <SpinnerIcon /> <span>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="mt-4 max-w-3xl mx-auto w-full">
                    <div className="relative flex items-center p-2 bg-light-card dark:bg-dark-card rounded-xl shadow-md border border-light-border dark:border-dark-border">
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSend();}}} placeholder="Ask me anything..." rows={1} className="flex-1 bg-transparent focus:outline-none px-2 py-1 resize-none max-h-32" disabled={isLoading} />
                        <button onClick={handleListen} className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} disabled={isLoading}>
                            <MicrophoneIcon />
                        </button>
                        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background disabled:opacity-50 transition-all ml-1"><SendIcon /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SearchPage: React.FC = () => {
    const { projects, setActiveProject, setCurrentPage, language, searchHistory, addSearchToHistory, clearSearchHistory } = useAppContext();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'projects' | 'chats'>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const searchResults = useMemo(() => {
        if (!query) return [];
        const lowerCaseQuery = query.toLowerCase();
        const results: { type: 'project' | 'chat'; item: Project; message?: ChatMessage }[] = [];

        if (filter === 'all' || filter === 'projects') {
            projects.forEach(p => {
                if (p.title.toLowerCase().includes(lowerCaseQuery) || p.description.toLowerCase().includes(lowerCaseQuery)) {
                    results.push({ type: 'project', item: p });
                }
            });
        }
        if (filter === 'all' || filter === 'chats') {
            projects.forEach(p => {
                p.chatHistory.forEach(msg => {
                    if (msg.text.toLowerCase().includes(lowerCaseQuery) && !results.some(r => r.type === 'chat' && r.message?.id === msg.id)) {
                        results.push({ type: 'chat', item: p, message: msg });
                    }
                });
            });
        }
        return results;
    }, [query, filter, projects]);
    
    const handleSearchAI = useCallback(async () => {
      if (searchResults.length === 0 && query.trim()) {
          setIsLoading(true);
          setAiResponse(null);
          const response = await generateChatResponse(`The user searched for "${query}" and found no results. Provide a helpful response or alternative suggestions.`, language);
          setAiResponse(response);
          setIsLoading(false);
      } else {
          setIsLoading(false);
          setAiResponse(null);
      }
    }, [query, searchResults, language]);

    useEffect(() => {
      const debounceTimer = setTimeout(() => {
          if (query.trim()) {
              addSearchToHistory(query.trim());
          }
          handleSearchAI();
      }, 1000);
      return () => clearTimeout(debounceTimer);
    }, [query, addSearchToHistory, handleSearchAI]);

    const handleResultClick = (result: { type: 'project' | 'chat'; item: Project }) => {
        setCurrentPage('projects');
        setActiveProject(result.item);
    }

    return (
        <div className="p-8 h-full flex flex-col animate-fade-up">
            <h1 className="text-4xl font-bold mb-2">Intelligent Search</h1>
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon className="w-5 h-5 text-gray-400" /></div>
                <input 
                    type="text" 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Search your projects, chats, and ideas..." 
                    className="w-full pl-10 pr-12 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition-all" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button className="p-1 text-gray-400 hover:text-light-text dark:hover:text-dark-text"><MicrophoneIcon className="w-5 h-5"/></button>
                </div>
                {isLoading && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-light-accent dark:bg-dark-accent animate-shimmer bg-gradient-to-r from-transparent via-light-accent dark:via-dark-accent to-transparent bg-[length:200%_100%]" />}
                
                {isFocused && !query && searchHistory.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-light-card dark:bg-dark-card rounded-lg shadow-lg border border-light-border dark:border-dark-border z-10 p-2 animate-fade-up" style={{ animationDuration: '0.2s' }}>
                        <div className="flex justify-between items-center px-2 pb-2 border-b border-light-border dark:border-dark-border">
                            <h4 className="text-sm font-semibold opacity-70">Recent Searches</h4>
                            <button onClick={clearSearchHistory} className="text-xs font-semibold text-light-accent dark:text-dark-accent hover:underline">Clear</button>
                        </div>
                        <ul className="mt-1 max-h-60 overflow-y-auto">
                            {searchHistory.map((item, index) => (
                                <li key={index}>
                                    <button 
                                        onClick={() => setQuery(item)}
                                        className="w-full text-left px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between group"
                                    >
                                        <span className="truncate">{item}</span>
                                        <ClockIcon className="w-4 h-4 opacity-50 flex-shrink-0 ml-2 group-hover:opacity-80" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="flex space-x-2 mb-6">
                {(['all', 'projects', 'chats'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize transition-colors ${filter === f ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20'}`}>
                        {f === 'all' ? 'All' : f}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {searchResults.length > 0 ? (
                    <div className="space-y-3">
                        {searchResults.map((result, index) => (
                            <div key={index} onClick={() => handleResultClick(result)} className="p-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg cursor-pointer hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors">
                                {result.type === 'project' && (
                                    <div className="flex items-center space-x-3">
                                        <ProjectsIcon className="w-5 h-5 text-light-accent dark:text-dark-accent flex-shrink-0" />
                                        <div>
                                            <p className="font-bold">{result.item.title}</p>
                                            <p className="text-sm opacity-70 line-clamp-1">{result.item.description}</p>
                                        </div>
                                    </div>
                                )}
                                {result.type === 'chat' && result.message && (
                                     <div className="flex items-start space-x-3">
                                        <ChatIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm opacity-70">From project: <span className="font-semibold">{result.item.title}</span></p>
                                            <p className="bg-black/5 dark:bg-white/5 p-2 rounded mt-1">"{result.message.text}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : query && (isLoading ? (
                    <div className="flex justify-center items-center h-full"><SpinnerIcon /> <span className="ml-2">AI is thinking...</span></div>
                ) : aiResponse ? (
                     <div className="p-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
                        <p className="font-bold mb-2">AI Assistant</p>
                        <AiMessageContent text={aiResponse} />
                    </div>
                ) : null)}
            </div>
        </div>
    );
};

const ProjectForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addProject } = useAppContext();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '' as Project['category'],
        deadline: '',
        priority: 'Medium' as Project['priority'],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.category) return;
        addProject(formData);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <div>
                <label className="block text-sm font-medium mb-1">Project Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md" rows={3}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Project['category'] })} className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md" required>
                        <option value="" disabled>Select</option>
                        <option>Education</option>
                        <option>Work</option>
                        <option>Research</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Deadline</label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <div className="flex space-x-2">
                    {(['Low', 'Medium', 'High'] as const).map(p => (
                        <button type="button" key={p} onClick={() => setFormData({...formData, priority: p})} className={`px-4 py-2 text-sm font-semibold rounded-md capitalize transition-colors ${formData.priority === p ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-background' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg font-semibold text-white dark:text-dark-background bg-light-accent dark:bg-dark-accent hover:opacity-90">Create Project</button>
            </div>
        </form>
    );
};

const QuickAddModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addTask, addNote } = useAppContext();
    const [type, setType] = useState<'task' | 'note'>('task');
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text) return;
        if (type === 'task') {
            addTask({ text, dueDate });
        } else {
            addNote({ text });
        }
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Quick Add</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><CloseIcon /></button>
                </div>
                <div className="flex space-x-2 border-b border-light-border dark:border-dark-border mb-4">
                    <button onClick={() => setType('task')} className={`px-4 py-2 font-semibold border-b-2 ${type === 'task' ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent' : 'border-transparent text-gray-500'}`}>Task</button>
                    <button onClick={() => setType('note')} className={`px-4 py-2 font-semibold border-b-2 ${type === 'note' ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent' : 'border-transparent text-gray-500'}`}>Note</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'task' ? (
                        <>
                            <input type="text" placeholder="What needs to be done?" value={text} onChange={e => setText(e.target.value)} className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md" />
                            <input type="text" placeholder="Due date (e.g., 'Tomorrow')" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md" />
                        </>
                    ) : (
                        <textarea placeholder="Jot down a quick thought or idea..." value={text} onChange={e => setText(e.target.value)} rows={4} className="w-full p-2 bg-light-background dark:bg-dark-background border-2 border-light-border dark:border-dark-border rounded-md"></textarea>
                    )}
                     <div className="flex justify-end">
                        <button type="submit" className="px-5 py-2 rounded-lg font-semibold text-white dark:text-dark-background bg-light-accent dark:bg-dark-accent hover:opacity-90">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const ExportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { showToast, activeProject } = useAppContext();

    if (!activeProject) return null;

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleJsonExport = () => {
        const dataStr = JSON.stringify(activeProject, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        downloadBlob(blob, `${activeProject.title.replace(/\s/g, '_')}.json`);
        showToast('Project exported as JSON.', 'success');
        onClose();
    };

    const handleCsvExport = () => {
        if (!activeProject.chatHistory.length) {
            showToast('No chat history to export.', 'info');
            return;
        }

        const headers = ['id', 'sender', 'text'];
        const escapeCsvField = (field: string) => `"${field.replace(/"/g, '""')}"`;
        const rows = activeProject.chatHistory.map(msg => 
            [msg.id, msg.sender, escapeCsvField(msg.text)].join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${activeProject.title.replace(/\s/g, '_')}_chat_history.csv`);
        showToast('Chat history exported as CSV.', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Export Project Data</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><CloseIcon /></button>
                </div>
                <p className="mb-6 opacity-80">Choose a format to download your project data. The JSON file contains all project details including chat history. The CSV file contains only the chat history.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        onClick={handleJsonExport}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white dark:text-dark-background bg-blue-500 hover:bg-blue-600 transition-colors"
                    >
                        <ExportIcon className="w-5 h-5" />
                        <span>Download as JSON</span>
                    </button>
                    <button 
                        onClick={handleCsvExport}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white dark:text-dark-background bg-green-500 hover:bg-green-600 transition-colors"
                    >
                         <ExportIcon className="w-5 h-5" />
                        <span>Download Chat as CSV</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Toast: React.FC<{ message: string, type: ToastType, onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    const toastStyles = {
        success: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-400',
        info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-400',
        error: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-400',
    };
    return (
        <div className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg border-l-4 flex items-center space-x-3 animate-fade-up ${toastStyles[type]}`}>
            <span>{message}</span>
            <button onClick={onDismiss}><CloseIcon className="w-4 h-4" /></button>
        </div>
    );
};

const Modal: React.FC<{ isOpen: boolean, onClose: () => void, children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-up">
                <div className="flex justify-end">
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 absolute top-4 right-4"><CloseIcon /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const { isLoggedIn, currentPage, isModalOpen, closeModal, isQuickAddOpen, closeQuickAdd, toastMessage, showToast, isForgotPasswordOpen, closeForgotPassword, setCurrentPage, openQuickAdd, isExportModalOpen, closeExportModal } = useAppContext();
    const pages: Record<Page, React.FC> = {
        home: HomePage,
        chat: ChatPage,
        projects: ProjectsPage,
        search: SearchPage,
        profile: ProfilePage,
    };
    const CurrentPageComponent = pages[currentPage];
    
    // Fix: Prevent re-rendering on every key press by memoizing hotkeys
    const hotkeys = useMemo(() => [
      { combo: 'g h', callback: () => setCurrentPage('home') },
      { combo: 'g c', callback: () => setCurrentPage('chat') },
      { combo: 'g p', callback: () => setCurrentPage('projects') },
      { combo: 'g s', callback: () => setCurrentPage('search') },
      { combo: 'mod+k', callback: () => setCurrentPage('search') },
      { combo: 'mod+shift+a', callback: openQuickAdd }
    ], [setCurrentPage, openQuickAdd]);
  
    useHotkeys(hotkeys);

    useEffect(() => {
        const hasShownToast = localStorage.getItem('hotkeyToastShown');
        if (isLoggedIn && !hasShownToast) {
            showToast('Pro Tip: Use keyboard shortcuts like G+H for Home or Mod+K for search!', 'info');
            localStorage.setItem('hotkeyToastShown', 'true');
        }
    }, [isLoggedIn, showToast]);


    if (!isLoggedIn) return <LoginPage />;
  
    return (
        <div className="h-screen w-screen flex bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text transition-colors duration-400 ease-in-out">
            <div className="w-64 h-full flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto">
                    <CurrentPageComponent />
                </div>
            </main>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ProjectForm onClose={closeModal} />
            </Modal>
            {isQuickAddOpen && <QuickAddModal onClose={closeQuickAdd} />}
            {toastMessage && <Toast message={toastMessage.message} type={toastMessage.type} onDismiss={() => {}} />}
            {isForgotPasswordOpen && <ForgotPasswordModal onClose={closeForgotPassword} />}
            {isExportModalOpen && <ExportModal onClose={closeExportModal} />}
        </div>
    );
};

const Root: React.FC = () => (
    <AppProvider>
        <App />
    </AppProvider>
);

export default Root;