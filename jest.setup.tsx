import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock Firebase for all tests
jest.mock('./src/lib/firebase', () => ({
  auth: {},
  db: {},
  analytics: Promise.resolve({}),
  googleProvider: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
  logEvent: jest.fn(),
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  const motionProxy = (Tag: string) => {
    const Component = ({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }: any) => {
      return React.createElement(Tag, props, children);
    };
    Component.displayName = `motion.${Tag}`;
    return Component;
  };

  return {
    motion: {
      div: motionProxy('div'),
      button: motionProxy('button'),
      header: motionProxy('header'),
      main: motionProxy('main'),
      span: motionProxy('span'),
      p: motionProxy('p'),
      h1: motionProxy('h1'),
      h2: motionProxy('h2'),
      form: motionProxy('form'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt="" {...props} />,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

jest.mock('lucide-react', () => {
  const React = require('react');
  const IconMock = (props: any) => React.createElement('div', { ...props, 'data-testid': 'lucide-icon' });
  
  const icons = [
    'ChevronRight', 'ChevronLeft', 'GraduationCap', 'LogIn', 'LogOut', 'MapPin', 
    'UserPlus', 'Award', 'Search', 'Check', 'X', 'Send', 'User', 'Bot', 
    'MessageSquare', 'Loader2', 'CheckCircle2', 'Circle', 'ExternalLink', 
    'Info', 'Star', 'Fingerprint', 'Monitor', 'RotateCcw', 'AlertCircle', 
    'Volume2', 'ShieldAlert', 'XCircle', 'Flag', 'Activity', 'Clock', 'HelpCircle',
    'Vote', 'ClipboardList', 'Megaphone', 'Users', 'Building2', 'CheckSquare',
    'ShieldCheck', 'ArrowRight', 'Printer', 'Download', 'FileCheck', 'PartyPopper', 'Navigation'
  ];

  const mockIcons: any = {
    __esModule: true,
  };

  icons.forEach(icon => {
    mockIcons[icon] = (props: any) => React.createElement('div', { ...props, 'data-testid': `icon-${icon.toLowerCase()}` });
  });

  return mockIcons;
});

// Mock AudioContext
(global as any).AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    type: '',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    gain: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
  }),
  destination: {},
  currentTime: 0,
  close: jest.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => ({}),
}));
