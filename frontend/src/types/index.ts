export type AQICategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface PollutantData {
  value: number;
  sub_index: number;
  category: AQICategory;
  unit: string;
}

export interface PollutantsBreakdown {
  pm2_5?: PollutantData;
  pm10?: PollutantData;
  no2?: PollutantData;
  o3?: PollutantData;
  co?: PollutantData;
  so2?: PollutantData;
}

export interface AtmosphericConditions {
  temperature_c?: number;
  relative_humidity_percent?: number;
  wind_speed_kmh?: number;
  wind_direction_deg?: number;
}

export interface CurrentAQIResponse {
  location_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  aqi: number;
  category: AQICategory;
  dominant_pollutant: string;
  pollutants: PollutantsBreakdown;
  atmospheric: AtmosphericConditions;
  provider: string;
  health_headline: string;
  cautionary_statement: string;
}

export interface HourlyAQIPoint {
  timestamp: string;
  hour: number;
  aqi: number;
  category: AQICategory;
  pm2_5: number;
  pm10: number;
  dominant_pollutant: string;
}

export interface ForecastAQIResponse {
  location_name: string;
  latitude: number;
  longitude: number;
  current_aqi: number;
  peak_aqi: number;
  peak_timestamp: string;
  cleanest_aqi: number;
  cleanest_timestamp: string;
  hourly: HourlyAQIPoint[];
  provider: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  conditions: string[];
  sensitivity: 'low' | 'moderate' | 'high' | 'critical';
  alert_threshold_aqi: number;
  primary_activity: string;
  notes?: string;
}

export interface FamilyMemberListResponse {
  members: FamilyMember[];
  active_member_id?: string;
}

export interface PersonalizedAction {
  id: string;
  title: string;
  urgency: 'info' | 'warning' | 'critical';
  icon: string;
  description: string;
  rationale: string;
}

export interface VentilationGuidance {
  windows_open_recommended: boolean;
  optimal_window_opening_hours?: string;
  purifier_mode: string;
  indoor_air_advice: string;
}

export interface OutdoorActivityGuidance {
  is_outdoor_exercise_safe: boolean;
  recommended_duration_max_minutes: number;
  best_time_window?: string;
  commute_guidance: string;
}

export interface RecommendationResponse {
  member_id?: string;
  member_name?: string;
  location_name: string;
  aqi: number;
  risk_score: number;
  risk_level: 'Minimal' | 'Mild' | 'Moderate' | 'High' | 'Critical';
  mask_recommendation: string;
  ventilation: VentilationGuidance;
  outdoor_activity: OutdoorActivityGuidance;
  actions: PersonalizedAction[];
  ai_summary?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ConsultationResponse {
  reply: string;
  suggested_followups: string[];
  health_alerts: string[];
  ai_engine: string;
}

export interface CityLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}
