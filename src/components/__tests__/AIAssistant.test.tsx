import { render, screen, fireEvent } from '@testing-library/react';
import { AIAssistant } from '../AIAssistant';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AIAssistant Component', () => {
  test('renders the chat trigger button with aria-label', () => {
    render(<AIAssistant />);
    const button = screen.getByLabelText(/Open AI Assistant/i);
    expect(button).toBeInTheDocument();
  });

  test('opens the chat window when clicked', () => {
    render(<AIAssistant />);
    const button = screen.getByLabelText(/Open AI Assistant/i);
    fireEvent.click(button);
    
    const heading = screen.getByRole('heading', { name: /CivicPath AI/i });
    expect(heading).toBeInTheDocument();
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby', 'chat-heading');
  });
});
