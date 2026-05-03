import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIAssistant } from '../AIAssistant';

// Mock fetch
global.fetch = jest.fn();

describe('AIAssistant Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the floating chat button', () => {
    render(<AIAssistant />);
    expect(screen.getByLabelText('Open AI Assistant')).toBeInTheDocument();
  });

  it('opens and closes the chat window', () => {
    render(<AIAssistant />);
    const openBtn = screen.getByLabelText('Open AI Assistant');
    fireEvent.click(openBtn);
    expect(screen.getByText('CivicPath AI')).toBeInTheDocument();
    
    const closeBtn = screen.getByLabelText('Close chat');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('CivicPath AI')).not.toBeInTheDocument();
  });

  it('sends a message and displays response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'Test response' }),
    });

    render(<AIAssistant />);
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText('Ask a question...');
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Test response')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Quota exceeded'));

    render(<AIAssistant />);
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText('Ask a question...');
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/overwhelmed with requests/)).toBeInTheDocument();
    });
  });
});
