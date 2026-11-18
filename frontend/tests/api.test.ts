import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchHealth,
  fetchCurrentAQI,
  fetchForecast,
  searchLocations,
  fetchDefaultProfile,
  resetDemoProfile,
  clearDemoProfile,
  addFamilyMember,
  removeFamilyMember,
  fetchComprehensiveRecommendations,
  calculateEmissions,
  fetchSustainableTransportOptions,
  sendChatMessage,
} from '../src/services/api';

describe('BreatheWise Frontend API Service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetchHealth queries /api/health successfully', async () => {
    const mockHealth = { status: 'healthy', gemini_active: true, default_provider: 'open-meteo' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHealth,
    } as Response);

    const res = await fetchHealth();
    expect(res).toEqual(mockHealth);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/health');
  });

  it('fetchCurrentAQI constructs city and standard query parameters properly', async () => {
    const mockReading = { aqi_us: 155, category_label: 'Unhealthy' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReading,
    } as Response);

    const res = await fetchCurrentAQI('New Delhi', 28.61, 77.20, 'cpcb');
    expect(res).toEqual(mockReading);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/aqi/current?city=New+Delhi&lat=28.61&lon=77.2&standard=cpcb'
    );
  });

  it('fetchCurrentAQI throws descriptive error message on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Coordinates out of bounds' }),
    } as Response);

    await expect(fetchCurrentAQI(undefined, 100, 200)).rejects.toThrow('Coordinates out of bounds');
  });

  it('fetchForecast constructs query with hours horizon', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ location_name: 'Delhi', hourly: [] }),
    } as Response);

    await fetchForecast('Delhi', undefined, undefined, 48);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/aqi/forecast?city=Delhi&hours=48');
  });

  it('searchLocations returns empty array for queries shorter than 2 chars', async () => {
    const spy = vi.fn();
    globalThis.fetch = spy;

    const res = await searchLocations('a');
    expect(res).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('searchLocations fetches with URI encoded query for valid inputs', async () => {
    const mockResults = [{ name: 'Mumbai', country: 'India', latitude: 19.07, longitude: 72.87 }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    } as Response);

    const res = await searchLocations('New Delhi');
    expect(res).toEqual(mockResults);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/aqi/locations/search?q=New%20Delhi');
  });

  it('fetchComprehensiveRecommendations calls evaluate-custom when family is passed', async () => {
    const mockRec = { headline: 'Clean Air' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRec,
    } as Response);

    const mockFamily: any = { family_name: 'Smiths', members: [] };
    const res = await fetchComprehensiveRecommendations('Mumbai', undefined, undefined, mockFamily, 'cpcb');
    expect(res).toEqual(mockRec);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/recommendations/evaluate-custom',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('calculateEmissions sends POST with request body and aqi query param', async () => {
    const mockCalc = { single_trip_avoided_kg: 2.5, avoided_percentage: 85 };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCalc,
    } as Response);

    const req = {
      distance_km: 15,
      baseline_mode: 'petrol_car' as const,
      target_mode: 'metro_train' as const,
      trips_per_week: 10,
    };
    const res = await calculateEmissions(req, 160);
    expect(res).toEqual(mockCalc);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/sustainability/calculate?aqi=160',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(req),
      })
    );
  });

  it('sendChatMessage dispatches formatted payload with context', async () => {
    const mockChatResp = { reply: 'Stay indoors', model: 'gemini', source: 'gemini' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockChatResp,
    } as Response);

    const res = await sendChatMessage('Is it safe?', null, null);
    expect(res).toEqual(mockChatResp);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/chat/message',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          message: 'Is it safe?',
          context_aqi: null,
          context_family: null,
        }),
      })
    );
  });
});
