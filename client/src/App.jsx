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
  VolumeX,
  Wrench,
  X,
  CheckCircle2,
  Send,
  Link as MusicLink,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import resumeFile from './assets/Soham_Mondal_Resume (1) (1).docx?url';

import { API_BASE_URL } from './lib/apiBaseUrl';
import './App.css';

const THEME_STORAGE_KEY = 'portfolio-theme';
const INITIAL_CONTACT_FORM = {
  name: '',
  email: '',
  message: '',
  website: '',
};
const CURATED_PLAYLIST = {
  id: 'nocturne-flow',
  title: 'Nocturne Flow',
  description: 'A curated selection of late-night coding beats and ambient textures.',
  imageUrl: '/me.jpeg',
  ownerName: 'Soham Mondal',
  trackCount: 12,
  tracks: [
    {
      id: 'track-youtube-featured',
      index: 1,
      title: 'Vibe Check',
      artistLine: 'Soham\'s Favorite',
      albumName: 'Featured Stream',
      albumImageUrl: 'https://img.youtube.com/vi/s0bJkT5EyTc/hqdefault.jpg',
      durationMs: 0, // Live/YouTube stream
      embedUrl: 'https://www.youtube.com/embed/s0bJkT5EyTc',
    },
    {
      id: 'track-1',
      index: 2,
      title: 'Midnight Syntax',
      artistLine: 'Lofi Coder',
      albumName: 'Binary Beats',
      albumImageUrl: '/me.jpeg',
      durationMs: 184000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    },
    {
      id: 'track-2',
      index: 3,
      title: 'Ghost in the Shell',
      artistLine: 'Cyberpunk Orchestra',
      albumName: 'Digital Soul',
      albumImageUrl: '/me.jpeg',
      durationMs: 215000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      id: 'track-3',
      index: 4,
      title: 'Compiler Dreams',
      artistLine: 'The Architect',
      albumName: 'System Core',
      albumImageUrl: '/me.jpeg',
      durationMs: 192000,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
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
  { id: 'chat', label: 'Contact' },
];

const featuredWork = [
  {
    index: '01',
    category: 'Full Stack Platform',
    title: 'INCOODING',
    summary: 'A high-performance practice platform for computer science students. Features include real-time code execution, subject-wise curriculum tracking, and an AI-driven support system.',
    impact: 'Engineered a ~95% accurate support chatbot and achieved ~90% code reusability across modules.',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.io']
  },
  {
    index: '02',
    category: 'Enterprise Mobility',
    title: 'UEM Portal',
    summary: 'A unified portal for university management. Streamlines attendance, examination results, and financial transactions with an focus on security and real-time synchronization.',
    impact: 'Reduced administrative processing time by ~40% through optimized REST API integrations.',
    tech: ['Flutter', 'Firebase', 'Node.js', 'PostgreSQL']
  },
  {
    index: '03',
    category: 'Digital Commerce',
    title: 'WeekendCart',
    summary: 'A comprehensive e-commerce solution with advanced features like UUID-based order tracking, dynamic delivery estimation, and multi-channel payment integration.',
    impact: 'Handled 500+ mock transactions in stress testing with zero latency issues.',
    tech: ['Next.js', 'Redux', 'Stripe', 'Express']
  },
];

const storyNotes = [
  {
    title: 'Education',
    copy: 'Pursuing B.Tech in Computer Science and Engineering (2023–2027) at UEM Jaipur. Maintaining a strong focus on algorithmic foundations and system design.',
  },
  {
    title: 'Certifications',
    copy: 'Accredited in Advanced Web Development, Aptos Blockchain Development (2025), and Telecom Sector Skill Council certifications for engineering excellence.',
  },
  {
    title: 'Technical Reach',
    copy: 'Expertise in modern JavaScript ecosystems, cross-platform mobile development with Flutter, and building scalable backend architectures.',
  },
  {
    title: 'Philosophy',
    copy: 'Believer in minimal design, clean code, and user-centric engineering. Focus on building products that solve real-world problems with elegance.',
  },
];

const technicalPhilosophy = [
  {
    title: 'Responsive Accuracy',
    copy: 'Ensuring fluid experiences from 4K displays down to the smallest mobile devices.'
  },
  {
    title: 'State Management',
    copy: 'Implementing predictable data flows using modern patterns like Redux and Context API.'
  },
  {
    title: 'API Engineering',
    copy: 'Designing secure, well-documented RESTful and Real-time (WebSocket) interfaces.'
  }
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
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoIframeRef = useRef(null);
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
  const [activeTrack, setActiveTrack] = useState(CURATED_PLAYLIST.tracks[0]);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [externalLink, setExternalLink] = useState('');
  const [ytPlayer, setYtPlayer] = useState(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const playbackTimerRef = useRef(null);
  const activeTrackIdRef = useRef(activeTrack.id);

  // Keep track ID ref in sync
  useEffect(() => {
    activeTrackIdRef.current = activeTrack.id;
  }, [activeTrack.id]);

  // Load YouTube API
  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready');
    };
  }, []);

  const initYtPlayer = (videoId) => {
    if (!window.YT) return;
    
    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
      ytPlayer.playVideo();
      return;
    }

    new window.YT.Player('yt-player-hidden', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        'autoplay': 1,
        'controls': 0,
        'disablekb': 1,
        'fs': 0,
        'modestbranding': 1,
        'rel': 0,
        'showinfo': 0
      },
      events: {
        'onReady': (event) => {
          setYtPlayer(event.target);
          setPlaybackDuration(event.target.getDuration());
          event.target.playVideo();
        },
        'onStateChange': (event) => {
          const isPlaying = event.data === window.YT.PlayerState.PLAYING;
          const isPaused = event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED;

          if (isPlaying) {
            const currentTime = event.target.getCurrentTime();
            
            // Sync Mockups with exact timestamp
            const syncMessage = JSON.stringify({
              event: 'command',
              func: 'seekTo',
              args: [currentTime, true]
            });
            const playMessage = JSON.stringify({
              event: 'command',
              func: 'playVideo',
              args: ''
            });
            
            if (videoIframeRef.current) {
              videoIframeRef.current.contentWindow?.postMessage(syncMessage, '*');
              videoIframeRef.current.contentWindow?.postMessage(playMessage, '*');
            }
            
            const iphoneIframe = document.querySelector('.iphone-mockup iframe');
            if (iphoneIframe) {
              iphoneIframe.contentWindow?.postMessage(syncMessage, '*');
              iphoneIframe.contentWindow?.postMessage(playMessage, '*');
            }

            startPlaybackTimer();
            setPlayingTrackId(activeTrackIdRef.current);
          } else if (isPaused) {
            const pauseMessage = JSON.stringify({
              event: 'command',
              func: 'pauseVideo',
              args: ''
            });
            
            if (videoIframeRef.current) videoIframeRef.current.contentWindow?.postMessage(pauseMessage, '*');
            const iphoneIframe = document.querySelector('.iphone-mockup iframe');
            if (iphoneIframe) iphoneIframe.contentWindow?.postMessage(pauseMessage, '*');

            stopPlaybackTimer();
            setPlayingTrackId(null);
          }
        }
      }
    });
  };

  const startPlaybackTimer = () => {
    stopPlaybackTimer();
    playbackTimerRef.current = setInterval(() => {
      if (ytPlayer && ytPlayer.getCurrentTime) {
        setPlaybackTime(ytPlayer.getCurrentTime());
        setPlaybackDuration(ytPlayer.getDuration());
      } else if (audioRef.current) {
        setPlaybackTime(audioRef.current.currentTime);
        setPlaybackDuration(audioRef.current.duration);
      }
    }, 500);
  };

  const stopPlaybackTimer = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }
  };

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

  const toggleTrack = (track) => {
    if (track.embedUrl && track.id.includes('youtube')) {
      const videoId = track.embedUrl.split('embed/')[1]?.split('?')[0];
      if (playingTrackId === track.id) {
        ytPlayer?.pauseVideo();
        setPlayingTrackId(null);
        stopPlaybackTimer();
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (ytPlayer) {
          ytPlayer.loadVideoById(videoId);
          ytPlayer.playVideo();
        } else {
          initYtPlayer(videoId);
        }
        setPlayingTrackId(track.id);
      }
      return;
    }

    if (!track?.previewUrl) {
      toast.error('No preview available.');
      return;
    }

    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      stopPlaybackTimer();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (ytPlayer) ytPlayer.pauseVideo();
      
      audioRef.current = new Audio(track.previewUrl);
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        startPlaybackTimer();
      }).catch(() => {
        toast.error('Playback failed.');
        setPlayingTrackId(null);
      });
      setPlayingTrackId(track.id);
      audioRef.current.onended = () => {
        setPlayingTrackId(null);
        stopPlaybackTimer();
      };
    }
  };

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

  // Audio control logic cleanup completed

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
        )
        .add(
          '.hero-spotlight__vinyl',
          {
            opacity: { from: 0 },
            translateX: { from: '-40%' },
            rotate: { from: '-15deg' },
            duration: 1100,
            ease: 'outExpo',
          },
          650,
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
      cleanup.push(() => {
        // Disconnect observers if any
      });

      // Animate ambient blobs
      animate('.ambient-blob', {
        translateX: () => (Math.random() - 0.5) * 300,
        translateY: () => (Math.random() - 0.5) * 200,
        scale: [1, 1.15, 1],
        duration: () => 10000 + Math.random() * 8000,
        delay: stagger(1200),
        direction: 'alternate',
        loop: true,
        ease: 'easeInOutSine',
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
      
      // Professional Music Player Animation
      const spotlightArt = self.root.querySelector('.hero-spotlight__art');
      const spotlightVinyl = self.root.querySelector('.hero-spotlight__vinyl');
      
      if (spotlightArt && spotlightVinyl) {
        spotlightArt.addEventListener('pointerenter', () => {
          animate(spotlightVinyl, {
            translateX: ['0%', '15%'],
            rotate: '45deg',
            duration: 800,
            ease: 'outExpo'
          });
          animate(spotlightArt, {
            scale: 1.03,
            rotateY: 10,
            duration: 600,
            ease: 'outExpo'
          });
        });
        
        spotlightArt.addEventListener('pointerleave', () => {
          animate(spotlightVinyl, {
            translateX: '0%',
            rotate: '0deg',
            duration: 600,
            ease: 'outElastic(1, .8)'
          });
          animate(spotlightArt, {
            scale: 1,
            rotateY: 0,
            duration: 600,
            ease: 'outExpo'
          });
        });
      }
      
      // Staggered reveal for music player body
      const spotlightBody = self.root.querySelector('.hero-spotlight__body');
      if (spotlightBody) {
        animate(spotlightBody.children, {
          opacity: [0, 1],
          y: [15, 0],
          delay: stagger(60, { start: 800 }),
          duration: 1000,
          ease: 'outExpo'
        });
      }
      
      // Progress bar pulse when playing
      const progressFill = self.root.querySelector('.hero-spotlight__progress-fill');
      if (progressFill) {
        animate(progressFill, {
          opacity: [0.8, 1],
          duration: 1200,
          direction: 'alternate',
          loop: true,
          ease: 'easeInOutSine'
        });
      }

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

  const toggleVideoMute = () => {
    const nextMuted = !isVideoMuted;
    setIsVideoMuted(nextMuted);

    if (videoIframeRef.current) {
      videoIframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: nextMuted ? 'mute' : 'unMute',
          args: '',
        }),
        '*',
      );
    }
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


  const totalTime = formatDurationLabel(activeTrack.durationMs);

  const currentPlaylist = CURATED_PLAYLIST;
  const playerArtworkStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.08), rgba(12, 10, 8, 0.44)), url('/me.jpeg')`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  };

  const getSyncEmbedUrl = (track) => {
    if (!track.embedUrl) return null;
    const base = track.embedUrl.split('?')[0];
    const videoId = base.split('embed/')[1];
    return `${base}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1`;
  };

  const currentMockupVideo = activeTrack.embedUrl 
    ? getSyncEmbedUrl(activeTrack) 
    : "https://www.youtube.com/embed/nTbA7qrEsP0?autoplay=1&mute=1&loop=1&playlist=nTbA7qrEsP0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1";

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    if (!externalLink.trim()) return;

    // Detect platform and update activeTrack
    let newTrack = { ...activeTrack };
    
    if (externalLink.includes('spotify.com')) {
      const trackId = externalLink.split('track/')[1]?.split('?')[0];
      newTrack = {
        id: 'external-spotify',
        title: 'Spotify Track',
        artistLine: 'External Source',
        albumName: 'Spotify',
        albumImageUrl: activeTrack.albumImageUrl, // Keep current art as fallback
        durationMs: 0,
        embedUrl: `https://open.spotify.com/embed/track/${trackId}`,
      };
    } else if (externalLink.includes('youtube.com') || externalLink.includes('youtu.be')) {
      const videoId = externalLink.includes('v=') 
        ? externalLink.split('v=')[1]?.split('&')[0] 
        : externalLink.split('be/')[1]?.split('?')[0];
      newTrack = {
        id: 'external-youtube',
        title: 'YouTube Track',
        artistLine: 'External Source',
        albumName: 'YouTube',
        albumImageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        durationMs: 0,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      };
    } else {
      // Assume direct MP3
      newTrack = {
        id: 'external-direct',
        title: 'External Song',
        artistLine: 'Direct Link',
        albumName: 'Web',
        albumImageUrl: activeTrack.albumImageUrl,
        durationMs: 0,
        previewUrl: externalLink,
      };
    }

    setActiveTrack(newTrack);
    setIsLinkInputOpen(false);
    setExternalLink('');
    
    // Automatically play if it's a direct link
    if (newTrack.previewUrl) {
      setTimeout(() => toggleTrack(newTrack), 100);
    }
  };

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

                  <article className={`hero-spotlight${playingTrackId ? ' is-playing' : ''}`} aria-label="Curated music player">
                    <div className="hero-spotlight__top">
                      <p className="hero-spotlight__eyebrow">Curated Mood</p>
                      <span className="hero-spotlight__badge">{currentPlaylist.tracks.length} Tracks</span>
                    </div>

                    <div className="hero-spotlight__art" aria-hidden="true">
                      {activeTrack.id === 'external-spotify' ? (
                        <div className="hero-spotlight__embed-container">
                          <iframe
                            src={activeTrack.embedUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title="External Media"
                          ></iframe>
                        </div>
                      ) : (
                        <>
                          <div className="hero-spotlight__vinyl">
                            <div className="hero-spotlight__vinyl-inner">
                              <div className="hero-spotlight__vinyl-label" style={{ backgroundImage: "url('/me.jpeg')" }} />
                            </div>
                          </div>
                          <div
                            className="hero-spotlight__art-inner hero-spotlight__art-inner--artwork"
                            style={playerArtworkStyle}
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
                        </>
                      )}
                    </div>

                    <div className="hero-spotlight__body">
                      <div className="hero-spotlight__track">
                        <button
                          type="button"
                          className={`hero-spotlight__play${playingTrackId === activeTrack.id ? ' is-playing' : ''}`}
                          onClick={() => toggleTrack(activeTrack)}
                          disabled={!activeTrack.previewUrl && !activeTrack.embedUrl}
                          title={playingTrackId === activeTrack.id ? 'Pause' : 'Play Preview'}
                        >
                          <div className="play-icon-container">
                            {playingTrackId === activeTrack.id ? (
                              <Volume2 size={20} strokeWidth={2.5} />
                            ) : (
                              <Play size={20} strokeWidth={2.5} fill="currentColor" />
                            )}
                          </div>
                        </button>

                        <div className="hero-spotlight__meta">
                          <h3>{activeTrack.title}</h3>
                          <p>{activeTrack.artistLine}</p>
                        </div>

                        <div className="hero-spotlight__time-container">
                          <button 
                            className="link-input-toggle" 
                            onClick={() => setIsLinkInputOpen(!isLinkInputOpen)}
                            title="Add song via link"
                          >
                            <MusicLink size={16} />
                          </button>
                          <span className="hero-spotlight__time">{totalTime}</span>
                        </div>
                      </div>

                      {isLinkInputOpen && (
                        <form className="hero-spotlight__link-form" onSubmit={handleLinkSubmit}>
                          <input 
                            type="text" 
                            placeholder="Paste Spotify or YouTube link..." 
                            value={externalLink}
                            onChange={(e) => setExternalLink(e.target.value)}
                            autoFocus
                          />
                          <button type="submit">Play</button>
                        </form>
                      )}

                      <div className="hero-spotlight__progress-wrap">
                        <div className="hero-spotlight__progress">
                          <span 
                            className="hero-spotlight__progress-fill" 
                            style={{ width: `${(playbackTime / (playbackDuration || 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="hero-spotlight__timeline" aria-hidden="true">
                        <span>{formatDurationLabel(playbackTime * 1000)}</span>
                        <span>{formatDurationLabel((playbackDuration || (activeTrack.durationMs / 1000)) * 1000)}</span>
                      </div>

                      <p className="hero-spotlight__copy">{currentPlaylist.description}</p>

                      <div className="hero-spotlight__footer">
                        <div className="hero-spotlight__chips" aria-label="Featured stack">
                          <span>{activeTrack.albumName}</span>
                          <span className="chip--accent">High Fidelity</span>
                        </div>
                        <div className="hero-spotlight__eq">
                          <div className="eq-bar"></div>
                          <div className="eq-bar"></div>
                          <div className="eq-bar"></div>
                        </div>
                      </div>
                    </div>
                  </article>
                  <div id="yt-player-hidden" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}></div>
                </div>
              </div>
            </section>

            <section id="frame" data-section className="feature-section panel">
              <div className="feature-stage feature-stage--mockup">
                <div className="feature-ambient-blobs">
                  <div className="ambient-blob blob-1"></div>
                  <div className="ambient-blob blob-2"></div>
                  <div className="ambient-blob blob-3"></div>
                </div>
                <div className="macbook-mockup">
                  <div className="macbook-lid">
                    <div className="macbook-screen">
                      <div className="macbook-notch"></div>
                      <div className="feature-video-wrapper">
                        <iframe
                          ref={videoIframeRef}
                          className="feature-video-frame"
                          src={currentMockupVideo}
                          title="Background Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        ></iframe>
                      </div>

                      <button
                        className="video-control video-control--mockup"
                        type="button"
                        onClick={toggleVideoMute}
                        aria-label={isVideoMuted ? 'Unmute background video' : 'Mute background video'}
                      >
                        {isVideoMuted ? (
                          <VolumeX size={14} strokeWidth={2.4} />
                        ) : (
                          <Volume2 size={14} strokeWidth={2.4} />
                        )}
                        <span>{isVideoMuted ? 'Unmute' : 'Mute'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="macbook-base">
                    <div className="macbook-base__top"></div>
                    <div className="macbook-base__front"></div>
                  </div>
                </div>

                {/* Mobile Mockup */}
                <div className="iphone-mockup">
                  <div className="iphone-frame">
                    <div className="iphone-screen">
                      <div className="iphone-island"></div>
                      <div className="feature-video-wrapper">
                        <iframe
                          className="feature-video-frame"
                          src={currentMockupVideo}
                          title="Background Video Mobile"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        ></iframe>
                      </div>

                      <button
                        className="video-control video-control--iphone"
                        type="button"
                        onClick={toggleVideoMute}
                        aria-label={isVideoMuted ? 'Unmute' : 'Mute'}
                      >
                        {isVideoMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="feature-philosophy">
                  {technicalPhilosophy.map((item) => (
                    <div key={item.title} className="philosophy-item">
                      <h4>{item.title}</h4>
                      <p>{item.copy}</p>
                    </div>
                  ))}
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
                      <div className="work-card__header">
                        <span className="work-index">{item.index}</span>
                        <div className="work-tech">
                          {item.tech?.map(t => <span key={t}>{t}</span>)}
                        </div>
                      </div>
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
