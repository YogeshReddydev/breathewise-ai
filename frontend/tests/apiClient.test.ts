import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, buildQueryParams, apiRequest } from '../src/services/apiClient';

describe('API Client & Serialization Utilities', () => {
  describe('buildQueryParams', () => {
    it('serializes simple key-value pairs into query string', () => {
      const q = buildQueryParams({ city: 'Delhi', standard: 'cpcb' });
      expect(q).toBe('?city=Delhi&standard=cpcb');
    });

    it('ignores undefined, null, and empty string entries', () => {
      const q = buildQueryParams({
        city: 'Mumbai',
        lat: undefined,
        lon: null,
        empty: '',
        hours: 24,
      });
      expect(q).toBe('?city=Mumbai&hours=24');
    });

    it('returns empty string if all parameters are empty or nil', () => {
      const q = buildQueryParams({ lat: undefined, lon: null });
      expect(q).toBe('');
    });
  });

  describe('ApiError class', () => {
    it('preserves error message, status code, detail, and network flags', () => {
      const err = new ApiError('Not found', 404, 'Entity does not exist', false);
      expect(err.name).toBe('ApiError');
      expect(err.message).toBe('Not found');
      expect(err.status).toBe(404);
      expect(err.detail).toBe('Entity does not exist');
      expect(err.isNetworkError).toBe(false);
      expect(err instanceof Error).toBe(true);
      expect(err instanceof ApiError).toBe(true);
    });
  });

  describe('apiRequest execution', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('parses JSON on successful response', async () => {
      const mockData = { status: 'healthy' };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const res = await apiRequest<{ status: string }>('/health');
      expect(res).toEqual(mockData);
    });

    it('throws ApiError with server detail when status is not ok', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: 'City not found' }), { status: 404 })
      );

      await expect(apiRequest('/test')).rejects.toThrow('City not found');
    });

    it('identifies network failures and tags isNetworkError=true', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiRequest('/test', undefined, 'Network call failed')).rejects.toMatchObject({
        isNetworkError: true,
        status: 0,
      });
    });
  });
});
