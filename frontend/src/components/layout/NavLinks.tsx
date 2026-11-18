import React from 'react';

export interface NavLinkItem {
  label: string;
  href: string;
}

export const APP_NAV_LINKS: NavLinkItem[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Forecast', href: '#forecast' },
  { label: 'Winter Smog', href: '#winter-smog' },
  { label: 'Pollutants', href: '#pollutants' },
  { label: 'Best Window', href: '#activity-window' },
  { label: 'Respirators', href: '#respirators' },
  { label: 'Indoor Haven', href: '#indoor-air' },
  { label: 'City Radar', href: '#city-benchmark' },
  { label: 'Family Advisory', href: '#family-profiles' },
  { label: 'Transit', href: '#sustainable-transit' },
  { label: 'Community', href: '#community' },
];

interface NavLinksProps {
  onLinkClick?: () => void;
  mobile?: boolean;
}

export const NavLinks: React.FC<NavLinksProps> = ({ onLinkClick, mobile = false }) => {
  if (mobile) {
    return (
      <div className="flex flex-col gap-1 py-2">
        {APP_NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    );
  }

  return (
    <nav className="hidden xl:flex items-center gap-1" aria-label="Desktop Navigation Links">
      {APP_NAV_LINKS.slice(0, 7).map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-emerald-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};
