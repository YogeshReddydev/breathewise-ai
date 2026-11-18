import { describe, it, expect } from 'vitest';

describe('Environmental Intelligence: Winter Smog & Thermal Inversion', () => {
  it('calculates severe inversion risk when PM2.5 is extremely elevated', () => {
    const pm25 = 210.0;
    const inversionRiskScore = Math.min(100, Math.round((pm25 / 180) * 80 + (pm25 > 60 ? 20 : 5)));
    expect(inversionRiskScore).toBeGreaterThanOrEqual(70);
    
    // Boundary layer should be compressed under 300 meters
    const boundaryLayerMeters = inversionRiskScore >= 70 ? 280 : 550;
    expect(boundaryLayerMeters).toBe(280);
  });

  it('calculates normal atmospheric dispersion when PM2.5 is low', () => {
    const pm25 = 22.0;
    const inversionRiskScore = Math.min(100, Math.round((pm25 / 180) * 80 + (pm25 > 60 ? 20 : 5)));
    expect(inversionRiskScore).toBeLessThan(40);

    const boundaryLayerMeters = inversionRiskScore >= 70 ? 280 : inversionRiskScore >= 40 ? 550 : 1200;
    expect(boundaryLayerMeters).toBe(1200);
  });
});

describe('Environmental Intelligence: Respirator Protection & Filter Saturation', () => {
  it('correctly calculates PM2.5 avoided by N95 respirators', () => {
    const pm25 = 120.0; // µg/m³
    const hours = 2; // hours outdoor
    const airVolumeM3PerHour = 0.55;
    const n95Efficiency = 0.95;

    const totalInhaledVolume = hours * airVolumeM3PerHour; // 1.10 m³
    const unmaskedDose = totalInhaledVolume * pm25; // 132 µg
    const blockedDose = unmaskedDose * n95Efficiency; // 125.4 µg
    const lungPenetration = unmaskedDose - blockedDose; // 6.6 µg

    expect(totalInhaledVolume).toBeCloseTo(1.1, 2);
    expect(unmaskedDose).toBeCloseTo(132.0, 1);
    expect(blockedDose).toBeCloseTo(125.4, 1);
    expect(lungPenetration).toBeCloseTo(6.6, 1);
  });

  it('accelerates filter saturation under severe soot pollution', () => {
    const baseLifeHours = 40;
    const severePM25 = 180.0;
    const degradationMultiplier = severePM25 > 150 ? 2.0 : 1.0;
    const effectiveHours = Math.round(baseLifeHours / degradationMultiplier);

    expect(effectiveHours).toBe(20);
  });
});

describe('Environmental Intelligence: City Benchmark Radar', () => {
  it('computes differential against current city baseline', () => {
    const currentAQI = 150;
    const targetCityAQI = 45;
    const diff = targetCityAQI - currentAQI;

    expect(diff).toBe(-105);
    const isCleaner = diff < 0;
    expect(isCleaner).toBe(true);
  });
});
