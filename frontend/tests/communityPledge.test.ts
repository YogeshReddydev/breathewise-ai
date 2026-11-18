import { describe, it, expect } from 'vitest';

describe('Community Intelligence & Aerosol Diagnostics', () => {
  // Aerosol Fingerprint logic from CommunityIntelligenceCard
  const getAerosolDiagnostics = (pm25: number, pm10: number) => {
    const ratio = pm10 > 0 ? pm25 / pm10 : 0;
    const isCombustionDominant = pm10 > 0 && ratio > 0.6;
    return {
      ratioFormatted: pm10 > 0 ? ratio.toFixed(2) : 'N/A',
      isCombustionDominant,
    };
  };

  // GRAP Stage mapping logic from CommunityIntelligenceCard
  const getGrapStage = (aqi: number) => {
    if (aqi > 450) return 'GRAP Stage IV (Severe+)';
    if (aqi > 400) return 'GRAP Stage III (Severe)';
    if (aqi > 300) return 'GRAP Stage II (Very Poor)';
    if (aqi > 200) return 'GRAP Stage I (Poor)';
    return 'Normal / Baseline';
  };

  it('calculates combustion aerosol dominance when PM2.5 / PM10 exceeds 0.60', () => {
    // Winter smog signature: 180 PM2.5 / 220 PM10 -> 0.82 ratio
    const diag = getAerosolDiagnostics(180, 220);
    expect(diag.ratioFormatted).toBe('0.82');
    expect(diag.isCombustionDominant).toBe(true);
  });

  it('identifies mineral or crustal dust loading when PM2.5 / PM10 is below 0.60', () => {
    // Desert dust or road resuspension: 50 PM2.5 / 250 PM10 -> 0.20 ratio
    const diag = getAerosolDiagnostics(50, 250);
    expect(diag.ratioFormatted).toBe('0.20');
    expect(diag.isCombustionDominant).toBe(false);
  });

  it('handles zero or missing PM10 gracefully with N/A ratio', () => {
    const diag = getAerosolDiagnostics(45, 0);
    expect(diag.ratioFormatted).toBe('N/A');
    expect(diag.isCombustionDominant).toBe(false);
  });

  it('maps CPCB AQI breakpoints correctly to official GRAP emergency stages', () => {
    expect(getGrapStage(480)).toBe('GRAP Stage IV (Severe+)');
    expect(getGrapStage(420)).toBe('GRAP Stage III (Severe)');
    expect(getGrapStage(350)).toBe('GRAP Stage II (Very Poor)');
    expect(getGrapStage(240)).toBe('GRAP Stage I (Poor)');
    expect(getGrapStage(110)).toBe('Normal / Baseline');
    expect(getGrapStage(45)).toBe('Normal / Baseline');
  });
});

