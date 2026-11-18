import { AQIReading, AQIStandard, AirQualityForecast, LocationSearchResult } from '../types/aqi';
import { FamilyGroup, FamilyMember } from '../types/family';
import { ComprehensiveRecommendation } from '../types/recommendations';
import {
  EmissionsCalculationRequest,
  EmissionsCalculationResult,
  SustainableTransportOption,
} from '../types/sustainability';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchHealth(): Promise<{ status: string; gemini_active: boolean; default_provider: string }> {
  const resp = await fetch(`${API_BASE_URL}/health`);
  if (!resp.ok) throw new Error('Backend health check failed');
  return resp.json();
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
  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({ detail: 'Failed to fetch AQI' }));
    throw new Error(errorData.detail || 'Failed to fetch AQI reading');
  }
  return resp.json();
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
  if (!resp.ok) throw new Error('Failed to fetch forecast');
  return resp.json();
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const resp = await fetch(`${API_BASE_URL}/aqi/locations/search?q=${encodeURIComponent(query.trim())}`);
  if (!resp.ok) return [];
  return resp.json();
}

export async function fetchDefaultProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/default`);
  if (!resp.ok) throw new Error('Failed to fetch default family profile');
  return resp.json();
}

export async function fetchActiveProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/current`);
  if (!resp.ok) return fetchDefaultProfile();
  return resp.json();
}

export async function resetDemoProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/reset-demo`, { method: 'POST' });
  if (!resp.ok) throw new Error('Failed to reset demo profiles');
  return resp.json();
}

export async function clearDemoProfile(): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/clear-demo`, { method: 'POST' });
  if (!resp.ok) throw new Error('Failed to clear demo profiles');
  return resp.json();
}

export async function addFamilyMember(member: FamilyMember): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/members/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  if (!resp.ok) throw new Error('Failed to add family member');
  return resp.json();
}

export async function removeFamilyMember(memberId: string): Promise<FamilyGroup> {
  const resp = await fetch(`${API_BASE_URL}/profiles/members/${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
  });
  if (!resp.ok) throw new Error('Failed to delete member');
  return resp.json();
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
    if (!resp.ok) throw new Error('Failed to evaluate custom profile');
    return resp.json();
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
  if (!resp.ok) throw new Error('Failed to fetch recommendations');
  return resp.json();
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
  if (!resp.ok) throw new Error('Failed to calculate transport emissions');
  return resp.json();
}

export async function fetchSustainableTransportOptions(aqi: number = 50): Promise<SustainableTransportOption[]> {
  const resp = await fetch(`${API_BASE_URL}/sustainability/options?aqi=${aqi}`);
  if (!resp.ok) throw new Error('Failed to fetch transport options');
  return resp.json();
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
  if (!resp.ok) throw new Error('Failed to communicate with BreatheWise assistant');
  return resp.json();
}
