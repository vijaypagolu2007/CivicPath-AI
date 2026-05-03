import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BoothFinder } from '../BoothFinder';
import { useBoothMap } from '../../hooks/useBoothMap';
import { useJsApiLoader } from '@react-google-maps/api';

jest.mock('../../hooks/useBoothMap');
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children, onLoad }: any) => {
    if (onLoad) {
      // Simulate map load
      setTimeout(() => onLoad({ panTo: jest.fn(), setZoom: jest.fn() }), 0);
    }
    return <div data-testid="google-map">{children}</div>;
  },
  useJsApiLoader: jest.fn(),
  useGoogleMap: jest.fn().mockReturnValue({}),
  InfoWindow: ({ children, onCloseClick }: any) => (
    <div data-testid="info-window">
      <button onClick={onCloseClick} data-testid="info-close">Close</button>
      {children}
    </div>
  ),
}));

describe('BoothFinder Component', () => {
  const mockHandlePinSearch = jest.fn();
  const mockHandleUseLocation = jest.fn();
  const mockSearchBooths = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: true });
    
    (global as any).google = {
      maps: {
        importLibrary: jest.fn().mockResolvedValue({
          AdvancedMarkerElement: jest.fn().mockImplementation(() => ({
            addEventListener: jest.fn()
          }))
        })
      }
    };
    
    (useBoothMap as jest.Mock).mockReturnValue({
      center: { lat: 28.6, lng: 77.2 },
      loading: false,
      booths: [],
      searchBooths: mockSearchBooths,
      handleUseLocation: mockHandleUseLocation,
      handlePinSearch: mockHandlePinSearch,
    });
  });

  it('renders loading state when map is not loaded', () => {
    (useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: false });
    render(<BoothFinder />);
    expect(screen.queryByText('Polling Booth Finder')).not.toBeInTheDocument();
  });

  it('renders map and controls when loaded', () => {
    render(<BoothFinder />);
    expect(screen.getByText('Polling Booth Finder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter 6-digit PIN Code')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Near Me')).toBeInTheDocument();
  });

  it('handles pin search submission', () => {
    render(<BoothFinder />);
    const input = screen.getByPlaceholderText('Enter 6-digit PIN Code');
    fireEvent.change(input, { target: { value: '110001' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    expect(mockHandlePinSearch).toHaveBeenCalledWith('110001');
  });

  it('handles use location click', () => {
    render(<BoothFinder />);
    fireEvent.click(screen.getByText('Near Me'));
    expect(mockHandleUseLocation).toHaveBeenCalled();
  });

  it('renders booths when available', () => {
    (useBoothMap as jest.Mock).mockReturnValue({
      center: { lat: 28.6, lng: 77.2 },
      loading: false,
      booths: [
        { id: '1', name: 'Booth A', lat: 28.61, lng: 77.21, address: 'Address A' }
      ],
      searchBooths: mockSearchBooths,
      handleUseLocation: mockHandleUseLocation,
      handlePinSearch: mockHandlePinSearch,
    });

    render(<BoothFinder />);
    // Note: AdvancedMarkerElement is tricky to test since it returns null in our mock, 
    // but we can ensure the "No booths found" message is absent.
    expect(screen.queryByText(/No booths found/)).not.toBeInTheDocument();
  });

  it('renders info message when no booths found', () => {
    render(<BoothFinder />);
    expect(screen.getByText(/No booths found/)).toBeInTheDocument();
  });

  it('triggers initial search on map load if API key is present', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

    render(<BoothFinder />);
    
    await waitFor(() => {
      expect(mockSearchBooths).toHaveBeenCalledWith({ lat: 28.6, lng: 77.2 });
    });

    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalEnv;
  });

  it('simulates custom marker rendering', async () => {
    (useBoothMap as jest.Mock).mockReturnValue({
      center: { lat: 28.6, lng: 77.2 },
      loading: false,
      booths: [
        { id: '1', name: 'Booth A', lat: 28.61, lng: 77.21, address: 'Address A' }
      ],
      searchBooths: mockSearchBooths,
      handleUseLocation: mockHandleUseLocation,
      handlePinSearch: mockHandlePinSearch,
    });

    // Mock global google object for AdvancedMarkerElement
    const mockAddEventListener = jest.fn();
    const mockAdvancedMarkerElement = jest.fn().mockImplementation(() => ({
      addEventListener: mockAddEventListener,
      map: null,
    }));

    (global as any).google = {
      maps: {
        importLibrary: jest.fn().mockResolvedValue({
          AdvancedMarkerElement: mockAdvancedMarkerElement
        })
      }
    };

    const { unmount } = render(<BoothFinder />);
    
    await waitFor(() => {
      expect((global as any).google.maps.importLibrary).toHaveBeenCalledWith('marker');
      expect(mockAdvancedMarkerElement).toHaveBeenCalled();
      expect(mockAddEventListener).toHaveBeenCalledWith('gmp-click', expect.any(Function));
    });

    // Simulate clicking the marker to open info window
    const clickHandler = mockAddEventListener.mock.calls[0][1];
    
    // Call the click handler inside act
    act(() => {
      clickHandler();
    });

    await waitFor(() => {
      expect(screen.getByTestId('info-window')).toBeInTheDocument();
      expect(screen.getByText('Booth A')).toBeInTheDocument();
      expect(screen.getByText('Address A')).toBeInTheDocument();
    });

    // Simulate closing the info window
    fireEvent.click(screen.getByTestId('info-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('info-window')).not.toBeInTheDocument();
    });

    unmount();
  });
});
