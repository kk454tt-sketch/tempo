import React, { useState, useEffect } from 'react';

export interface LocationMapData {
  lat: number;
  lng: number;
  zoom?: number;
  query?: string;
  mapUrl?: string;
  embedUrl?: string;
  label?: string;
}

interface LocationMapPickerProps {
  venue: string;
  address: string;
  locationMap?: LocationMapData;
  onChangeVenue: (val: string) => void;
  onChangeAddress: (val: string) => void;
  onChangeLocationMap: (val: LocationMapData) => void;
}

// Popular celebration venue presets for quick 1-click pinpointing
const VENUE_PRESETS = [
  { name: 'Glasshouse Botanica', lat: 41.7475, lng: -73.9161, label: 'Botanical Glasshouse, Hudson Valley, NY' },
  { name: 'Coral Cove Lagoon', lat: 32.7688, lng: -117.2517, label: 'Waterfront Pavilion, San Diego, CA' },
  { name: 'Skyline Rooftop Terrace', lat: 30.2672, lng: -97.7431, label: 'Downtown Rooftop, Austin, TX' },
  { name: 'The Loft on 4th', lat: 37.7816, lng: -122.4011, label: 'SoMa Loft & Garden, San Francisco, CA' },
  { name: 'Central Park Pavilion', lat: 40.7829, lng: -73.9654, label: 'Central Park Terrace, New York, NY' },
  { name: 'Private Backyard Residence', lat: 34.0522, lng: -118.2437, label: 'Celebration Garden, Los Angeles, CA' },
];

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  venue,
  address,
  locationMap,
  onChangeVenue,
  onChangeAddress,
  onChangeLocationMap,
}) => {
  const currentLat = locationMap?.lat ?? 41.7475;
  const currentLng = locationMap?.lng ?? -73.9161;
  const currentZoom = locationMap?.zoom ?? 15;

  const [latInput, setLatInput] = useState<string>(currentLat.toString());
  const [lngInput, setLngInput] = useState<string>(currentLng.toString());
  const [zoomLevel, setZoomLevel] = useState<number>(currentZoom);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [searchQuery, setSearchQuery] = useState<string>(address || venue || '');
  const [showCoordinatesManual, setShowCoordinatesManual] = useState(false);
  const [copiedDirections, setCopiedDirections] = useState(false);

  useEffect(() => {
    if (locationMap?.lat !== undefined) setLatInput(locationMap.lat.toString());
    if (locationMap?.lng !== undefined) setLngInput(locationMap.lng.toString());
    if (locationMap?.zoom !== undefined) setZoomLevel(locationMap.zoom);
  }, [locationMap]);

  // Generate Google Maps Directions URL
  const directionsQuery = encodeURIComponent(
    address || venue || `${currentLat},${currentLng}`
  );
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${directionsQuery}`;

  // Generate Embed Map URL for live interactive preview iframe
  const embedIframeUrl = `https://maps.google.com/maps?q=${directionsQuery}&t=${
    mapType === 'satellite' ? 'k' : 'm'
  }&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  const handleLocateFromAddress = (targetQuery?: string) => {
    const q = (targetQuery ?? searchQuery).trim();
    if (!q) return;

    // Check if query matches any known preset
    const match = VENUE_PRESETS.find(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.label.toLowerCase().includes(q.toLowerCase())
    );

    if (match) {
      setLatInput(match.lat.toString());
      setLngInput(match.lng.toString());
      onChangeLocationMap({
        lat: match.lat,
        lng: match.lng,
        zoom: zoomLevel,
        query: q,
        mapUrl: googleMapsUrl,
        label: match.label,
      });
    } else {
      onChangeLocationMap({
        lat: currentLat,
        lng: currentLng,
        zoom: zoomLevel,
        query: q,
        mapUrl: googleMapsUrl,
        label: q,
      });
    }
  };

  const handleApplyCoordinates = () => {
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChangeLocationMap({
        lat: parsedLat,
        lng: parsedLng,
        zoom: zoomLevel,
        query: address || venue,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`,
        label: `${venue || 'Venue'} (${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)})`,
      });
    }
  };

  const handlePresetSelect = (preset: (typeof VENUE_PRESETS)[0]) => {
    onChangeVenue(preset.name);
    onChangeAddress(preset.label);
    setSearchQuery(preset.label);
    setLatInput(preset.lat.toString());
    setLngInput(preset.lng.toString());
    onChangeLocationMap({
      lat: preset.lat,
      lng: preset.lng,
      zoom: 15,
      query: preset.label,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(preset.label)}`,
      label: preset.label,
    });
  };

  const handleCopyDirectionsLink = () => {
    navigator.clipboard.writeText(googleMapsUrl);
    setCopiedDirections(true);
    setTimeout(() => setCopiedDirections(false), 2500);
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-3 sm:p-4 border border-surface-container-high/80 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[19px]">map</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide truncate">
              Set Location via Interactive Map
            </h3>
            <p className="text-[11px] text-gray-500 truncate">
              Pinpoint venue so guests get one-tap GPS navigation.
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0 whitespace-nowrap hidden xs:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live GPS Ready</span>
        </span>
      </div>

      {/* Address / Location Search Bar */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-700 block">
          Pinpoint Location on Map
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-gray-400">
              pin_drop
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLocateFromAddress();
                }
              }}
              placeholder="Search venue or street address (e.g. 42 Rosewood Lane, NY)..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLocateFromAddress()}
            className="px-3.5 h-9 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>Locate</span>
          </button>
        </div>
      </div>

      {/* Quick Venue Presets Pills */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
          Quick Venue Presets:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {VENUE_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium border transition-all cursor-pointer flex items-center ${
                venue === p.name
                  ? 'bg-primary text-on-primary border-primary shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[13px] mr-1">location_on</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Canvas Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600 font-semibold">
            <span className="material-symbols-outlined text-[15px] text-[#ff5a5f]">place</span>
            <span className="truncate max-w-[220px] sm:max-w-xs">{address || venue || 'Pin Location'}</span>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
            >
              {mapType === 'roadmap' ? '🛰️ Satellite' : '🗺️ Map'}
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(19, z + 1))}
              className="w-6 h-6 rounded bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center cursor-pointer"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
              className="w-6 h-6 rounded bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center cursor-pointer"
              title="Zoom out"
            >
              -
            </button>
          </div>
        </div>

        {/* Embedded Live Map Frame */}
        <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-gray-100 group">
          <iframe
            title="Venue Location Map"
            src={embedIframeUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Map Floating Actions Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-white/95 backdrop-blur-xs hover:bg-white text-gray-900 rounded-lg text-[10px] font-bold shadow-md border border-gray-200 flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[13px] text-primary">open_in_new</span>
              <span>Open Google Maps</span>
            </a>
          </div>

          {/* Bottom GPS badge */}
          <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[9.5px] font-mono flex items-center gap-1.5 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              LAT: {currentLat.toFixed(4)} | LNG: {currentLng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Manual GPS Coordinates Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowCoordinatesManual(!showCoordinatesManual)}
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">
            {showCoordinatesManual ? 'expand_less' : 'tune'}
          </span>
          <span>
            {showCoordinatesManual
              ? 'Hide Coordinates Settings'
              : 'Advanced: Fine-tune Latitude & Longitude Coordinates'}
          </span>
        </button>

        {showCoordinatesManual && (
          <div className="mt-2.5 p-3 rounded-xl bg-white border border-gray-200 space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Latitude</label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="e.g. 41.7475"
                  className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Longitude</label>
                <input
                  type="text"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  placeholder="e.g. -73.9161"
                  className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-400">Press apply to update pinpoint on map</span>
              <button
                type="button"
                onClick={handleApplyCoordinates}
                className="px-3 py-1 bg-gray-900 hover:bg-black text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                Apply Coordinates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guest Navigation Helper Buttons */}
      <div className="pt-2 border-t border-surface-container flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">directions</span>
          <span>Guests will receive 1-tap driving directions to this location</span>
        </div>

        <button
          type="button"
          onClick={handleCopyDirectionsLink}
          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
            copiedDirections
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {copiedDirections ? 'check' : 'content_copy'}
          </span>
          <span>{copiedDirections ? 'Link Copied!' : 'Copy Directions Link'}</span>
        </button>
      </div>
    </div>
  );
};

