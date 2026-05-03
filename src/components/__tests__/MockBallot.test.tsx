import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MockBallot } from '../MockBallot';

jest.mock('@/lib/store', () => ({
  trackEvent: jest.fn(),
}));

jest.useFakeTimers();

describe('MockBallot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for AudioContext
    (window as any).AudioContext = jest.fn().mockImplementation(() => ({
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
      currentTime: 0,
      destination: {},
      close: jest.fn(),
    }));
  });

  it('renders initial verification step', () => {
    render(<MockBallot />);
    expect(screen.getByText('Identity Verification')).toBeInTheDocument();
  });

  it('proceeds to ink step on confirm', () => {
    render(<MockBallot />);
    fireEvent.click(screen.getByText('Confirm Verification'));
    expect(screen.getByText('Indelible Inking')).toBeInTheDocument();
  });

  it('simulates error edge case', () => {
    render(<MockBallot />);
    fireEvent.click(screen.getByText('Test Edge Case: Name Missing'));
    fireEvent.click(screen.getByText('Confirm Verification'));
    expect(screen.getByText('Name Not Found!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Go Back & Try Again'));
    expect(screen.getByText('Identity Verification')).toBeInTheDocument();
  });

  it('proceeds to voting step and finishes', async () => {
    render(<MockBallot />);
    fireEvent.click(screen.getByText('Confirm Verification'));
    fireEvent.click(screen.getByText('Sign & Continue'));
    
    const voteButtons = screen.getAllByRole('button', { name: /Vote for/i });
    fireEvent.click(voteButtons[0]);
    
    expect(screen.getByText("Don't Leave Booth (7s)")).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(7000);
    });
    act(() => {
      jest.advanceTimersByTime(800);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Vote Successfully Cast!')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByLabelText('Reset EVM Simulation'));
    expect(screen.getByText('Identity Verification')).toBeInTheDocument();
  });

  it('navigates back using the back buttons', () => {
    render(<MockBallot />);
    fireEvent.click(screen.getByText('Confirm Verification'));
    fireEvent.click(screen.getByLabelText('Back to Identity Verification'));
    expect(screen.getByText('Identity Verification')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Confirm Verification'));
    fireEvent.click(screen.getByText('Sign & Continue'));
    fireEvent.click(screen.getByLabelText('Back to Inking Stage'));
    expect(screen.getByText('Indelible Inking')).toBeInTheDocument();
  });

  it('handles audio context failure gracefully', () => {
    (window as any).AudioContext = jest.fn().mockImplementation(() => {
      throw new Error('Audio failure');
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<MockBallot />);
    fireEvent.click(screen.getByText('Confirm Verification'));
    fireEvent.click(screen.getByText('Sign & Continue'));
    
    const voteBtns = screen.getAllByLabelText(/Vote for/);
    fireEvent.click(voteBtns[0]);

    expect(warnSpy).toHaveBeenCalledWith("Audio context not supported", expect.any(Error));
    warnSpy.mockRestore();
  });
});
