import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Certificate } from '../Certificate';

describe('Certificate Component', () => {
  it('renders certificate with user name', () => {
    const mockUser = { displayName: 'John Doe' } as any;
    render(<Certificate user={mockUser} onExport={jest.fn()} />);
    
    expect(screen.getByText("You're Election Ready!")).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders fallback for anonymous user', () => {
    render(<Certificate user={null} onExport={jest.fn()} />);
    
    expect(screen.getByText('Informed Citizen')).toBeInTheDocument();
  });

  it('calls onExport when download button is clicked', () => {
    const mockExport = jest.fn();
    render(<Certificate user={null} onExport={mockExport} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Download PDF/i }));
    expect(mockExport).toHaveBeenCalled();
  });
});
