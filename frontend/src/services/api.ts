import { AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult } from '../types/aqi';
import { FamilyGroup, FamilyMember } from '../types/family';
import { ComprehensiveRecommendation } from '../types/recommendations';
import {
  EmissionsCalculationRequest,
  EmissionsCalculationResult,
  SustainableTransportOption,
} from '../types/sustainability';
import { apiRequest, buildQueryParams } from './apiClient';

export { ApiError } from './apiClient';

export async function fetchHealth(): Promise<{ status: string; gemini_active: boolean; default_provider: string }> {
  return apiRequest('/health', {}, 'Backend health check failed');
}

export async function fetchCurrentAQI(
  city?: string,
  lat?: number,
  lon?: number,
  standard?: AQIStandard
): Promise<AQIReading> {
  const query = buildQueryParams({ city, lat, lon, standard });
  return apiRequest(`/aqi/current${query}`, {}, 'Failed to fetch AQI reading');
}

export async function fetchForecast(
  city?: string,
  lat?: number,
  lon?: number,
  hours: number = 24
): Promise<AirQualityForecast> {
  const query = buildQueryParams({ city, lat, lon, hours });
  return apiRequest(`/aqi/forecast${query}`, {}, 'Failed to fetch forecast');
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    return await apiRequest(`/aqi/locations/search?q=${encodeURIComponent(query.trim())}`);
  } catch {
    return [];
  }
}

export async function fetchDefaultProfile(): Promise<FamilyGroup> {
  return apiRequest('/profiles/default', {}, 'Failed to fetch default family profile');
}

export async function fetchActiveProfile(): Promise<FamilyGroup> {
  try {
    return await apiRequest('/profiles/current', {}, 'Failed to fetch active profile');
  } catch {
    return fetchDefaultProfile();
  }
}

export async function resetDemoProfile(): Promise<FamilyGroup> {
  return apiRequest('/profiles/reset-demo', { method: 'POST' }, 'Failed to reset demo profiles');
}

export async function clearDemoProfile(): Promise<FamilyGroup> {
  return apiRequest('/profiles/clear-demo', { method: 'POST' }, 'Failed to clear demo profiles');
}

export async function addFamilyMember(member: FamilyMember): Promise<FamilyGroup> {
  return apiRequest(
    '/profiles/members/add',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    },
    'Failed to add family member'
  );
}

export async function removeFamilyMember(memberId: string): Promise<FamilyGroup> {
  return apiRequest(
    `/profiles/members/${encodeURIComponent(memberId)}`,
    { method: 'DELETE' },
    'Failed to delete member'
  );
}

export async function fetchComprehensiveRecommendations(
  city?: string,
  lat?: number,
  lon?: number,
  family?: FamilyGroup,
  standard?: AQIStandard
): Promise<ComprehensiveRecommendation> {
  if (family) {
    return apiRequest(
      '/recommendations/evaluate-custom',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, lat, lon, family, standard }),
      },
      'Failed to evaluate custom profile'
    );
  }

  const query = buildQueryParams({ city, lat, lon, standard });
  return apiRequest(`/recommendations/comprehensive${query}`, {}, 'Failed to fetch recommendations');
}

export async function calculateEmissions(
  request: EmissionsCalculationRequest,
  aqi: number = 50
): Promise<EmissionsCalculationResult> {
  return apiRequest(
    `/sustainability/calculate?aqi=${aqi}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
    'Failed to calculate transport emissions'
  );
}

export async function fetchSustainableTransportOptions(aqi: number = 50): Promise<SustainableTransportOption[]> {
  return apiRequest(`/sustainability/options?aqi=${aqi}`, {}, 'Failed to fetch transport options');
}

export async function sendChatMessage(
  message: string,
  contextAqi?: AQIReading | null,
  contextFamily?: FamilyGroup | null
): Promise<{ reply: string; model: string; source: string }> {
  return apiRequest(
    '/chat/message',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context_aqi: contextAqi,
        context_family: contextFamily,
      }),
    },
    'Failed to communicate with BreatheWise assistant'
  );
}
