import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Quiz } from '../Quiz';
import { loadSession, saveSession, trackEvent } from '@/lib/store';
import { electionData } from '@/data/india';

// Mock store
jest.mock('@/lib/store', () => ({
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  trackEvent: jest.fn(),
}));

describe('Quiz Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadSession as jest.Mock).mockResolvedValue({});
    window.print = jest.fn();
  });

  it('renders the first question', async () => {
    render(<Quiz user={null} />);
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    });
  });

  it('shows explanation after selecting an option and advances to next', async () => {
    render(<Quiz user={null} />);
    
    await waitFor(() => {
      expect(screen.getByText(electionData.quiz[0].question)).toBeInTheDocument();
    });

    const firstQuestionOptions = screen.getAllByRole('button');
    // Click the correct answer for the first question
    const correctIdx = electionData.quiz[0].correctAnswer;
    fireEvent.click(firstQuestionOptions[correctIdx]);
    
    expect(screen.getByText('Correct Analysis!')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Continue to Next Segment|Complete Verification/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/Question 2 of/i)).toBeInTheDocument();
    });
  });

  it('completes quiz with perfect score and shows certificate', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' } as any;
    render(<Quiz user={mockUser} />);
    
    for (let i = 0; i < electionData.quiz.length; i++) {
      await waitFor(() => {
        expect(screen.getByText(electionData.quiz[i].question)).toBeInTheDocument();
      });
      const correctIdx = electionData.quiz[i].correctAnswer;
      // Because there are span elements inside buttons, we should find buttons that are options
      // The options are the first 4 buttons usually.
      // But it's safer to find by text if possible, or we know the first few buttons are options.
      // A better way is to query all buttons and pick the correct one
      const buttons = screen.getAllByRole('button');
      // The option buttons are the ones before the "Next" button appears
      fireEvent.click(buttons[correctIdx]);
      
      const nextBtn = screen.getByRole('button', { name: /Continue to Next Segment|Complete Verification/i });
      fireEvent.click(nextBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('CIVIC MASTER')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    expect(saveSession).toHaveBeenCalledWith({ quizScore: electionData.quiz.length }, '123');
    expect(trackEvent).toHaveBeenCalledWith('quiz_completed', { score: electionData.quiz.length });

    // Print certificate
    fireEvent.click(screen.getByText(/Print Certificate/i));
    expect(window.print).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith('certificate_printed');

    // Try again
    fireEvent.click(screen.getByText(/Try Again/i));
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    });
  });

  it('completes quiz with imperfect score', async () => {
    render(<Quiz user={null} />);
    
    for (let i = 0; i < electionData.quiz.length; i++) {
      await waitFor(() => {
        expect(screen.getByText(electionData.quiz[i].question)).toBeInTheDocument();
      });
      // Always click the WRONG answer (if correct is 0, click 1, else 0)
      const correctIdx = electionData.quiz[i].correctAnswer;
      const wrongIdx = correctIdx === 0 ? 1 : 0;
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[wrongIdx]);
      
      const nextBtn = screen.getByRole('button', { name: /Continue to Next Segment|Complete Verification/i });
      fireEvent.click(nextBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
      expect(screen.getByText(/You scored/)).toBeInTheDocument();
    });

    // Restart Quiz
    fireEvent.click(screen.getByText(/Restart Quiz/i));
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    });
  });

  it('shows Save to Cloud button for anonymous users with perfect score', async () => {
    (loadSession as jest.Mock).mockResolvedValue({
      quizScore: electionData.quiz.length,
    });

    render(<Quiz user={null} />);
    
    await waitFor(() => {
      expect(screen.getByText('CIVIC MASTER')).toBeInTheDocument();
    });

    const saveCloudBtn = screen.getByText(/Save to Cloud/i);
    expect(saveCloudBtn).toBeInTheDocument();

    const mockSigninBtn = document.createElement('button');
    mockSigninBtn.id = 'signin-btn';
    mockSigninBtn.click = jest.fn();
    document.body.appendChild(mockSigninBtn);

    fireEvent.click(saveCloudBtn);
    expect(mockSigninBtn.click).toHaveBeenCalled();
    document.body.removeChild(mockSigninBtn);
  });

  it('loads completed quiz from session', async () => {
    (loadSession as jest.Mock).mockResolvedValue({
      quizScore: electionData.quiz.length,
      certificateMeta: { name: 'Loaded User', date: '01/01/2026' }
    });

    render(<Quiz user={null} />);
    
    await waitFor(() => {
      expect(screen.getByText('CIVIC MASTER')).toBeInTheDocument();
      expect(screen.getByText('Loaded User')).toBeInTheDocument();
      expect(screen.getByText('01/01/2026')).toBeInTheDocument();
    });
  });
});
