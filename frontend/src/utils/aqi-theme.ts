import { AQICategory } from '../types';

export interface AQITheme {
  color: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  textColor: string;
  label: string;
  gradient: string;
}

export function getAQITheme(category: AQICategory | string): AQITheme {
  switch (category) {
    case 'Good':
      return {
        color: '#10B981',
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-500/10',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        textColor: 'text-emerald-400',
        label: 'Good',
        gradient: 'from-emerald-500 to-teal-400',
      };
    case 'Moderate':
      return {
        color: '#F59E0B',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-500/10',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        textColor: 'text-amber-400',
        label: 'Moderate',
        gradient: 'from-amber-500 to-yellow-400',
      };
    case 'Unhealthy for Sensitive Groups':
      return {
        color: '#F97316',
        borderColor: 'border-orange-500/30',
        bgColor: 'bg-orange-500/10',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        textColor: 'text-orange-400',
        label: 'Sensitive Warning',
        gradient: 'from-orange-500 to-amber-500',
      };
    case 'Unhealthy':
      return {
        color: '#EF4444',
        borderColor: 'border-red-500/30',
        bgColor: 'bg-red-500/10',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
        textColor: 'text-red-400',
        label: 'Unhealthy',
        gradient: 'from-red-500 to-rose-400',
      };
    case 'Very Unhealthy':
      return {
        color: '#A855F7',
        borderColor: 'border-purple-500/30',
        bgColor: 'bg-purple-500/10',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        textColor: 'text-purple-400',
        label: 'Very Unhealthy',
        gradient: 'from-purple-600 to-violet-500',
      };
    case 'Hazardous':
    default:
      return {
        color: '#E11D48',
        borderColor: 'border-rose-700/50',
        bgColor: 'bg-rose-950/40',
        badgeBg: 'bg-rose-600/30 text-rose-300 border-rose-500/50',
        textColor: 'text-rose-400',
        label: 'Hazardous Alert',
        gradient: 'from-rose-600 to-pink-700',
      };
  }
}

export function getRiskLevelBadge(level: string): { bg: string; text: string } {
  switch (level) {
    case 'Minimal':
      return { bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-300' };
    case 'Mild':
      return { bg: 'bg-cyan-500/20 border-cyan-500/30', text: 'text-cyan-300' };
    case 'Moderate':
      return { bg: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-300' };
    case 'High':
      return { bg: 'bg-orange-500/20 border-orange-500/30', text: 'text-orange-300' };
    case 'Critical':
    default:
      return { bg: 'bg-rose-500/20 border-rose-500/40', text: 'text-rose-300' };
  }
}
