import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProcessViewer } from '../ProcessViewer';


jest.mock('@/data/india', () => ({
  electionData: {
    system: 'Test System',
    overview: 'Test Overview',
    steps: [
      { id: '1', title: 'Test Step 1', description: 'Description 1', who: 'Authority 1', icon: 'User' },
      { id: '2', title: 'Test Step 2', description: 'Description 2', who: 'Authority 2', icon: 'CheckCircle' },
    ],
    timeline: [
      { stage: 'Test Stage 1', duration: '1 Day', description: 'Stage 1 Desc' },
      { stage: 'Test Stage 2', duration: '2 Days', description: 'Stage 2 Desc' },
    ]
  }
}));

describe('ProcessViewer', () => {
  test('renders the overview section correctly', () => {
    render(<ProcessViewer />);
    expect(screen.getByText('System: Test System')).toBeInTheDocument();
    expect(screen.getByText('Test Overview')).toBeInTheDocument();
  });

  test('renders steps correctly', () => {
    render(<ProcessViewer />);
    expect(screen.getByText('1. Test Step 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Authority 1')).toBeInTheDocument();

    expect(screen.getByText('2. Test Step 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('Authority 2')).toBeInTheDocument();
  });

  test('renders timeline correctly', () => {
    render(<ProcessViewer />);
    expect(screen.getByText('Election Lifecycle')).toBeInTheDocument();
    
    expect(screen.getByText('Test Stage 1')).toBeInTheDocument();
    expect(screen.getByText('1 Day')).toBeInTheDocument();
    expect(screen.getByText('Stage 1 Desc')).toBeInTheDocument();

    expect(screen.getByText('Test Stage 2')).toBeInTheDocument();
    expect(screen.getByText('2 Days')).toBeInTheDocument();
    expect(screen.getByText('Stage 2 Desc')).toBeInTheDocument();
  });
});
