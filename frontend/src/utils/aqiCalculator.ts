import { AQIStandard, HealthCategory } from '../types/aqi';

export function getCategoryFromAQI(aqi: number): HealthCategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

export function getAQIColorHex(aqi: number): string {
  if (aqi <= 50) return '#10B981'; // Emerald Green
  if (aqi <= 100) return '#F59E0B'; // Amber Yellow
  if (aqi <= 150) return '#F97316'; // Orange
  if (aqi <= 200) return '#EF4444'; // Red
  if (aqi <= 300) return '#8B5CF6'; // Purple
  return '#7F1D1D'; // Maroon
}

export function getAQILabel(category: HealthCategory): string {
  switch (category) {
    case 'good':
      return 'Good';
    case 'moderate':
      return 'Moderate';
    case 'sensitive':
      return 'Sensitive Groups';
    case 'unhealthy':
      return 'Unhealthy';
    case 'very_unhealthy':
      return 'Very Unhealthy';
    case 'hazardous':
      return 'Hazardous';
    default:
      return 'Unknown';
  }
}

// CPCB Indian National AQI Categories & Colors
export function getCPCBCategoryAndColor(aqi: number): { category: string; colorHex: string } {
  if (aqi <= 50) return { category: 'Good', colorHex: '#10B981' };
  if (aqi <= 100) return { category: 'Satisfactory', colorHex: '#84CC16' };
  if (aqi <= 200) return { category: 'Moderate', colorHex: '#EAB308' };
  if (aqi <= 300) return { category: 'Poor', colorHex: '#F97316' };
  if (aqi <= 400) return { category: 'Very Poor', colorHex: '#EF4444' };
  return { category: 'Severe', colorHex: '#7F1D1D' };
}

// European AQI Categories & Colors
export function getEuropeanCategoryAndColor(aqi: number): { category: string; colorHex: string } {
  if (aqi <= 25) return { category: 'Very Good', colorHex: '#10B981' };
  if (aqi <= 50) return { category: 'Good', colorHex: '#84CC16' };
  if (aqi <= 75) return { category: 'Moderate', colorHex: '#F59E0B' };
  if (aqi <= 100) return { category: 'Poor', colorHex: '#EF4444' };
  return { category: 'Very Poor', colorHex: '#7F1D1D' };
}

export function getStandardCategoryAndColor(
  standard: AQIStandard,
  aqi: number
): { category: string; colorHex: string } {
  if (standard === 'cpcb') {
    return getCPCBCategoryAndColor(aqi);
  }
  if (standard === 'european') {
    return getEuropeanCategoryAndColor(aqi);
  }
  const cat = getCategoryFromAQI(aqi);
  return { category: getAQILabel(cat), colorHex: getAQIColorHex(aqi) };
}

export function getStandardDisplayName(standard: AQIStandard): string {
  switch (standard) {
    case 'cpcb':
      return 'CPCB NAQI (India)';
    case 'us_epa':
      return 'US EPA AQI';
    case 'european':
      return 'European AQI (EAQI)';
  }
}

export function getAQIPercentage(aqi: number): number {
  return Math.min(100, Math.round((aqi / 300) * 100));
}

export function getWhoThresholdPercentage(pollutant: string, value: number): {
  percent: number;
  exceeds: boolean;
  limit: number;
} {
  // WHO 2021 Global Air Quality Guidelines (24-hour mean limit in µg/m³)
  const limits: Record<string, number> = {
    'PM2.5': 15.0,
    'PM10': 45.0,
    'O3': 100.0,
    'NO2': 25.0,
    'SO2': 40.0,
    'CO': 4000.0,
  };

  const limit = limits[pollutant.toUpperCase()] || 20.0;
  const percent = Math.round((value / limit) * 100);
  return {
    percent,
    exceeds: value > limit,
    limit,
  };
}
