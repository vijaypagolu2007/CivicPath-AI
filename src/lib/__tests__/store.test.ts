import { getLocalData, saveLocalData, SessionData } from '../store';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Store Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should return empty object when no data in localStorage', () => {
    const data = getLocalData();
    expect(data).toEqual({});
  });

  test('should save and retrieve data correctly', () => {
    const session: Partial<SessionData> = { quizScore: 80, voterType: 'first' };
    saveLocalData(session);
    
    const retrieved = getLocalData();
    expect(retrieved.quizScore).toBe(80);
    expect(retrieved.voterType).toBe('first');
  });

  test('should merge partial updates', () => {
    saveLocalData({ quizScore: 50 });
    saveLocalData({ voterType: 'returning' });
    
    const retrieved = getLocalData();
    expect(retrieved.quizScore).toBe(50);
    expect(retrieved.voterType).toBe('returning');
  });
});
