export type HealthCondition =
  | 'asthma'
  | 'allergies'
  | 'cardiovascular'
  | 'copd'
  | 'pregnancy'
  | 'outdoor_labor'
  | 'student_commute'
  | 'none';

export type ActivityPreference =
  | 'indoor_only'
  | 'light_walking'
  | 'outdoor_running'
  | 'cycling'
  | 'commuting'
  | 'public_transit'
  | 'outdoor_work';

export type VulnerabilityTier = 'standard' | 'sensitive' | 'high_risk';

export type TargetCohort =
  | 'children'
  | 'older_adults'
  | 'students'
  | 'daily_commuters'
  | 'outdoor_workers'
  | 'general_household';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  conditions: HealthCondition[];
  activity_preference: ActivityPreference;
  vulnerability_tier: VulnerabilityTier;
  cohort?: TargetCohort;
  notes?: string | null;
  is_demo?: boolean;
}

export interface FamilyGroup {
  id: string;
  family_name: string;
  members: FamilyMember[];
  alert_threshold_aqi: number;
  home_city: string;
  home_lat: number;
  home_lon: number;
  is_demo?: boolean;
  disclaimer?: string;
}
