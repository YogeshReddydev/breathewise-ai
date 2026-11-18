import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { LocationSearchResult } from '../../types/aqi';
import { searchLocations } from '../../services/api';

interface LocationSearchBarProps {
  currentCity: string;
  onSelectCity: (city: string, lat?: number, lon?: number) => void;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  currentCity,
  onSelectCity,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const matches = await searchLocations(query);
        setResults(matches);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search location', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cityName: string, lat?: number, lon?: number) => {
    onSelectCity(cityName, lat, lon);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search global cities (Current: ${currentCity.split(',')[0]})...`}
          className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-9 pr-8 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
          <div className="p-2 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Global Atmospheric Stations
          </div>
          <div className="max-h-60 overflow-y-auto">
            {results.map((loc, idx) => {
              const displayName = loc.country ? `${loc.name}, ${loc.country}` : loc.name;
              return (
                <button
                  key={`${loc.name}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(displayName, loc.latitude, loc.longitude)}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                    <span className="font-medium">{displayName}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
