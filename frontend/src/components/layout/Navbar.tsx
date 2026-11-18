import React, { useState } from 'react';
import { Wind, Sparkles, RefreshCw, WifiOff, Menu, X } from 'lucide-react';
import { AQIStandard } from '../../types/aqi';
import { LocationSearchBar } from './LocationSearchBar';
import { StandardSelector } from '../common/StandardSelector';
import { NavLinks } from './NavLinks';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quickCities = ['New Delhi', 'Mumbai', 'Bengaluru', 'San Francisco', 'London', 'Tokyo'];

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

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-md hidden md:flex items-center gap-2" role="search">
            <LocationSearchBar currentCity={currentCity} onSelectCity={onSelectCity} />
            <button
              onClick={onRefresh}
              title="Refresh air quality data"
              aria-label="Refresh air quality data"
              className="p-2 text-slate-400 hover:text-emerald-700 transition-colors rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Right Action Controls: Standard Switcher & AI Assistant Button */}
          <div className="flex items-center gap-3">
            
            {/* Standard Switcher Tabs */}
            <StandardSelector standard={standard} onSelectStandard={onSelectStandard} size="sm" />

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

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden flex items-center gap-2">
          <LocationSearchBar currentCity={currentCity} onSelectCity={onSelectCity} />
          <button
            onClick={onRefresh}
            aria-label="Refresh telemetry data"
            className="p-2 text-slate-500 hover:text-emerald-700 bg-slate-100 rounded-xl shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Sub-bar: Navigation Links & Quick Cities */}
        <div className="hidden md:flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs">
          <NavLinks />

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
            <NavLinks mobile onLinkClick={() => setIsMobileMenuOpen(false)} />
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
