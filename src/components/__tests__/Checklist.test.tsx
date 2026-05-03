import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Checklist } from '../Checklist';
import { loadSession, saveSession, trackEvent } from '@/lib/store';
import { electionData } from '@/data/india';

jest.mock('@/lib/store', () => ({
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  trackEvent: jest.fn(),
}));

describe('Checklist Component', () => {
  const mockUser = { uid: '123' } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (loadSession as jest.Mock).mockResolvedValue({ checklistCompletion: [] });
  });

  it('renders correctly for first-time voter', async () => {
    render(<Checklist voterType="first" user={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Voter Readiness')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });
  });

  it('toggles task completion and saves session', async () => {
    render(<Checklist voterType="first" user={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText(electionData.checklist[0].task)).toBeInTheDocument();
    });

    const firstTaskButton = screen.getByText(electionData.checklist[0].task).closest('button');
    fireEvent.click(firstTaskButton!);

    await waitFor(() => {
      expect(saveSession).toHaveBeenCalled();
    });
  });

  it('tracks checklist completion when all items are done', async () => {
    render(<Checklist voterType="first" user={null} />);
    
    await waitFor(() => {
      expect(screen.getByText(electionData.checklist[0].task)).toBeInTheDocument();
    });

    // Toggle all items
    for (const item of electionData.checklist) {
      const text = screen.getByText(item.task);
      const btn = text.closest('button');
      fireEvent.click(btn!);
    }

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('checklist_completed');
    });
  });

  it('stops propagation on external link click', async () => {
    render(<Checklist voterType="first" user={null} />);
    
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      fireEvent.click(links[0]);
    });
  });
});
