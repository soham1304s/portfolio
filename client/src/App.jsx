import { createElement, useEffect, useRef, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ProjectEditor from './pages/ProjectEditor';
import { useAuth } from './components/auth-context';
import LoginModal from './components/LoginModal';
import ProtectedRoute from './components/ProtectedRoute';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  animate,
  createAnimatable,
  createScope,
  createTimeline,
  stagger,
} from 'animejs';
import {
  ArrowUpRight,
  Download,
  Mail,
  MapPin,
  Menu,
  MoonStar,
  PanelsTopLeft,
  Play,
  ServerCog,
  Smartphone,
  Sparkles,
  SunMedium,
  ChevronDown,
  Volume2,
  Wrench,
  X,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import editorialScene from './assets/editorial-scene.svg';
import resumeFile from './assets/Soham_Mondal_Resume (1) (1).docx?url';
import spotifyPlaceholder from './assets/spotify-placeholder.png';
import { API_BASE_URL } from './lib/apiBaseUrl';
import './App.css';

const THEME_STORAGE_KEY = 'portfolio-theme';
const INITIAL_CONTACT_FORM = {
  name: '',
  email: '',
  message: '',
  website: '',
};
const INITIAL_SPOTIFY_STATE = {
  configured: false,
  isLoading: true,
  message: '',
  playlist: null,
  refreshIntervalMs: 5 * 60 * 1000,
};
const SPOTIFY_FALLBACK_TAGS = ['Spotify Playlist', 'Album Art', 'Artists'];

const MOCK_SPOTIFY_PLAYLIST = {
  id: 'mock-nocturne-flow',
  title: 'Nocturne Flow',
  description: 'A curated selection of late-night coding beats and ambient textures.',
  imageUrl: spotifyPlaceholder,
  ownerName: 'Soham Mondal',
  trackCount: 12,
  availableTrackCount: 3,
  externalUrl: 'https://open.spotify.com',
  hasTracks: true,
  tracks: [
    {
      id: 'mock-1',
      index: 1,
      title: 'Midnight Syntax',
      artistLine: 'Lofi Coder',
      albumName: 'Binary Beats',
      albumImageUrl: spotifyPlaceholder,
      durationMs: 184000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      externalUrl: 'https://open.spotify.com',
    },
    {
      id: 'mock-2',
      index: 2,
      title: 'Ghost in the Shell',
      artistLine: 'Cyberpunk Orchestra',
      albumName: 'Soham Mondal',
      albumImageUrl: spotifyPlaceholder,
      durationMs: 215000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      externalUrl: 'https://open.spotify.com',
    },
    {
      id: 'mock-3',
      index: 3,
      title: 'Compiler Dreams',
      artistLine: 'The Architect',
      albumName: 'Playlist',
      albumImageUrl: spotifyPlaceholder,
      durationMs: 192000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      externalUrl: 'https://open.spotify.com',
    },
    {
      id: 'mock-4',
      index: 4,
      title: 'Neon Nights',
      artistLine: 'Digital Nomad',
      albumName: 'Cyber Drift',
      albumImageUrl: spotifyPlaceholder,
      durationMs: 180000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      externalUrl: 'https://open.spotify.com',
    },
    {
      id: 'mock-5',
      index: 5,
      title: 'Coffee & Code',
      artistLine: 'Morning Routine',
      albumName: 'Daily Grind',
      albumImageUrl: spotifyPlaceholder,
      durationMs: 200000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      externalUrl: 'https://open.spotify.com',
    },
  ],
};

const readApiResponse = async (response) => {
  const rawBody = await response.text();
  const contentType = response.headers.get('content-type') ?? '';

  if (!rawBody) {
    return {
      payload: null,
      rawBody: '',
    };
  }

  if (contentType.includes('application/json')) {
    try {
      return {
        payload: JSON.parse(rawBody),
        rawBody,
      };
    } catch {
      return {
        payload: null,
        rawBody,
      };
    }
  }

  return {
    payload: null,
    rawBody,
  };
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const navItems = [
  { id: 'hey', label: 'Home' },
  { id: 'work', label: 'Projects' },
  { id: 'background', label: 'Background' },
  { id: 'skills', label: 'Skills' },
  { id: 'playlist', label: 'Music' },
  { id: 'chat', label: 'Contact' },
];

const featuredWork = [
  {
    index: '01',
    category: 'CS Platform',
    title: 'INCOODING',
    summary: 'Built a responsive CS practice platform with subject-wise sections and a ~95% accurate chatbot.',
    impact: 'Achieved ~90% code reusability; enabled timed assessments.',
  },
  {
    index: '02',
    category: 'Mobile App',
    title: 'UEM Jaipur Portal',
    summary: 'Cross-platform Flutter app for managing attendance, results, and fees with real-time updates.',
    impact: 'Implemented secure auth, REST APIs, and offline caching.',
  },
  {
    index: '03',
    category: 'E-commerce',
    title: 'WeekendCart',
    summary: 'Full-stack platform with cart, order tracking, and integrated payment methods (UPI, Card, COD).',
    impact: 'Developed UUID-based tracking and delivery estimation.',
  },
];

const storyNotes = [
  {
    title: 'Education',
    copy: 'B.Tech in CSE (2023–Present) @ UEM Jaipur. XII (70%) & X (71%) from Mecheda, WB.',
  },
  {
    title: 'Certifications',
    copy: 'Aptos Bootcamp (2025), Telecom Sector Skill Council, and Certificate of Excellence.',
  },
  {
    title: 'Languages',
    copy: 'Fluent in English, Hindi, and Bengali. Strong technical communication skills.',
  },
];

const skillsOverview = [
  { label: 'Primary strength', value: 'Frontend engineering' },
  { label: 'Preferred stack', value: 'React + Node.js' },
  { label: 'Delivery range', value: 'Responsive web, APIs, and Flutter apps', wide: true },
];

const skills = [
  {
    index: '01',
    category: 'Frontend Systems',
    title: 'Interfaces with clarity and hierarchy',
    summary:
      'React-driven experiences built for responsiveness, deliberate motion, and maintainable component structure.',
    items: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Dart'],
    icon: PanelsTopLeft,
  },
  {
    index: '02',
    category: 'Backend Foundations',
    title: 'APIs that stay dependable under growth',
    summary:
      'Service layers for authentication, real-time updates, and clean server architecture across modern JavaScript stacks.',
    items: ['Node.js', 'Express.js', 'Socket.io', 'MongoDB', 'PostgreSQL'],
    icon: ServerCog,
  },
  {
    index: '03',
    category: 'Mobile Delivery',
    title: 'Cross-platform apps with product polish',
    summary:
      'Flutter applications shaped for Android and iOS with consistent UX and practical backend integration.',
    items: ['Flutter', 'Android', 'iOS'],
    icon: Smartphone,
  },
  {
    index: '04',
    category: 'Tooling & Release',
    title: 'Shipping workflows that reduce friction',
    summary:
      'Deployment and collaboration tooling that keeps projects stable, versioned, and ready for production handoff.',
    items: ['GitHub', 'Firebase', 'Railway', 'Render', 'Cloudinary'],
    icon: Wrench,
  },
];

const formatDurationLabel = (valueInMs) => {
  if (!Number.isFinite(valueInMs) || valueInMs <= 0) {
    return '--:--';
  }

  const totalSeconds = Math.floor(valueInMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

function App() {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const mobileNavPanelRef = useRef(null);
  const mobileNavPanelAnimationRef = useRef(null);
  const mobileNavLinksAnimationRef = useRef(null);
  const mobileNavFrameRef = useRef(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [activeSection, setActiveSection] = useState('hey');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(false);
  const [contactForm, setContactForm] = useState(INITIAL_CONTACT_FORM);
  const [contactStatus, setContactStatus] = useState({
    state: 'idle',
    message: '',
  });
  const [spotifyState, setSpotifyState] = useState(INITIAL_SPOTIFY_STATE);
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'init-1',
      sender: 'Soham',
      text: "Hi there!  I'm Soham. Glad you're here. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const chatScrollRef = useRef(null);
  const trackListShellRef = useRef(null);
  const tracksRef = useRef([]);
  const audioRef = useRef(null);
  const messageDrawerRef = useRef(null);
  const messageDrawerContentRef = useRef(null);
  const isRouteAuthModalOpen = Boolean(location.state?.openLogin);
  const isAuthModalVisible = isAuthModalOpen || isRouteAuthModalOpen;

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);

    if (!isRouteAuthModalOpen) {
      return;
    }

    const nextLocationState = { ...(location.state || {}) };
    delete nextLocationState.openLogin;

    navigate(location.pathname, {
      replace: true,
      state: Object.keys(nextLocationState).length > 0 ? nextLocationState : null,
    });
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const drawer = messageDrawerRef.current;
    const content = messageDrawerContentRef.current;
    if (!drawer || !content) return;

    if (isMessageDrawerOpen) {
      document.body.style.overflow = 'hidden';
      // Fade in backdrop
      animate(drawer, {
        opacity: [0, 1],
        visibility: 'visible',
        duration: 400,
        ease: 'outQuart',
      });
      // Slide in content
      animate(content, {
        translateX: ['100%', '0%'],
        duration: 600,
        ease: 'outExpo',
      });
    } else {
      document.body.style.overflow = '';
      // Slide out content
      animate(content, {
        translateX: '100%',
        duration: 500,
        ease: 'inOutQuart',
      });
      // Fade out backdrop
      animate(drawer, {
        opacity: 0,
        duration: 400,
        delay: 100,
        ease: 'linear',
        onComplete: () => {
          drawer.style.visibility = 'hidden';
        },
      });
    }
  }, [isMessageDrawerOpen]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (event) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'User',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate Soham thinking and replying
    setTimeout(() => {
      setIsTyping(false);
      const reply = {
        id: (Date.now() + 1).toString(),
        sender: 'Soham',
        text: "That sounds interesting! Please leave your email below so I can get back to you with a detailed response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, reply]);
    }, 2000);

    // Send to backend in the background to ensure data is saved
    try {
      await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Chat User',
          email: 'chat@portfolio.com',
          subject: 'Live Chat Message',
          message: chatInput,
        }),
      });
    } catch (err) {
      console.error('Failed to log chat to backend', err);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadSpotifyPlaylist = async ({ background = false } = {}) => {
      if (!background) {
        setSpotifyState((currentState) => ({
          ...currentState,
          isLoading: true,
        }));
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/spotify/playlist`, {
          headers: {
            Accept: 'application/json',
          },
        });
        const { payload } = await readApiResponse(response);

        if (isCancelled) {
          return;
        }

        if (!response.ok || !payload?.configured) {
          // If not configured or error, use mock data but set configured to false
          setSpotifyState({
            configured: false,
            isLoading: false,
            message: payload?.message || 'Showing curated fallback playlist.',
            playlist: MOCK_SPOTIFY_PLAYLIST,
            refreshIntervalMs: INITIAL_SPOTIFY_STATE.refreshIntervalMs,
          });
          return;
        }

        setSpotifyState({
          configured: true,
          isLoading: false,
          message: payload?.message || '',
          playlist: payload?.playlist || MOCK_SPOTIFY_PLAYLIST,
          refreshIntervalMs:
            payload?.refreshIntervalMs || INITIAL_SPOTIFY_STATE.refreshIntervalMs,
        });
      } catch {
        if (isCancelled) {
          return;
        }

        // Network error or server down - use mock data
        setSpotifyState({
          configured: false,
          isLoading: false,
          message: 'Offline mode: Showing curated fallback playlist.',
          playlist: MOCK_SPOTIFY_PLAYLIST,
          refreshIntervalMs: INITIAL_SPOTIFY_STATE.refreshIntervalMs,
        });
      }
    };

    void loadSpotifyPlaylist();

    const intervalId = window.setInterval(() => {
      void loadSpotifyPlaylist({ background: true });
    }, spotifyState.refreshIntervalMs);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [spotifyState.refreshIntervalMs]);

  useEffect(() => {
    const shell = trackListShellRef.current;
    if (!shell) return;

    if (isPlaylistExpanded) {
      // Expand animation
      animate(shell, {
        height: [0, shell.scrollHeight],
        duration: 500,
        ease: 'outExpo',
        onComplete: () => {
          shell.style.height = 'auto';
        },
      });

      // Stagger tracks reveal
      animate(tracksRef.current.filter(Boolean), {
        opacity: [0, 1],
        y: [12, 0],
        delay: stagger(40, { start: 150 }),
        duration: 400,
        ease: 'outQuart',
      });
    } else {
      // Collapse animation
      animate(shell, {
        height: 0,
        duration: 400,
        ease: 'inOutQuart',
      });

      // Hide tracks
      animate(tracksRef.current.filter(Boolean), {
        opacity: 0,
        y: 12,
        duration: 200,
        ease: 'linear',
      });
    }
  }, [isPlaylistExpanded]);

  // Handle playlist expansion state when playlist changes
  const [lastPlaylistId, setLastPlaylistId] = useState(spotifyState.playlist?.id);
  if (spotifyState.playlist?.id !== lastPlaylistId) {
    setLastPlaylistId(spotifyState.playlist?.id);
    setIsPlaylistExpanded(false);
  }

  useEffect(() => {
    // Pulse animation for the "Tap to View" hint
    const pulse = animate('.player-art__hint', {
      scale: [1, 1.05],
      opacity: [0.7, 1],
      duration: 1200,
      direction: 'alternate',
      loop: true,
      ease: 'easeInOutSine',
    });

    return () => pulse.pause();
  }, [isPlaylistExpanded]);

  const toggleTrack = (track) => {
    if (!track?.previewUrl) {
      toast.error('No preview available for this track.');
      return;
    }

    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(track.previewUrl);
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        toast.error('Playback failed. Browser might be blocking audio.');
        setPlayingTrackId(null);
      });
      setPlayingTrackId(track.id);
      audioRef.current.onended = () => setPlayingTrackId(null);
    }
  };

  useEffect(() => {
    if (!rootRef.current) {
      return undefined;
    }

    const sections = rootRef.current.querySelectorAll('[data-section]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.45,
        rootMargin: '-15% 0px -30% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setIsMobileNavOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 720) {
        setIsMobileNavOpen(false);
        setIsMobileNavVisible(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const panel = mobileNavPanelRef.current;

    if (!panel) {
      return undefined;
    }

    const cancelAnimations = () => {
      mobileNavPanelAnimationRef.current?.cancel();
      mobileNavLinksAnimationRef.current?.cancel();

      if (mobileNavFrameRef.current) {
        window.cancelAnimationFrame(mobileNavFrameRef.current);
        mobileNavFrameRef.current = null;
      }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const links = Array.from(panel.querySelectorAll('a'));

    if (isMobileNavOpen) {
      cancelAnimations();

      if (prefersReducedMotion) {
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0) scale(1)';

        links.forEach((link) => {
          link.style.opacity = '1';
          link.style.transform = 'translateY(0) scale(1)';
        });

        return cancelAnimations;
      }

      mobileNavFrameRef.current = window.requestAnimationFrame(() => {
        mobileNavPanelAnimationRef.current = animate(panel, {
          opacity: [0, 1],
          y: [-16, 0],
          scale: [0.96, 1],
          duration: 460,
          ease: 'outExpo',
        });

        mobileNavLinksAnimationRef.current = animate(links, {
          opacity: [0, 1],
          y: [14, 0],
          scale: [0.98, 1],
          delay: stagger(48, { start: 90 }),
          duration: 420,
          ease: 'outExpo',
        });
      });

      return cancelAnimations;
    }

    if (!isMobileNavVisible) {
      return cancelAnimations;
    }

    cancelAnimations();

    if (prefersReducedMotion) {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-14px) scale(0.97)';

      links.forEach((link) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(-10px) scale(0.985)';
      });

      mobileNavFrameRef.current = window.requestAnimationFrame(() => {
        setIsMobileNavVisible(false);
        mobileNavFrameRef.current = null;
      });
      return cancelAnimations;
    }

    mobileNavLinksAnimationRef.current = animate(links, {
      opacity: [1, 0],
      y: [0, -10],
      scale: [1, 0.985],
      delay: stagger(26, { from: 'last' }),
      duration: 220,
      ease: 'inOutQuad',
    });

    mobileNavPanelAnimationRef.current = animate(panel, {
      opacity: [1, 0],
      y: [0, -14],
      scale: [1, 0.97],
      duration: 300,
      ease: 'inOutCubic',
      onComplete: () => {
        setIsMobileNavVisible(false);
      },
    });

    return cancelAnimations;
  }, [isMobileNavOpen, isMobileNavVisible]);

  useEffect(() => {
    if (!rootRef.current) {
      return undefined;
    }

    const scope = createScope({
      root: rootRef.current,
      mediaQueries: {
        compact: '(max-width: 720px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
    }).add((self) => {
      if (self.matches.reduceMotion) {
        return undefined;
      }

      const isCompact = self.matches.compact;
      const cleanup = [];

      createTimeline({
        defaults: {
          duration: 900,
          ease: 'outExpo',
        },
      })
        .add(
          '.floating-nav__inner',
          {
            opacity: { from: 0 },
            y: { from: -24 },
            scale: { from: 0.92 },
          },
          0,
        )
        .add(
          '.hero-ambient',
          {
            opacity: { from: 0 },
            scale: { from: 0.78 },
            x: { from: isCompact ? 0 : 24 },
            duration: 1200,
          },
          80,
        )
        .add(
          '.status-chip',
          {
            opacity: { from: 0 },
            y: { from: 26 },
            scale: { from: 0.92 },
            delay: stagger(100),
            duration: 760,
          },
          140,
        )
        .add(
          '.hero-title span',
          {
            opacity: { from: 0 },
            y: { from: isCompact ? 110 : 150 },
            rotate: { from: '.04turn' },
            delay: stagger(140),
            duration: 1200,
            ease: 'outExpo',
          },
          220,
        )
        .add(
          '.hero-description',
          {
            opacity: { from: 0 },
            y: { from: 30 },
            duration: 820,
          },
          440,
        )
        .add(
          '.hero-actions .cta',
          {
            opacity: { from: 0 },
            y: { from: 22 },
            scale: { from: 0.94 },
            delay: stagger(90),
            duration: 720,
          },
          520,
        )
        .add(
          '.hero-spotlight',
          {
            opacity: { from: 0 },
            x: { from: isCompact ? 0 : 42 },
            y: { from: 28 },
            scale: { from: 0.95 },
            duration: 860,
            ease: 'outExpo',
          },
          500,
        );

      animate('.hero-ambient', {
        x: [0, isCompact ? 10 : 18, 0],
        y: [0, isCompact ? -12 : -22, 0],
        scale: [1, 1.06, 1],
        duration: isCompact ? 9000 : 12000,
        ease: 'inOutSine',
        loop: true,
      });

      animate('.hero-spotlight__art-inner', {
        y: [0, isCompact ? -4 : -8, 0],
        scale: [1, 1.018, 1],
        duration: isCompact ? 7600 : 9200,
        ease: 'inOutSine',
        loop: true,
      });

      const revealSection = (section) => {
        const introItems = section.querySelectorAll('.section-intro > *');

        switch (section.id) {
          case 'frame':
            animate(section.querySelector('.feature-stage'), {
              opacity: { from: 0 },
              y: { from: 48 },
              scale: { from: 0.965 },
              duration: 1100,
              ease: 'outExpo',
            });

            animate(
              section.querySelectorAll('.feature-credits p, .feature-credits__list span'),
              {
                opacity: { from: 0 },
                y: { from: 22 },
                delay: stagger(60),
                duration: 720,
              },
            );

            animate(section.querySelectorAll('.feature-wordmark span'), {
              opacity: { from: 0 },
              y: { from: isCompact ? 72 : 118 },
              rotate: { from: '.02turn' },
              delay: stagger(120),
              duration: 980,
              ease: 'outExpo',
            });

            animate(section.querySelector('.feature-copy'), {
              opacity: { from: 0 },
              y: { from: 42 },
              scale: { from: 0.95 },
              duration: 860,
              delay: 240,
            });
            break;

          case 'background':
            animate(introItems, {
              opacity: { from: 0 },
              y: { from: 28 },
              delay: stagger(110),
              duration: 820,
            });

            animate(section.querySelectorAll('.story-note'), {
              opacity: { from: 0 },
              y: { from: 40 },
              delay: stagger(120),
              duration: 860,
              ease: 'outExpo',
            });
            break;

          case 'skills':
            animate(introItems, {
              opacity: { from: 0 },
              y: { from: 28 },
              delay: stagger(110),
              duration: 820,
            });

            animate(section.querySelector('.skills-spotlight'), {
              opacity: { from: 0 },
              x: { from: isCompact ? 0 : -42 },
              y: { from: 24 },
              scale: { from: 0.96 },
              duration: 940,
              ease: 'outExpo',
            });

            animate(section.querySelectorAll('.metric-card'), {
              opacity: { from: 0 },
              scale: { from: 0.9 },
              x: { from: isCompact ? 0 : 30 },
              y: { from: 30 },
              delay: stagger(110, { start: 120 }),
              duration: 720,
              ease: 'outExpo',
            });
            break;

          case 'work':
            animate(introItems, {
              opacity: { from: 0 },
              y: { from: 30 },
              delay: stagger(110),
              duration: 820,
            });

            animate(section.querySelectorAll('.work-card'), {
              opacity: { from: 0 },
              y: { from: 84 },
              scale: { from: 0.95 },
              rotate: { from: '-.012turn' },
              delay: stagger(140, { start: 120, from: 'center' }),
              duration: 920,
              ease: 'outExpo',
            });
            break;

          case 'story':
            animate(introItems, {
              opacity: { from: 0 },
              y: { from: 28 },
              delay: stagger(110),
              duration: 820,
            });

            animate(section.querySelectorAll('.story-note'), {
              opacity: { from: 0 },
              x: { from: isCompact ? 0 : -40 },
              y: { from: 30 },
              delay: stagger(110),
              duration: 760,
            });

            animate(section.querySelectorAll('.metric-card'), {
              opacity: { from: 0 },
              x: { from: isCompact ? 0 : 40 },
              y: { from: 30 },
              scale: { from: 0.94 },
              delay: stagger(120, { start: 120 }),
              duration: 760,
            });
            break;

          case 'playlist':
            animate(introItems, {
              opacity: { from: 0 },
              y: { from: 30 },
              delay: stagger(110),
              duration: 820,
            });

            animate(section.querySelector('.spotify-player-v2'), {
              opacity: { from: 0 },
              y: { from: 48 },
              scale: { from: 0.98 },
              duration: 1000,
              ease: 'outExpo',
            });
            break;

          case 'chat':
            animate(section.querySelector('.chat-card'), {
              opacity: { from: 0 },
              y: { from: 58 },
              scale: { from: 0.97 },
              duration: 1000,
              ease: 'outExpo',
            });

            animate(section.querySelectorAll('.chat-copy > *'), {
              opacity: { from: 0 },
              y: { from: 24 },
              delay: stagger(100, { start: 180 }),
              duration: 740,
            });

            animate(section.querySelectorAll('.contact-item'), {
              opacity: { from: 0 },
              x: { from: isCompact ? 0 : 34 },
              y: { from: 18 },
              delay: stagger(100, { start: 260 }),
              duration: 720,
            });
            break;

          default:
            break;
        }
      };

      const seenSections = new Set();
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || seenSections.has(entry.target.id)) {
              return;
            }

            seenSections.add(entry.target.id);
            revealSection(entry.target);
            sectionObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.3,
          rootMargin: '0px 0px -10% 0px',
        },
      );

      self.root.querySelectorAll('.panel').forEach((section) => {
        if (section.id !== 'hey') {
          sectionObserver.observe(section);
        }
      });

      cleanup.push(() => sectionObserver.disconnect());

      const featureStage = self.root.querySelector('.feature-stage');
      const featureCopyMotion = createAnimatable('.feature-copy', {
        x: 450,
        y: 450,
        rotateZ: 600,
        ease: 'out(4)',
      });
      const featureWordmarkMotion = createAnimatable('.feature-wordmark span', {
        x: stagger(650, { from: 'center' }),
        y: stagger(650, { from: 'center' }),
        ease: 'out(4)',
      });

      const onFeatureMove = (event) => {
        const bounds = featureStage.getBoundingClientRect();
        const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

        featureCopyMotion
          .x(offsetX * 26)
          .y(offsetY * 18)
          .rotateZ(offsetX * 1.6);

        featureWordmarkMotion
          .x(offsetX * -36)
          .y(offsetY * -18);
      };

      const onFeatureLeave = () => {
        featureCopyMotion.x(0).y(0).rotateZ(0);
        featureWordmarkMotion.x(0).y(0);
      };

      featureStage.addEventListener('pointermove', onFeatureMove);
      featureStage.addEventListener('pointerleave', onFeatureLeave);
      cleanup.push(() => {
        featureStage.removeEventListener('pointermove', onFeatureMove);
        featureStage.removeEventListener('pointerleave', onFeatureLeave);
      });

      const addHoverLift = (targets, enterValues, leaveValues) => {
        targets.forEach((target) => {
          const onEnter = () => {
            animate(target, {
              ...enterValues,
              duration: 420,
              ease: 'out(4)',
            });
          };

          const onLeave = () => {
            animate(target, {
              ...leaveValues,
              duration: 520,
              ease: 'out(5)',
            });
          };

          target.addEventListener('pointerenter', onEnter);
          target.addEventListener('pointerleave', onLeave);

          cleanup.push(() => {
            target.removeEventListener('pointerenter', onEnter);
            target.removeEventListener('pointerleave', onLeave);
          });
        });
      };

      addHoverLift(self.root.querySelectorAll('.work-card'), { y: -12, scale: 1.018 }, { y: 0, scale: 1 });
      addHoverLift(self.root.querySelectorAll('.metric-card'), { y: -8, scale: 1.012 }, { y: 0, scale: 1 });
      addHoverLift(self.root.querySelectorAll('.contact-item'), { x: 10, scale: 1.01 }, { x: 0, scale: 1 });

      return () => {
        cleanup.forEach((fn) => fn());
      };
    });

    return () => scope.revert();
  }, []);

  const handleContactChange = ({ target }) => {
    const { name, value } = target;

    setContactForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    setContactStatus({
      state: 'submitting',
      message: '',
    });

    const loadingToast = toast.loading('Sending your message...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const { payload, rawBody } = await readApiResponse(response);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Contact service is unavailable right now. Please try again later.');
        }

        throw new Error(
          payload?.message
          || rawBody
          || 'Unable to send your message right now.',
        );
      }

      toast.success(payload?.message || 'Message sent successfully!', {
        id: loadingToast,
      });

      setContactForm(INITIAL_CONTACT_FORM);
      setContactStatus({
        state: 'success',
        message: payload?.message || 'Message sent successfully.',
      });

      // Clear success state after some time if we want to show the form again
      // setTimeout(() => setContactStatus({ state: 'idle', message: '' }), 10000);

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Something went wrong while sending your message.';

      toast.error(errorMessage, {
        id: loadingToast,
      });

      setContactStatus({
        state: 'error',
        message: errorMessage,
      });
    }
  };

  const spotifyPlaylist = spotifyState.playlist;
  const spotifyTracks = spotifyPlaylist?.tracks || [];
  const spotifyAvailableTrackCount = spotifyPlaylist?.availableTrackCount ?? spotifyTracks.length;
  const spotifyTrack = spotifyTracks[0] || null;
  const spotifyCurrentTime = spotifyTrack ? `Track ${String(spotifyTrack.index).padStart(2, '0')}` : 'Playlist';
  const spotifyTotalTime = spotifyTrack
    ? formatDurationLabel(spotifyTrack.durationMs)
    : spotifyPlaylist?.trackCount
      ? `${spotifyPlaylist.trackCount} songs`
      : '--';
  const spotifyTopLabel = spotifyState.isLoading
    ? 'Loading Playlist'
    : spotifyState.configured
      ? 'Spotify Playlist'
      : 'Curated Playlist';
  const spotifyBadgeLabel = spotifyPlaylist?.trackCount
    ? `${spotifyPlaylist.trackCount} Tracks`
    : spotifyState.configured
      ? 'Curated'
      : 'Backend';
  const spotifyTitle = spotifyTrack?.title
    || (spotifyState.isLoading
      ? 'Loading playlist preview'
      : spotifyPlaylist?.title
        || (spotifyState.configured
          ? 'Playlist unavailable'
          : 'Configure Spotify'));
  const spotifyArtistLine = spotifyTrack?.artistLine
    || spotifyPlaylist?.ownerName
    || (spotifyState.configured
      ? 'This card is powered by a public Spotify playlist.'
      : 'Discover the sounds that inspire my digital craft.');
  const spotifyCopy = spotifyPlaylist?.description
    || spotifyTrack?.albumName
    || spotifyState.message
    || (spotifyState.configured
      ? `Refreshing playlist metadata every ${Math.round(spotifyState.refreshIntervalMs / 1000)} seconds.`
      : 'This hero card is ready for public Spotify playlist data.');
  const spotifyTags = spotifyTrack
    ? [
      spotifyTrack.albumName || 'Album',
      spotifyPlaylist?.ownerName || 'Spotify',
      'Playlist',
    ]
    : spotifyState.configured
      ? ['Public Data', 'Spotify', 'No Login']
      : SPOTIFY_FALLBACK_TAGS;
  const spotifyArtworkStyle = (spotifyTrack?.albumImageUrl || spotifyPlaylist?.imageUrl)
    ? {
      backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.08), rgba(12, 10, 8, 0.44)), url(${spotifyTrack?.albumImageUrl || spotifyPlaylist?.imageUrl})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }
    : undefined;
  const spotifyPrimaryActionHref = spotifyPlaylist?.externalUrl || spotifyTrack?.externalUrl || '#';

  return (
    <Routes>
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="messages" element={<Messages />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="new-project" element={<ProjectEditor />} />
      </Route>
      <Route path="*" element={
        <div className="page-shell" ref={rootRef}>
          <LoginModal 
            isOpen={isAuthModalVisible}
            onClose={closeAuthModal}
            onSuccess={() => navigate('/dashboard')}
          />
          <Toaster position="bottom-right" theme={theme} expand={false} richColors />
          <header className={`floating-nav ${isMobileNavOpen ? 'is-mobile-open' : ''}`} ref={navRef}>
        <div className="floating-nav__inner">
          <button
            className="theme-toggle"
            type="button"
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === 'dark' ? 'light' : 'dark',
              )
            }
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'
              } mode`}
          >
            {theme === 'dark' ? (
              <SunMedium size={18} strokeWidth={2.1} />
            ) : (
              <MoonStar size={18} strokeWidth={2.1} />
            )}
          </button>

          <nav
            className="floating-nav__links"
            aria-label="Primary"
            style={{ '--nav-count': navItems.length }}
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? 'is-active' : ''}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            className={`mobile-nav-toggle ${isMobileNavOpen ? 'is-active' : ''}`}
            type="button"
            aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-primary-nav"
            onClick={() => {
              if (!isMobileNavOpen) {
                setIsMobileNavVisible(true);
              }

              setIsMobileNavOpen((currentState) => !currentState);
            }}
          >
            <span>{isMobileNavOpen ? 'Close' : 'Menu'}</span>
            {isMobileNavOpen ? (
              <X size={18} strokeWidth={2.2} />
            ) : (
              <Menu size={18} strokeWidth={2.2} />
            )}
          </button>

          <div className="nav-divider-v" />

          {user ? (
            <Link to="/dashboard" className="nav-auth-btn">
              Dashboard
            </Link>
          ) : (
            <button 
              className="nav-auth-btn"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Sign In
            </button>
          )}
        </div>

        <nav
          id="mobile-primary-nav"
          ref={mobileNavPanelRef}
          className={`mobile-nav-panel ${isMobileNavVisible ? 'is-visible' : ''} ${isMobileNavOpen ? 'is-open' : ''}`}
          aria-label="Mobile primary"
          aria-hidden={!isMobileNavOpen}
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? 'is-active' : ''}
              onClick={() => setIsMobileNavOpen(false)}
            >
              <span>{item.label}</span>
              <ArrowUpRight size={15} strokeWidth={2.1} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </header>

      <main className="page-content">
        <section id="hey" data-section className="hero-section panel">
          <div className="hero-ambient" aria-hidden="true" />

          <div className="hero-copy">
            <div className="hero-layout">
              <div className="hero-main">
                <div className="hero-meta-row">
                  <div className="status-chip">
                    <Sparkles size={14} />
                    <span>Available for freelance builds in 2026</span>
                  </div>
                  <div className="status-chip">
                    <MapPin size={14} />
                    <span>West-Bengal, India</span>
                  </div>
                </div>

                <h1 className="hero-title">
                  <span>Soham</span>
                  <span>Mondal</span>
                </h1>

                <div className="hero-summary">
                  <p className="hero-description">
                    Full Stack Developer passionate about scalable web applications,
                    real-time systems, and cross-platform mobile development using Flutter.
                  </p>

                  <div className="hero-actions">
                    <button 
                      className="cta cta--solid" 
                      onClick={() => {
                        if (user) {
                          navigate('/dashboard');
                        } else {
                          setIsAuthModalOpen(true);
                        }
                      }}
                    >
                      Start With me.
                      <ArrowUpRight size={18} />
                    </button>
                    <button 
                      type="button" 
                      className="cta cta--ghost" 
                      onClick={() => setIsMessageDrawerOpen(true)}
                    >
                      Start a Conversation
                    </button>
                  </div>
                </div>
              </div>

              <article className="hero-spotlight" aria-label="Spotify music player">
                <div className="hero-spotlight__top">
                  <p className="hero-spotlight__eyebrow">{spotifyTopLabel}</p>
                  <span className="hero-spotlight__badge">{spotifyBadgeLabel}</span>
                </div>

                <div className="hero-spotlight__art" aria-hidden="true">
                  <div
                    className={`hero-spotlight__art-inner${spotifyTrack?.albumImageUrl || spotifyPlaylist?.imageUrl ? ' hero-spotlight__art-inner--artwork' : ''}`}
                    style={spotifyArtworkStyle}
                  >
                    <span className="hero-spotlight__art-tag">Signal 01</span>
                    <div className="hero-spotlight__visual">
                      <strong>SM</strong>
                      <span className="hero-spotlight__bars">
                        <span />
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hero-spotlight__body">
                  <div className="hero-spotlight__track">
                    <button 
                      type="button" 
                      className={`hero-spotlight__play${playingTrackId === spotifyTrack?.id ? ' is-playing' : ''}`}
                      onClick={() => toggleTrack(spotifyTrack)}
                      disabled={!spotifyTrack?.previewUrl}
                      title={playingTrackId === spotifyTrack?.id ? 'Pause' : 'Play Preview'}
                    >
                      {playingTrackId === spotifyTrack?.id ? (
                        <Volume2 size={18} strokeWidth={2.2} />
                      ) : (
                        <Play size={18} strokeWidth={2.2} fill="currentColor" />
                      )}
                    </button>

                    <div className="hero-spotlight__meta">
                      <h3>{spotifyTitle}</h3>
                      <p>{spotifyArtistLine}</p>
                    </div>

                    <span className="hero-spotlight__time">
                      {spotifyTrack ? spotifyTotalTime : spotifyState.isLoading ? '...' : 'LIST'}
                    </span>
                  </div>

                  <p className="hero-spotlight__copy">{spotifyCopy}</p>

                  <div className="hero-spotlight__timeline" aria-hidden="true">
                    <span>{spotifyCurrentTime}</span>
                    <span>{spotifyTrack ? spotifyTotalTime : spotifyPlaylist?.ownerName || 'Waiting'}</span>
                  </div>

                  <div className="hero-spotlight__footer">
                    <div className="hero-spotlight__chips" aria-label="Featured stack">
                      {spotifyTags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <div className="hero-spotlight__actions">
                      {spotifyState.configured ? (
                        spotifyPrimaryActionHref !== '#' ? (
                          <a
                            className="hero-spotlight__action"
                            href={spotifyPrimaryActionHref}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Playlist
                            <ArrowUpRight size={18} strokeWidth={2.25} />
                          </a>
                        ) : null
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="frame" data-section className="feature-section panel">
          <div className="feature-stage">
            <img
              className="feature-video"
              src={editorialScene}
              alt=""
              aria-hidden="true"
            />

            <div className="feature-credits">
              <p>Feature</p>
              <p className="feature-credits__center">Designed and developed in-house</p>
              <div className="feature-credits__list" aria-label="Feature details">
                <span>Creative Direction</span>
                <span>Frontend Engineering</span>
                <span>Responsive Polish</span>
              </div>
            </div>



            <div className="feature-copy">
              <p className="section-label">Background Feature</p>
              <h2>Full-bleed imagery, handled with restraint.</h2>
              <p>
                A cinematic pause in the scroll for portfolios and launch pages
                that need presence without losing clarity, hierarchy, or polish.
              </p>
            </div>
          </div>
        </section>

        <section id="work" data-section className="content-section panel">
          <div className="section-intro">
            <div>
              <p className="section-label">Selected Work</p>
              <h2 className="section-title">Minimal by look. Detailed by build.</h2>
            </div>

            <p className="section-copy">
              The visual direction is stripped back on purpose: one warm canvas,
              strong contrast, oversized type, and components that do only what
              they need to do well.
            </p>
          </div>

          <div className="work-grid">
            {featuredWork.map((item) => (
              <article key={item.index} className="work-card">
                <div className="work-card__top">
                  <span className="work-index">{item.index}</span>
                  <p className="work-kicker">{item.category}</p>
                  <h3>{item.title}</h3>
                  <p className="work-summary">{item.summary}</p>
                </div>

                <div className="work-footer">
                  <p className="work-impact">{item.impact}</p>
                  <span className="work-link">
                    Explore
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="background" data-section className="content-section panel">
          <div className="section-intro">
            <div>
              <p className="section-label">Background</p>
              <h2 className="section-title">Education & Milestones</h2>
            </div>

            <p className="section-copy">
              A solid foundation in Computer Science combined with hands-on
              technical certifications and a focus on engineering excellence.
            </p>
          </div>

          <div className="background-grid">
            {storyNotes.map((note) => (
              <article key={note.title} className="story-note">
                <div className="story-note__header">
                  <h3>{note.title}</h3>
                  <button className="view-button" aria-label={`View details for ${note.title}`}>
                    <span>View</span>
                    <ArrowUpRight size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <p>{note.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" data-section className="content-section panel">
          <div className="section-intro">
            <div>
              <p className="section-label">Skillset</p>
              <h2 className="section-title">Technical Expertise</h2>
            </div>

            <p className="section-copy">
              Strongest where sharp frontend execution, dependable backend logic,
              and practical product delivery need to work together.
            </p>
          </div>

          <div className="skills-layout">
            <aside className="skills-spotlight">
              <div className="skills-spotlight__content">
                <p className="section-label section-label--light">Capability Snapshot</p>
                <h3>Design-led frontend work backed by production-minded engineering.</h3>
                <p className="skills-spotlight__copy">
                  I build interfaces that feel refined on the surface and stay
                  maintainable underneath, with enough backend depth to support
                  real products and enough tooling discipline to ship them cleanly.
                </p>
              </div>

              <div className="skills-stat-grid" aria-label="Skill summary">
                {skillsOverview.map((item) => (
                  <div
                    key={item.label}
                    className={`skills-stat${item.wide ? ' skills-stat--wide' : ''}`}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </aside>

            <div className="skills-grid">
              {skills.map(({ index, category, title, summary, items, icon }) => (
                <article key={category} className="metric-card skill-card">
                  <div className="skill-card__head">
                    <span className="metric-value">{index}</span>
                    <span className="skill-card__icon" aria-hidden="true">
                      {createElement(icon, { size: 20, strokeWidth: 2.15 })}
                    </span>
                  </div>

                  <div className="skill-card__body">
                    <p className="skill-card__eyebrow">{category}</p>
                    <h3 className="skill-card__title">{title}</h3>
                    <p className="skill-card__summary">{summary}</p>
                  </div>

                  <div className="skill-tags" aria-label={`${category} tools`}>
                    {items.map((item) => (
                      <span key={item} className="skill-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="playlist" data-section className="content-section panel playlist-section">
          <div className="section-intro">
            <div>
              <p className="section-label">Atmosphere</p>
              <h2 className="section-title">Music I Code To</h2>
            </div>
            <p className="section-copy">
              A curated selection of tracks that power my late-night sessions. 
              {spotifyState.configured ? ' Syncing live with my Spotify.' : ' Showing my personal favorites.'}
            </p>
          </div>

          <div className="spotify-player-v2">
            <div 
              className="player-header" 
              role="button" 
              tabIndex={0}
              onClick={() => setIsPlaylistExpanded((v) => !v)}
              onKeyDown={(e) => e.key === 'Enter' && setIsPlaylistExpanded((v) => !v)}
              aria-expanded={isPlaylistExpanded}
              title={isPlaylistExpanded ? 'Collapse tracks' : 'Expand tracks'}
            >
              <div className="player-art" style={{ backgroundImage: `url(${spotifyPlaylist?.imageUrl || spotifyPlaceholder})` }}>
                {!isPlaylistExpanded && (
                  <div className="player-art__hint">
                    <Sparkles size={20} />
                    <span>Tap to view</span>
                  </div>
                )}
                {!spotifyPlaylist?.imageUrl && <Sparkles size={48} color="rgba(255,255,255,0.2)" />}
              </div>
              <div className="player-info">
                <span className="player-eyebrow">Public Playlist</span>
                <h3 className="player-title">{spotifyPlaylist?.title || 'Loading...'}</h3>
                <p className="player-description">
                  {spotifyPlaylist?.description || spotifyState.message || 'A curated soundtrack for focused building.'}
                </p>
                <div className="player-stats">
                  <strong>{spotifyPlaylist?.ownerName || 'Spotify'}</strong>
                  <span>•</span>
                  <span>{spotifyPlaylist?.trackCount || spotifyAvailableTrackCount || 0} songs</span>
                </div>
                <div className="player-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    type="button" 
                    className={`cta cta--solid ${playingTrackId === spotifyTrack?.id ? 'is-playing' : ''}`}
                    onClick={() => toggleTrack(spotifyTrack)}
                    disabled={!spotifyTrack?.previewUrl}
                  >
                    {playingTrackId === spotifyTrack?.id ? <Volume2 size={18} /> : <Play size={18} fill="currentColor" />}
                    {playingTrackId === spotifyTrack?.id ? 'Pause Preview' : 'Play Preview'}
                  </button>
                  {spotifyPrimaryActionHref !== '#' && (
                    <a href={spotifyPrimaryActionHref} target="_blank" rel="noopener noreferrer" className="cta cta--ghost">
                      <ArrowUpRight size={18} />
                      Spotify
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="player-disclosure">
              <button
                type="button"
                className={`playlist-toggle${isPlaylistExpanded ? ' is-expanded' : ''}`}
                onClick={() => setIsPlaylistExpanded((v) => !v)}
              >
                <span>{isPlaylistExpanded ? 'Hide Tracks' : 'Show Tracks'}</span>
                <Menu size={16} />
              </button>
            </div>

            <div ref={trackListShellRef} className="track-list-shell">
              <div className="track-list">
                <div className="track-list-header">
                  <span className="track-index">#</span>
                  <span className="track-title-cell">Title</span>
                  <span className="track-album-cell">Album</span>
                  <span className="track-duration-cell"><Sparkles size={14} /></span>
                </div>
                {spotifyTracks.map((track, i) => {
                  return (
                    <button
                      key={track.id || `${track.title}-${i + 1}`}
                      type="button"
                      ref={(el) => { tracksRef.current[i] = el; }}
                      className={`track-row${playingTrackId === track.id ? ' is-playing' : ''}`}
                      onClick={() => toggleTrack(track)}
                    >
                      <span className="track-index">
                        {playingTrackId === track.id ? (
                          <div className="playing-bars">
                            <span /><span /><span />
                          </div>
                        ) : (
                          String(track.index || i + 1).padStart(2, '0')
                        )}
                      </span>
                      <div className="track-title-cell">
                        <img
                          src={track.albumImageUrl || spotifyPlaylist?.imageUrl || spotifyPlaceholder}
                          alt={track.albumName || track.title || 'Playlist artwork'}
                          className="track-art"
                        />
                        <div className="track-meta">
                          <strong>{track.title || 'Untitled track'}</strong>
                          <span>{track.artistLine || 'Unknown artist'}</span>
                        </div>
                      </div>
                      <span className="track-album-cell">{track.albumName || 'Unknown album'}</span>
                      <span className="track-duration-cell">{formatDurationLabel(track.durationMs)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="chat" data-section className="content-section panel chat-section">
          <div className="chat-card">
            <div className="chat-copy">
              <p className="section-label section-label--light">Chat</p>
              <h2>Need a frontend that feels this intentional?</h2>
              <p>
                I work best with founders and teams who want a site that feels
                confident on first glance and thoughtful on every scroll.
              </p>

              {contactStatus.state === 'success' ? (
                <div className="contact-success-state">
                  <div className="success-icon">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3>Message Sent!</h3>
                  <p>{contactStatus.message}</p>
                  <button
                    className="cta cta--ghost"
                    onClick={() => setContactStatus({ state: 'idle', message: '' })}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  <div className="contact-form__grid">
                    <label className="contact-field">
                      <span>Name</span>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        minLength={2}
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="contact-field">
                      <span>Email</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        autoComplete="email"
                        required
                      />
                    </label>
                  </div>

                  <label className="contact-field contact-field--message">
                    <span>Project brief</span>
                    <textarea
                      name="message"
                      rows="5"
                      placeholder="Tell me a little about the product, timeline, or problem you want solved."
                      value={contactForm.message}
                      onChange={handleContactChange}
                      minLength={20}
                      maxLength={2000}
                      required
                    />
                  </label>

                  <input
                    className="contact-honeypot"
                    type="text"
                    name="website"
                    tabIndex="-1"
                    autoComplete="off"
                    value={contactForm.website}
                    onChange={handleContactChange}
                    aria-hidden="true"
                  />

                  <div className="chat-actions">
                    <button
                      className="cta cta--light"
                      type="submit"
                      disabled={contactStatus.state === 'submitting'}
                    >
                      {contactStatus.state === 'submitting' ? 'Sending...' : 'Send Message'}
                      <Send size={18} strokeWidth={2.2} />
                    </button>
                    <a
                      className="cta cta--ghost"
                      href={resumeFile}
                      download="Soham_Mondal_Resume.docx"
                      aria-label="Download Soham Mondal resume"
                      title="Download resume"
                    >
                      Download CV
                      <Download size={18} />
                    </a>
                  </div>

                  {contactStatus.state === 'error' && contactStatus.message ? (
                    <p
                      className="contact-status contact-status--error"
                      role="status"
                    >
                      {contactStatus.message}
                    </p>
                  ) : null}
                </form>
              )}
            </div>

            <div className="contact-stack">
              <div className="contact-item">
                <span className="contact-label">Email</span>
                <strong>sohammondal1304@gmail.com</strong>
              </div>
              <div className="contact-item">
                <span className="contact-label">Phone</span>
                <strong>+91 9083861312</strong>
              </div>
              <div className="contact-item">
                <span className="contact-label">Location</span>
                <strong>Mecheda, West Bengal</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Message Drawer */}
      <div 
        ref={messageDrawerRef} 
        className="message-drawer-overlay" 
        onClick={() => setIsMessageDrawerOpen(false)}
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        <div 
          ref={messageDrawerContentRef} 
          className="message-drawer-content chat-layout" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="chat-header">
            <div className="chat-profile">
              <div className="chat-avatar">SM</div>
              <div className="chat-status-info">
                <strong>Soham Mondal</strong>
                <span className="status-online">Online</span>
              </div>
            </div>
            <button 
              type="button" 
              className="drawer-close" 
              onClick={() => setIsMessageDrawerOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div ref={chatScrollRef} className="chat-messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'Soham' ? 'is-soham' : 'is-user'}`}>
                <div className="chat-bubble">
                  <p>{msg.text}</p>
                  <span className="chat-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-wrapper is-soham">
                <div className="chat-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-area" onSubmit={handleChatSubmit}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" disabled={!chatInput.trim()} aria-label="Send message">
              <Send size={20} strokeWidth={2.5} />
            </button>
          </form>

          <div className="chat-footer-note">
            Typically replies within a few hours.
          </div>
        </div>
      </div>
    </div>
  } />
</Routes>
  );
}

export default App;
