import { useEffect, useRef, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapViewProps {
  communities: Array<{
    name: string;
    location: string;
    petCount: number;
    walkerCount: number;
    rating: number;
    activeWalks: number;
    tower: string;
  }>;
  onCommunitySelect: (community: any) => void;
  isLightMode: boolean;
}

// Real coordinates for Hyderabad communities
const COMMUNITY_COORDS: { [key: string]: { lat: number; lng: number } } = {
  'Tower A': { lat: 17.4435, lng: 78.3772 }, // PHF Gachibowli
  'Tower B': { lat: 17.4445, lng: 78.3820 }, // My Home Vihanga
  'Tower C': { lat: 17.4420, lng: 78.3850 }, // My Home Bhooja
  'Tower D': { lat: 17.4385, lng: 78.3980 }, // Rajapushpa Kokapet
  'Tower E': { lat: 17.4400, lng: 78.3750 }, // Myscape Isle
  'Tower F': { lat: 17.4455, lng: 78.3790 }, // My Home Avatar
  'Tower G': { lat: 17.4580, lng: 78.3650 }, // Aparna Nallagandla
  'Tower H': { lat: 17.4425, lng: 78.3805 }, // Purva Highlands
  'Tower I': { lat: 17.4410, lng: 78.3870 }, // My Home Abhra
  'Tower J': { lat: 17.4440, lng: 78.3785 }  // Mantri Espana
};

export default function GoogleMapView({ communities, onCommunitySelect, isLightMode }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        initMap();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script exists, wait for it to load
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            clearInterval(checkGoogleMaps);
            initMap();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('VITE_GOOGLE_MAPS_API_KEY is not set — the map cannot load. See .env.example.');
        return;
      }
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add a small delay to ensure google.maps is fully available
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            initMap();
          } else {
            console.error('Google Maps API loaded but Map constructor not available');
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps. Please ensure the API key is valid and Maps JavaScript API is enabled in Google Cloud Console.');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Update markers when communities or filters change
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [communities, searchQuery, filterLocation]);

  const initMap = () => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 17.4435, lng: 78.3772 }, // Gachibowli center
      zoom: 14,
      styles: isLightMode ? [] : [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;
    updateMarkers();
  };

  const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!mapInstanceRef.current) return;

    // Filter communities
    const filteredCommunities = communities.filter(community => {
      const matchesSearch = searchQuery === '' || 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = filterLocation === 'all' || 
        community.location.toLowerCase() === filterLocation.toLowerCase();

      return matchesSearch && matchesLocation;
    });

    // Create markers for filtered communities
    filteredCommunities.forEach(community => {
      const coords = COMMUNITY_COORDS[community.tower];
      if (!coords) return;

      const marker = new google.maps.Marker({
        position: coords,
        map: mapInstanceRef.current!,
        title: community.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#4A7C59', // Forest green from nature palette
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        label: {
          text: community.petCount.toString(),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; color: #000; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${community.name}</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #666;">📍 ${community.location}</p>
            <p style="margin: 4px 0; font-size: 14px;">🐾 ${community.petCount} pets</p>
            <p style="margin: 4px 0; font-size: 14px;">👥 ${community.walkerCount} walkers</p>
            <p style="margin: 4px 0; font-size: 14px;">⭐ ${community.rating} rating</p>
            <p style="margin: 4px 0; font-size: 14px;">🚶 ${community.activeWalks} active walks</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current!, marker);
        onCommunitySelect(community);
      });

      markersRef.current.push(marker);
    });

    // Adjust bounds to show all markers
    if (filteredCommunities.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredCommunities.forEach(community => {
        const coords = COMMUNITY_COORDS[community.tower];
        if (coords) {
          bounds.extend(coords);
        }
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const locations = ['all', ...Array.from(new Set(communities.map(c => c.location)))];

  return (
    <div className="relative">
      {/* Search and Filter Bar */}
      <div className={`absolute top-4 left-4 right-4 z-10 flex gap-2`}>
        {/* Search */}
        <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-sm border ${
          isLightMode ? 'bg-white border-gray-300' : 'bg-gray-900 border-gray-700'
        }`}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm ${
              isLightMode ? 'text-black placeholder-gray-400' : 'text-white placeholder-gray-500'
            }`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-sm border flex items-center gap-2 ${
            isLightMode 
              ? 'bg-white border-gray-300 hover:bg-gray-50' 
              : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">filters</span>
        </button>
      </div>

      {/* Filter Dropdown */}
      {showFilters && (
        <div className={`absolute top-16 right-4 z-10 p-4 rounded-sm border min-w-[200px] ${
          isLightMode ? 'bg-white border-gray-300' : 'bg-gray-900 border-gray-700'
        }`}>
          <div className="mb-2 text-sm font-semibold">location</div>
          <div className="space-y-1">
            {locations.map(location => (
              <label key={location} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="location"
                  value={location}
                  checked={filterLocation === location}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="accent-[#4A7C59]"
                />
                <span className="text-sm capitalize">{location}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div ref={mapRef} className="w-full h-[500px] rounded-sm" />
    </div>
  );
}