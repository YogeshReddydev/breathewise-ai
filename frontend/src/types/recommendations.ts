export type ActivitySafetyLevel =
  | 'safe'
  | 'moderate'
  | 'restricted'
  | 'dangerous';

export interface StructuredRecommendation {
  cohort: string;
  target_group: string;
  recommended_action: string;
  reason: string;
  supporting_measurement: string;
  expected_benefit: string;
  limitations: string;
}

export interface MemberAdvisory {
  member_id: string;
  member_name: string;
  vulnerability_tier: string;
  risk_score: number;
  activity_safety: ActivitySafetyLevel;
  outdoor_exercise_allowed: boolean;
  mask_recommended: boolean;
  mask_type?: string | null;
  key_recommendation: string;

  // 5-dimension structured details
  recommended_action?: string;
  reason?: string;
  supporting_measurement?: string;
  expected_benefit?: string;
  limitations?: string;

  actions: string[];
  symptoms_to_watch: string[];
}

export interface IndoorProtocol {
  windows_open: boolean;
  purifier_setting: string;
  recommended_action: string;
  ventilation_guide: string;
}

export interface ComprehensiveRecommendation {
  overall_risk_score: number;
  headline: string;
  summary: string;
  best_outdoor_window?: string | null;
  worst_outdoor_window?: string | null;
  member_advisories: MemberAdvisory[];
  cohort_recommendations?: StructuredRecommendation[];
  indoor_protocol: IndoorProtocol;
  engine_source: string;
  timestamp: string;
  active_standard?: string;
  medical_disclaimer?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  model?: string;
}
