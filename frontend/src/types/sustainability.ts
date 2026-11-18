export type TransportMode =
  | 'petrol_car'
  | 'diesel_car'
  | 'hybrid_car'
  | 'electric_car'
  | 'carpool_2'
  | 'carpool_3'
  | 'two_wheeler'
  | 'city_bus'
  | 'metro_train'
  | 'walk_cycle';

export interface SustainableTransportOption {
  mode: TransportMode;
  label: string;
  emissions_per_km: number;
  safety_advisory_for_today: string;
  is_active_travel: boolean;
  recommended_today: boolean;
}

export interface EmissionsCalculationRequest {
  distance_km: number;
  baseline_mode: TransportMode;
  target_mode: TransportMode;
  trips_per_week: number;
}

export interface EmissionsCalculationResult {
  distance_km: number;
  baseline_mode_label: string;
  target_mode_label: string;
  single_trip_baseline_kg: number;
  single_trip_target_kg: number;
  single_trip_avoided_kg: number;
  weekly_avoided_kg: number;
  annual_avoided_kg: number;
  avoided_percentage: number;
  tailpipe_pm2_5_avoided_g: number;
  air_safety_context: string;
  methodology_note: string;
}
