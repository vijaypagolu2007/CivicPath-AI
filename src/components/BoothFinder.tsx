"use client";

import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, useGoogleMap, InfoWindow, Libraries } from '@react-google-maps/api';
import { MapPin, Navigation, Search, Loader2, Info } from 'lucide-react';
import { useBoothMap, Booth } from '../hooks/useBoothMap';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const LIBRARIES: Libraries = ['places'];

// Native AdvancedMarker Component to bypass deprecation warnings
const CustomAdvancedMarker = ({ position, onClick, title }: { position: {lat: number, lng: number}, onClick: () => void, title?: string }) => {
  const map = useGoogleMap();
  
  useEffect(() => {
    if (!map) return;
    let marker: any = null;
    
    google.maps.importLibrary("marker").then((lib) => {
      const { AdvancedMarkerElement } = lib as any;
      marker = new AdvancedMarkerElement({
        map,
        position,
        title,
      });

      if (onClick) {
        marker.addEventListener('gmp-click', onClick);
      }
    });

    return () => {
      if (marker) marker.map = null;
    };
  }, [map, position.lat, position.lng]);

  return null;
};

export const BoothFinder = () => {
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [pinCode, setPinCode] = useState('');
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const { 
    center, loading, booths, 
    searchBooths, handleUseLocation, handlePinSearch 
  } = useBoothMap(mapRef);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES
  });

  const onSubmitPinSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handlePinSearch(pinCode);
  };

  if (!isLoaded) return (
    <div className="h-[500px] bg-gray-100 rounded-3xl flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="space-y-6 py-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Polling Booth Finder</h3>
        <p className="text-gray-500 font-medium mb-8">Locate nearest stations using Places API integration.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={onSubmitPinSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Enter 6-digit PIN Code" 
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-500 outline-none font-bold transition-all shadow-inner"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              Search
            </button>
          </form>
          
          <button 
            onClick={handleUseLocation}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
            Near Me
          </button>
        </div>

        <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-2xl">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={map => { 
              mapRef.current = map;
              // Initial search if API key exists
              if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
                searchBooths(center);
              }
            }}
            options={{
              // styles: mapStyles, // Deprecated: Styles must be managed in Google Cloud Console when using mapId
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: "cooperative",
              mapId: "DEMO_MAP_ID" // Required for AdvancedMarkerElement
            }}
          >
            {booths.map(booth => (
              <CustomAdvancedMarker 
                key={booth.id} 
                position={{ lat: booth.lat, lng: booth.lng }} 
                onClick={() => setSelectedBooth(booth)}
                title={booth.name}
              />
            ))}

            {selectedBooth && (
              <InfoWindow
                position={{ lat: selectedBooth.lat, lng: selectedBooth.lng }}
                onCloseClick={() => setSelectedBooth(null)}
              >
                <div className="p-3 min-w-[200px] max-w-[250px]">
                  <h4 className="font-black text-gray-900 mb-1 text-sm">{selectedBooth.name}</h4>
                  <p className="text-[11px] text-gray-500 font-bold mb-3 leading-relaxed">{selectedBooth.address}</p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBooth.lat},${selectedBooth.lng}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-blue-50 text-blue-600 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                  >
                    Get Directions
                  </a>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {booths.length === 0 && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
              <Info size={14} className="text-amber-500" />
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">No booths found. Try a different area.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStyles = [
  { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
  { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
  { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#cbd5e1" }, { "visibility": "on" }] }
];
