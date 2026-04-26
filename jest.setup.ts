import '@testing-library/jest-dom';

// Mock Firebase for all tests
jest.mock('./src/lib/firebase', () => ({
  auth: {},
  db: {},
  analytics: Promise.resolve({}),
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
