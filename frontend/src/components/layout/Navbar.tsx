import React, { useState, useEffect, useRef } from 'react';
import { Wind, Search, MapPin, Sparkles, MessageSquare, RefreshCw, WifiOff, Globe } from 'lucide-react';
import { AQIStandard, LocationSearchResult } from '../../types/aqi';
import { searchLocations } from '../../services/api';
import { getStandardDisplayName } from '../../utils/aqiCalculator';

interface NavbarProps {
  currentCity: string;
  onSelectCity: (city: string, lat?: number, lon?: number) => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  isLoading: boolean;
  isOffline: boolean;
  onRefresh: () => void;
  standard: AQIStandard;
  onSelectStandard: (std: AQIStandard) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onSelectCity,
  onToggleChat,
  isChatOpen,
  isLoading,
  isOffline,
  onRefresh,
  standard,
  onSelectStandard,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const quickCities = ['New Delhi', 'Mumbai', 'Bengaluru', 'San Francisco', 'London', 'Tokyo'];

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
        console.error(err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#070D1E]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3">
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="bg-orange-500/20 text-orange-300 text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2 mb-2 rounded-lg border border-orange-500/30">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline mode: Network disconnected. Displaying cached environmental intelligence.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <Wind className="w-5 h-5 text-emerald-400 animate-pulse-subtle" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  BreatheWise
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Urban Environmental Intelligence</p>
            </div>
          </div>

          {/* Mobile Chat Button */}
          <button
            onClick={onToggleChat}
            aria-label="Toggle AI Environmental Assistant"
            aria-expanded={isChatOpen}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI</span>
          </button>
        </div>

        {/* Search Bar & Quick Cities */}
        <div className="flex-1 max-w-lg w-full" ref={dropdownRef} role="search">
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                aria-label="Search global or Indian city"
                placeholder="Search any global or Indian city (e.g. Delhi, London, Mumbai)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setIsOpen(true)}
                className="w-full bg-[#0D162B] border border-white/10 rounded-xl pl-10 pr-20 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
              <button
                onClick={onRefresh}
                title="Refresh atmospheric telemetry"
                aria-label="Refresh atmospheric telemetry"
                className="absolute right-2 px-2 py-1 text-slate-400 hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D162B] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50" role="listbox">
                <div className="p-1.5">
                  {results.map((loc, idx) => (
                    <button
                      key={idx}
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        const displayName = loc.country ? `${loc.name}, ${loc.country}` : loc.name;
                        onSelectCity(displayName, loc.latitude, loc.longitude);
                        setQuery('');
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                      <span className="font-medium text-slate-100">{loc.name}</span>
                      {loc.admin1 && <span className="text-[11px] text-slate-400">({loc.admin1})</span>}
                      {loc.country && <span className="text-[11px] text-slate-400 ml-auto">{loc.country}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick city tags */}
          <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs" role="toolbar" aria-label="Quick city selectors">
            <span className="text-slate-500 text-[10px] font-medium mr-1 hidden sm:inline">Cities:</span>
            {quickCities.map((c) => {
              const isSelected = currentCity.toLowerCase().includes(c.toLowerCase());
              return (
                <button
                  key={c}
                  aria-pressed={isSelected}
                  aria-label={`Select city ${c}`}
                  onClick={() => onSelectCity(c)}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Standard Switcher & Assistant Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* AQI Standard Selector Pills */}
          <div className="flex items-center bg-[#0D162B] p-0.5 rounded-xl border border-white/10 text-[11px]" role="group" aria-label="Air Quality Index standard selector">
            <button
              onClick={() => onSelectStandard('cpcb')}
              title="Indian CPCB National AQI standard"
              aria-label="Select Indian CPCB National AQI standard"
              aria-pressed={standard === 'cpcb'}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                standard === 'cpcb'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CPCB (India)
            </button>
            <button
              onClick={() => onSelectStandard('us_epa')}
              title="United States EPA Air Quality standard"
              aria-label="Select United States EPA Air Quality standard"
              aria-pressed={standard === 'us_epa'}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                standard === 'us_epa'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              US EPA
            </button>
            <button
              onClick={() => onSelectStandard('european')}
              title="European Air Quality Index"
              aria-label="Select European Air Quality Index standard"
              aria-pressed={standard === 'european'}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                standard === 'european'
                  ? 'bg-purple-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EU
            </button>
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={onToggleChat}
            aria-label="Toggle AI Environmental Assistant"
            aria-expanded={isChatOpen}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              isChatOpen
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-cyan-500/20'
                : 'bg-[#0D162B] text-slate-200 hover:bg-[#152345] border border-white/10 hover:border-emerald-500/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>AI Assistant</span>
          </button>
        </div>

      </div>
    </header>
  );
};
