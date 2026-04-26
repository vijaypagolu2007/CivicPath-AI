import { getLocalData, saveLocalData } from './store';

jest.mock('./firebase', () => ({
  auth: {},
  db: {},
  analytics: Promise.resolve(null),
}));

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string) {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Store utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('getLocalData should return empty object if no data in localStorage', () => {
    const data = getLocalData();
    expect(data).toEqual({});
  });

  it('saveLocalData should save data to localStorage and merge properly', () => {
    saveLocalData({ voterType: 'first' });
    let data = getLocalData();
    expect(data.voterType).toBe('first');

    saveLocalData({ quizScore: 80 });
    data = getLocalData();
    expect(data.voterType).toBe('first'); // should merge, not overwrite entirely
    expect(data.quizScore).toBe(80);
  });
});
