import React, { useState, useEffect, useRef } from 'react';
import { Wind, Search, MapPin, Sparkles, RefreshCw, WifiOff, Menu, X } from 'lucide-react';
import { AQIStandard, LocationSearchResult } from '../../types/aqi';
import { searchLocations } from '../../services/api';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const quickCities = ['New Delhi', 'Mumbai', 'Bengaluru', 'San Francisco', 'London', 'Tokyo'];

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Forecast', href: '#forecast' },
    { label: 'Pollutants', href: '#pollutants' },
    { label: 'Best Window', href: '#activity-window' },
    { label: 'Indoor Air', href: '#indoor-air' },
    { label: 'Family Advisory', href: '#family-profiles' },
    { label: 'Transit', href: '#sustainable-transit' },
    { label: 'Community', href: '#community' },
  ];

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

  // Click outside to close search dropdown
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="bg-amber-50 text-amber-900 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-amber-200">
          <WifiOff className="w-3.5 h-3.5 text-amber-700" />
          <span>Offline mode: Network disconnected. Displaying cached environmental intelligence.</span>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#overview" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-700 p-0.5 shadow-sm group-hover:shadow transition-shadow">
                <div className="w-full h-full bg-emerald-900 rounded-[10px] flex items-center justify-center">
                  <Wind className="w-5 h-5 text-emerald-300 animate-pulse-subtle" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    BreatheWise
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Urban Air Quality Assistant</p>
              </div>
            </a>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block" ref={dropdownRef} role="search">
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Search city or location"
                  placeholder="Search city (e.g. Delhi, London, Mumbai)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setIsOpen(true)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-20 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                />
                <button
                  onClick={onRefresh}
                  title="Refresh air quality data"
                  aria-label="Refresh air quality data"
                  className="absolute right-2 px-2 py-1 text-slate-400 hover:text-emerald-700 transition-colors rounded"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>

              {/* Dropdown Results */}
              {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50" role="listbox">
                  <div className="p-1.5 max-h-64 overflow-y-auto">
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-slate-900">{loc.name}</span>
                        {loc.admin1 && <span className="text-[11px] text-slate-500">({loc.admin1})</span>}
                        {loc.country && <span className="text-[11px] text-slate-500 ml-auto">{loc.country}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls: Standard Switcher & AI Assistant Button */}
          <div className="flex items-center gap-3">
            
            {/* Standard Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs" role="group" aria-label="AQI Standard selector">
              <button
                onClick={() => onSelectStandard('cpcb')}
                aria-pressed={standard === 'cpcb'}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  standard === 'cpcb'
                    ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Indian CPCB National AQI"
              >
                CPCB (India)
              </button>
              <button
                onClick={() => onSelectStandard('us_epa')}
                aria-pressed={standard === 'us_epa'}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  standard === 'us_epa'
                    ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="United States EPA AQI"
              >
                US EPA
              </button>
              <button
                onClick={() => onSelectStandard('european')}
                aria-pressed={standard === 'european'}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  standard === 'european'
                    ? 'bg-white text-purple-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="European Air Quality Index"
              >
                EU
              </button>
            </div>

            {/* AI Assistant Trigger Button */}
            <button
              onClick={onToggleChat}
              aria-label="Toggle AI Environmental Assistant"
              aria-expanded={isChatOpen}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isChatOpen
                  ? 'bg-emerald-900 text-white ring-2 ring-emerald-500'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search & Quick Cities when mobile menu open or on mobile */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 top-2.5" />
            <input
              type="text"
              placeholder="Search city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
            <button
              onClick={onRefresh}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-emerald-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sub-bar: Navigation Links & Quick Cities */}
        <div className="hidden md:flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs">
          {/* Section Anchor Links */}
          <nav className="flex items-center gap-5 overflow-x-auto" aria-label="Page Sections">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-emerald-800 font-semibold transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Quick city selectors */}
          <div className="flex items-center gap-1.5 shrink-0" role="toolbar" aria-label="Popular cities">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Popular:</span>
            {quickCities.map((c) => {
              const isSelected = currentCity.toLowerCase().includes(c.toLowerCase());
              return (
                <button
                  key={c}
                  onClick={() => onSelectCity(c)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                    isSelected
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-3 mt-2 border-t border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-2 py-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-50 text-slate-700 font-semibold text-xs hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 w-full mb-1">Quick Select City:</span>
              {quickCities.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onSelectCity(c);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
