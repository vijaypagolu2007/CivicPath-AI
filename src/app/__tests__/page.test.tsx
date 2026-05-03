import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Home from '../page';
import { useAuth } from '@/lib/useAuth';
import { getLocalData, saveLocalData, trackEvent } from '@/lib/store';

// Mock child components
jest.mock('@/components/AuthModal', () => ({ AuthModal: () => null }));
jest.mock('@/components/ui/Toast', () => ({ Toast: () => null }));
jest.mock('@/components/Checklist', () => ({ Checklist: () => <div data-testid="mock-checklist" /> }));
jest.mock('@/components/MockBallot', () => ({ MockBallot: () => <div data-testid="mock-ballot" /> }));
jest.mock('@/components/Quiz', () => ({ Quiz: () => <div data-testid="mock-quiz" /> }));
jest.mock('@/components/Certificate', () => ({ Certificate: () => <div data-testid="mock-cert" /> }));
jest.mock('@/components/BoothFinder', () => ({ BoothFinder: () => <div data-testid="mock-booth" /> }));
jest.mock('@/components/AIAssistant', () => ({ AIAssistant: () => null }));

jest.mock('@/lib/useAuth');
jest.mock('@/lib/store');

const mockUseAuth = useAuth as jest.Mock;
const mockGetLocalData = getLocalData as jest.Mock;

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLocalData.mockReturnValue({ voterType: 'first' });
    mockUseAuth.mockReturnValue({ user: null, loading: false });
  });

  it('renders correctly', () => {
    render(<Home />);
    expect(screen.getByText('CivicPath AI')).toBeInTheDocument();
  });

  it('switches tabs', () => {
    render(<Home />);
    const ballotTab = screen.getByText('Mock Ballot').closest('button');
    fireEvent.click(ballotTab!);
    expect(screen.getByTestId('mock-ballot')).toBeInTheDocument();
  });

  it('toggles booth finder', () => {
    render(<Home />);
    const mapBtn = screen.getByText(/Locate Booth/i).closest('button');
    fireEvent.click(mapBtn!);
    expect(screen.getByTestId('mock-booth')).toBeInTheDocument();
  });

  it('handles onboarding', () => {
    mockGetLocalData.mockReturnValue({});
    render(<Home />);
    const btn = screen.getByText(/I am a First-Time Voter/i);
    fireEvent.click(btn);
    expect(saveLocalData).toHaveBeenCalled();
  });
});
