import { renderHook, act, waitFor } from '@testing-library/react';
import { useBoothMap } from '../useBoothMap';

describe('useBoothMap Hook', () => {
  let mockMapRef: any;

  beforeEach(() => {
    mockMapRef = {
      current: {
        panTo: jest.fn(),
        setZoom: jest.fn(),
      }
    };
    
    // Mock global google object
    (global as any).google = {
      maps: {
        importLibrary: jest.fn().mockResolvedValue({
          Place: {
            searchNearby: jest.fn().mockResolvedValue({
              places: [
                {
                  id: '1',
                  displayName: 'Test Booth',
                  formattedAddress: 'Test Address',
                  location: { lat: () => 10, lng: () => 20 }
                }
              ]
            })
          }
        }),
        Geocoder: jest.fn().mockImplementation(() => ({
          geocode: jest.fn().mockImplementation((req, cb) => {
            if (req.address.includes('111111')) {
              cb(null, 'ZERO_RESULTS');
            } else {
              cb([{ geometry: { location: { lat: () => 10, lng: () => 20 } } }], 'OK');
            }
          })
        }))
      }
    };
    
    // Mock navigator
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success) => 
        success({ coords: { latitude: 10, longitude: 20 } })
      )
    };
    (global as any).navigator.geolocation = mockGeolocation;
    
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default center and empty booths', () => {
    const { result } = renderHook(() => useBoothMap(mockMapRef));
    expect(result.current.center).toEqual({ lat: 28.6139, lng: 77.2090 });
    expect(result.current.booths).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('searches booths successfully', async () => {
    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    await act(async () => {
      await result.current.searchBooths({ lat: 10, lng: 20 });
    });
    
    expect(result.current.booths.length).toBe(1);
    expect(result.current.booths[0].name).toContain('Test Booth');
  });

  it('handles use location', async () => {
    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    act(() => {
      result.current.handleUseLocation();
    });
    
    await waitFor(() => {
      expect(result.current.booths.length).toBe(1);
    });
    expect(result.current.center).toEqual({ lat: 10, lng: 20 });
    expect(mockMapRef.current.panTo).toHaveBeenCalledWith({ lat: 10, lng: 20 });
  });

  it('handles pin search valid', async () => {
    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    act(() => {
      result.current.handlePinSearch('123456');
    });
    
    await waitFor(() => {
      expect(result.current.booths.length).toBe(1);
    });
    expect(result.current.center).toEqual({ lat: 10, lng: 20 });
    expect(mockMapRef.current.panTo).toHaveBeenCalledWith({ lat: 10, lng: 20 });
  });

  it('rejects invalid pin', async () => {
    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    await act(async () => {
      await result.current.handlePinSearch('123');
    });
    
    expect(window.alert).toHaveBeenCalledWith('Please enter a valid 6-digit PIN code.');
  });

  it('handles geolocation failure', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success, error) => 
        error({ code: 1, message: 'Denied' })
      )
    };
    (global as any).navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    act(() => {
      result.current.handleUseLocation();
    });
    
    expect(window.alert).toHaveBeenCalledWith('Error: The Geolocation service failed.');
  });

  it('handles unsupported geolocation', async () => {
    // @ts-ignore
    delete (global as any).navigator.geolocation;

    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    act(() => {
      result.current.handleUseLocation();
    });
    
    expect(window.alert).toHaveBeenCalledWith("Error: Your browser doesn't support geolocation.");
  });

  it('handles geocode failure for pin search', async () => {
    (global as any).google.maps.Geocoder = jest.fn().mockImplementation(() => ({
      geocode: jest.fn().mockImplementation((req, cb) => cb(null, 'ZERO_RESULTS'))
    }));

    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    act(() => {
      result.current.handlePinSearch('111111');
    });
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Could not find location for this PIN code.');
    });
  });

  it('handles searchBooths errors gracefully', async () => {
    (global as any).google.maps.importLibrary = jest.fn().mockRejectedValue(new Error('Library error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useBoothMap(mockMapRef));
    
    await act(async () => {
      await result.current.searchBooths({ lat: 10, lng: 20 });
    });
    
    expect(result.current.booths).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
