import {
  CurrentAQIResponse,
  ForecastAQIResponse,
  CityLocation,
  RecommendationResponse,
  FamilyMemberListResponse,
  FamilyMember,
  ConsultationResponse,
  ChatMessage,
} from '../types';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

export async function fetchMajorCities(): Promise<CityLocation[]> {
  const res = await fetch(`${API_BASE}/aqi/cities`);
  return handleResponse<CityLocation[]>(res);
}

export async function fetchCurrentAQI(
  lat: number,
  lon: number,
  locationName: string,
  refresh: boolean = false
): Promise<CurrentAQIResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    location_name: locationName,
    refresh: refresh.toString(),
  });
  const res = await fetch(`${API_BASE}/aqi/current?${params}`);
  return handleResponse<CurrentAQIResponse>(res);
}

export async function fetchForecastAQI(
  lat: number,
  lon: number,
  locationName: string,
  refresh: boolean = false
): Promise<ForecastAQIResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    location_name: locationName,
    refresh: refresh.toString(),
  });
  const res = await fetch(`${API_BASE}/aqi/forecast?${params}`);
  return handleResponse<ForecastAQIResponse>(res);
}

export async function fetchRecommendations(
  lat: number,
  lon: number,
  locationName: string,
  memberId?: string
): Promise<RecommendationResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    location_name: locationName,
  });
  if (memberId) {
    params.append('member_id', memberId);
  }
  const res = await fetch(`${API_BASE}/recommendations?${params}`);
  return handleResponse<RecommendationResponse>(res);
}

export async function fetchFamilyMembers(): Promise<FamilyMemberListResponse> {
  const res = await fetch(`${API_BASE}/family`);
  return handleResponse<FamilyMemberListResponse>(res);
}

export async function setActiveFamilyMember(memberId: string): Promise<FamilyMemberListResponse> {
  const res = await fetch(`${API_BASE}/family/active/${memberId}`, {
    method: 'POST',
  });
  return handleResponse<FamilyMemberListResponse>(res);
}

export async function createFamilyMember(payload: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
  const res = await fetch(`${API_BASE}/family`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<FamilyMember>(res);
}

export async function deleteFamilyMember(memberId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/family/${memberId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete family member: ${res.statusText}`);
  }
}

export async function consultGeminiAI(
  message: string,
  history: ChatMessage[],
  locationName: string,
  currentAqi?: number,
  dominantPollutant?: string,
  memberId?: string
): Promise<ConsultationResponse> {
  const res = await fetch(`${API_BASE}/consult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      location_name: locationName,
      current_aqi: currentAqi,
      dominant_pollutant: dominantPollutant,
      member_id: memberId,
    }),
  });
  return handleResponse<ConsultationResponse>(res);
}
