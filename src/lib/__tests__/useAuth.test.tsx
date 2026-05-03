import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../useAuth';
import { signInWithPopup, signOut, onAuthStateChanged, getAuth } from 'firebase/auth';
import React from 'react';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('../store', () => ({
  syncDataToFirestore: jest.fn().mockResolvedValue({ isReturning: false }),
  cacheUserInfo: jest.fn(),
  getCachedUser: jest.fn().mockReturnValue(null),
}));

describe('useAuth Hook', () => {
  const mockUser = { uid: '123', displayName: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides null user initially', () => {
    (onAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('handles login success', async () => {
    (signInWithPopup as jest.Mock).mockResolvedValueOnce({ user: mockUser });
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login();
    });

    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('handles logout', async () => {
    (signOut as jest.Mock).mockResolvedValueOnce(undefined);
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalled();
  });
});
