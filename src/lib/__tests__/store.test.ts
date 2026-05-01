import { getLocalData, saveLocalData, SessionData, trackEvent, cacheUserInfo, getCachedUser, loadSession, saveSession, syncDataToFirestore } from '../store';
import { logEvent } from 'firebase/analytics';
import { getDoc, setDoc } from 'firebase/firestore';

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

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: {},
  db: {}, // Defined so it evaluates to truthy
  analytics: Promise.resolve({}),
}));

jest.mock('firebase/analytics', () => ({
  logEvent: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

describe('Store Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Local Data', () => {
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

  describe('Analytics', () => {
    test('trackEvent should call logEvent', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await trackEvent('test_event', { key: 'value' });
      expect(logEvent).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] test_event', { key: 'value' });
      consoleSpy.mockRestore();
    });
  });

  describe('Caching User Info', () => {
    test('should cache user info', () => {
      const user = { uid: '123', displayName: 'Test User', photoURL: null };
      cacheUserInfo(user);
      expect(getCachedUser()).toEqual(user);
    });

    test('should clear cached user when passing null', () => {
      cacheUserInfo({ uid: '123', displayName: 'Test User', photoURL: null });
      cacheUserInfo(null);
      expect(getCachedUser()).toBeNull();
    });
  });

  describe('Firestore Sync', () => {
    const mockUid = 'test-uid';

    test('loadSession falls back to local data if firestore load fails or missing uid', async () => {
      saveLocalData({ quizScore: 42 });
      const data = await loadSession(); // no uid
      expect(data.quizScore).toBe(42);

      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const data2 = await loadSession(mockUid);
      expect(data2.quizScore).toBe(42);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('loadSession loads from firestore and updates local data', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ quizScore: 99, voterType: 'first' })
      });

      const data = await loadSession(mockUid);
      expect(data.quizScore).toBe(99);
      expect(getLocalData().quizScore).toBe(99);
    });

    test('saveSession saves locally and to firestore', async () => {
      await saveSession({ quizScore: 88 }, mockUid);
      expect(getLocalData().quizScore).toBe(88);
      expect(setDoc).toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalled(); // trackEvent is called inside
    });

    test('saveSession handles firestore error gracefully', async () => {
      (setDoc as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      await saveSession({ quizScore: 77 }, mockUid);
      expect(getLocalData().quizScore).toBe(77);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('syncDataToFirestore merges smart correctly when returning', async () => {
      saveLocalData({ quizScore: 50, checklistCompletion: [1], voterType: 'first' });
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ quizScore: 80, checklistCompletion: [2], voterType: 'returning' })
      });

      const { isReturning } = await syncDataToFirestore(mockUid);
      expect(isReturning).toBe(true);
      expect(setDoc).toHaveBeenCalled();
      const localData = getLocalData();
      expect(localData.quizScore).toBe(80); // max of 50 and 80
      expect(localData.checklistCompletion).toEqual(expect.arrayContaining([1, 2]));
      expect(localData.voterType).toBe('first'); // local overrides remote if local exists
    });

    test('syncDataToFirestore handles firestore error', async () => {
      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { isReturning } = await syncDataToFirestore(mockUid);
      expect(isReturning).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
