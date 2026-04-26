import { useState, useCallback } from 'react';

export interface Booth {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export function useBoothMap(mapRef: React.MutableRefObject<google.maps.Map | null>) {
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi
  const [loading, setLoading] = useState(false);
  const [booths, setBooths] = useState<Booth[]>([]);

  const searchBooths = useCallback(async (location: { lat: number, lng: number }) => {
    if (!mapRef.current) return;

    try {
      const { Place } = await google.maps.importLibrary("places") as any;
      
      const request = {
        fields: ['id', 'displayName', 'formattedAddress', 'location'],
        locationRestriction: {
          center: location,
          radius: 5000,
        },
        includedTypes: ['school', 'primary_school', 'secondary_school', 'local_government_office', 'city_hall', 'community_center'],
        maxResultCount: 20
      };

      // @ts-ignore
      const { places } = await Place.searchNearby(request);

      if (places && places.length > 0) {
        const uniqueLocations = new Map();
        
        places.forEach((place: any) => {
          const lat = place.location?.lat();
          const lng = place.location?.lng();
          
          if (lat && lng) {
            const gridKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
            if (!uniqueLocations.has(gridKey)) {
              uniqueLocations.set(gridKey, place);
            }
          }
        });

        const distinctPlaces = Array.from(uniqueLocations.values()).slice(0, 7);

        const foundBooths = distinctPlaces.map((place: any) => ({
          id: place.id || Math.random().toString(),
          name: (place.displayName || 'Polling Station') + ' (Designated Booth)',
          address: place.formattedAddress || 'Nearby Address',
          lat: place.location?.lat() || 0,
          lng: place.location?.lng() || 0
        }));
        setBooths(foundBooths);
      } else {
        setBooths([]);
      }
    } catch (error) {
      console.error("Error fetching booths:", error);
      setBooths([]);
    }
  }, [mapRef]);

  const handleUseLocation = useCallback(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(pos);
          setLoading(false);
          if (mapRef.current) {
            mapRef.current.panTo(pos);
            mapRef.current.setZoom(14);
          }
          searchBooths(pos);
        },
        () => {
          alert("Error: The Geolocation service failed.");
          setLoading(false);
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
      setLoading(false);
    }
  }, [mapRef, searchBooths]);

  const handlePinSearch = useCallback(async (pinCode: string) => {
    if (pinCode.length !== 6) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }
    setLoading(true);
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${pinCode}, India` }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const pos = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        setCenter(pos);
        if (mapRef.current) {
          mapRef.current.panTo(pos);
          mapRef.current.setZoom(14);
        }
        searchBooths(pos);
      } else {
        alert('Could not find location for this PIN code.');
      }
      setLoading(false);
    });
  }, [mapRef, searchBooths]);

  return {
    center,
    setCenter,
    loading,
    booths,
    searchBooths,
    handleUseLocation,
    handlePinSearch
  };
}
