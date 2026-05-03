import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(<Input label="Label" helperText="Helper Text" />);
    expect(screen.getByText('Helper Text')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input label="Label" helperText="Error Message" error />);
    const helper = screen.getByText('Error Message');
    expect(helper).toHaveClass('text-red-500');
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('handles onChange events', () => {
    const handleChange = jest.fn();
    render(<Input label="Label" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input label="Label" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
