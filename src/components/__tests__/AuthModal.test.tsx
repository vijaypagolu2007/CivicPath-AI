import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '../AuthModal';
import { useAuth } from '@/lib/useAuth';

jest.mock('@/lib/useAuth');

describe('AuthModal Component', () => {
  const mockLogin = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when isOpen is true', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('CivicPath AI')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('calls login and onClose on successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Continue with Google'));
    
    expect(mockLogin).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Auth Failed'));
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Continue with Google'));
    
    await waitFor(() => {
      expect(screen.getByText('Google Login failed.')).toBeInTheDocument();
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
