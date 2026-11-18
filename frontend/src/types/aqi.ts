export type AQIStandard = 'cpcb' | 'us_epa' | 'european';

export type HealthCategory =
  | 'good'
  | 'moderate'
  | 'sensitive'
  | 'unhealthy'
  | 'very_unhealthy'
  | 'hazardous';

export interface PollutantBreakdown {
  pm2_5: number;
  pm10: number;
  o3?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null;
}

export interface CPCBReading {
  calculable: boolean;
  aqi?: number | null;
  category: string;
  color_hex: string;
  dominant_pollutant?: string | null;
  sub_indices: Record<string, number>;
  limitation_note?: string | null;
}

export interface USEPAReading {
  aqi: number;
  category: HealthCategory;
  category_label: string;
  color_hex: string;
  dominant_pollutant: string;
}

export interface EuropeanReading {
  aqi?: number | null;
  category: string;
  color_hex: string;
}

export interface AQIReading {
  aqi_us: number;
  aqi_eu?: number | null;
  category: HealthCategory;
  category_label: string;
  color_hex: string;
  dominant_pollutant: string;
  timestamp: string;
  location_name: string;
  latitude: number;
  longitude: number;
  pollutants: PollutantBreakdown;
  provider: string;

  // Standard specific models
  active_standard?: AQIStandard;
  cpcb?: CPCBReading | null;
  us_epa?: USEPAReading | null;
  european?: EuropeanReading | null;

  // Provenance & observation metadata
  data_type?: string;
  source_attribution?: string;
  is_stale?: boolean;
  measurement_units?: Record<string, string>;
}

export interface HourlyForecastItem {
  time: string;
  aqi_us: number;
  pm2_5: number;
  pm10: number;
  dominant_pollutant: string;
  category: HealthCategory;
  category_label: string;
  color_hex: string;

  cpcb_aqi?: number | null;
  cpcb_category?: string | null;
  cpcb_color?: string | null;
}

export interface AirQualityForecast {
  location_name: string;
  latitude: number;
  longitude: number;
  hourly: HourlyForecastItem[];
  best_window_start?: string | null;
  best_window_end?: string | null;
  best_window_aqi?: number | null;
  worst_window_start?: string | null;
  worst_window_end?: string | null;
  worst_window_aqi?: number | null;
  avg_next_24h_aqi: number;
  forecast_horizon_hours?: number;
  data_type?: string;
  source_attribution?: string;
}

export interface LocationSearchResult {
  name: string;
  country: string;
  admin1?: string | null;
  latitude: number;
  longitude: number;
  timezone?: string | null;
}
