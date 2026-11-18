import { AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult } from '../types/aqi';
import { FamilyGroup, FamilyMember } from '../types/family';
import { ComprehensiveRecommendation } from '../types/recommendations';
import {
  EmissionsCalculationRequest,
  EmissionsCalculationResult,
  SustainableTransportOption,
} from '../types/sustainability';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleApiResponse<T>(resp: Response, fallbackMessage: string): Promise<T> {
  if (!resp.ok) {
    const errorBody = await resp.json().catch(() => null);
    const detail = errorBody?.detail || errorBody?.message || `${fallbackMessage} (HTTP ${resp.status})`;
    throw new Error(detail);
  }
  return resp.json();
}

export async function fetchHealth(): Promise<{ status: string; gemini_active: boolean; default_provider: string }> {
  const resp = await fetch(`${API_BASE_URL}/health`);
  return handleApiResponse(resp, 'Backend health check failed');
}

export async function fetchCurrentAQI(
  city?: string,
  lat?: number,
  lon?: number,
  standard?: AQIStandard
): Promise<AQIReading> {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (lat !== undefined && lon !== undefined) {
    params.set('lat', lat.toString());
    params.set('lon', lon.toString());
  }
  if (standard) {
    params.set('standard', standard);
  }

  const resp = await fetch(`${API_BASE_URL}/aqi/current?${params.toString()}`);
  return handleApiResponse(resp, 'Failed to fetch AQI reading');
}

export async function fetchForecast(
  city?: string,
  lat?: number,
  lon?: number,
  hours: number = 24
): Promise<AirQualityForecast> {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (lat !== undefined && lon !== undefined) {
    params.set('lat', lat.toString());
    params.set('lon', lon.toString());
  }
  params.set('hours', hours.toString());

  const resp = await fetch(`${API_BASE_URL}/aqi/forecast?${params.toString()}`);
  return handleApiResponse(resp, 'Failed to fetch forecast');
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const resp = await fetch(`${API_BASE_URL}/aqi/locations/search?q=${encodeURIComponent(query.trim())}`);
  if (!resp.ok) return [];
  return resp.json();
}

export async function fetchDefaultProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/default`);
  return handleApiResponse(resp, 'Failed to fetch default family profile');
}

export async function fetchActiveProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/current`);
  if (!resp.ok) return fetchDefaultProfile();
  return resp.json();
}

export async function resetDemoProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/reset-demo`, { method: 'POST' });
  return handleApiResponse(resp, 'Failed to reset demo profiles');
}

export async function clearDemoProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/clear-demo`, { method: 'POST' });
  return handleApiResponse(resp, 'Failed to clear demo profiles');
}

export async function addFamilyMember(member: FamilyMember): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/members/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  return handleApiResponse(resp, 'Failed to add family member');
}

export async function removeFamilyMember(memberId: string): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/members/${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
  });
  return handleApiResponse(resp, 'Failed to delete member');
}

export async function fetchComprehensiveRecommendations(
  city?: string,
  lat?: number,
  lon?: number,
  family?: FamilyGroup,
  standard?: AQIStandard
): Promise<ComprehensiveRecommendation> {
  if (family) {
    const resp = await fetch(`${API_BASE_URL}/recommendations/evaluate-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, lat, lon, family, standard }),
    });
    return handleApiResponse(resp, 'Failed to evaluate custom profile');
  }

  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (lat !== undefined && lon !== undefined) {
    params.set('lat', lat.toString());
    params.set('lon', lon.toString());
  }
  if (standard) {
    params.set('standard', standard);
  }
  const resp = await fetch(`${API_BASE_URL}/recommendations/comprehensive?${params.toString()}`);
  return handleApiResponse(resp, 'Failed to fetch recommendations');
}

export async function calculateEmissions(
  request: EmissionsCalculationRequest,
  aqi: number = 50
): Promise<EmissionsCalculationResult> {
  const resp = await fetch(`${API_BASE_URL}/sustainability/calculate?aqi=${aqi}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleApiResponse(resp, 'Failed to calculate transport emissions');
}

export async function fetchSustainableTransportOptions(aqi: number = 50): Promise<SustainableTransportOption[]> {
  const resp = await fetch(`${API_BASE_URL}/sustainability/options?aqi=${aqi}`);
  return handleApiResponse(resp, 'Failed to fetch transport options');
}

export async function sendChatMessage(
  message: string,
  contextAqi?: AQIReading | null,
  contextFamily?: FamilyGroup | null
): Promise<{ reply: string; model: string; source: string }> {
  const resp = await fetch(`${API_BASE_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      context_aqi: contextAqi,
      context_family: contextFamily,
    }),
  });
  return handleApiResponse(resp, 'Failed to communicate with BreatheWise assistant');
}
