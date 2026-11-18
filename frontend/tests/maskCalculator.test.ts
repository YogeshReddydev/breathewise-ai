import { describe, it, expect } from 'vitest';
import { calculateRespiratorExposure, MASK_SPECIFICATIONS } from '../src/utils/maskCalculator';

describe('Mask Calculator & Respirator Exposure Engine', () => {
  it('correctly provides specifications for standard certified respirators', () => {
    expect(MASK_SPECIFICATIONS.n95.efficiency).toBe(0.95);
    expect(MASK_SPECIFICATIONS.n99.efficiency).toBe(0.99);
    expect(MASK_SPECIFICATIONS.kf94.efficiency).toBe(0.94);
    expect(MASK_SPECIFICATIONS.surgical.efficiency).toBe(0.35);
  });

  it('calculates inhaled PM2.5 reduction accurately for N95', () => {
    // Ambient PM2.5 = 100 µg/m³, 2 hours exposure
    // hourly volume = 0.55 m³, daily volume = 1.1 m³
    // unmasked = 110 µg, blocked = 110 * 0.95 = 104.5 µg, lung penetration = 5.5 µg
    const res = calculateRespiratorExposure(100, 'n95', 2);
    expect(res.selectedSpec.efficiency).toBe(0.95);
    expect(res.dailyInhaledAirM3).toBeCloseTo(1.1, 2);
    expect(res.unmaskedExposureUg).toBeCloseTo(110, 1);
    expect(res.blockedExposureUg).toBeCloseTo(104.5, 1);
    expect(res.lungPenetrationUg).toBeCloseTo(5.5, 1);
  });

  it('calculates inhaled PM2.5 reduction for N99 with 99% blocking', () => {
    // Ambient PM2.5 = 200 µg/m³, 1 hour exposure
    // volume = 0.55 m³, unmasked = 110 µg, blocked = 108.9 µg, lung penetration = 1.1 µg
    const res = calculateRespiratorExposure(200, 'n99', 1);
    expect(res.selectedSpec.efficiency).toBe(0.99);
    expect(res.dailyInhaledAirM3).toBeCloseTo(0.55, 2);
    expect(res.unmaskedExposureUg).toBeCloseTo(110, 1);
    expect(res.blockedExposureUg).toBeCloseTo(108.9, 1);
    expect(res.lungPenetrationUg).toBeCloseTo(1.1, 1);
  });

  it('applies electrostatic degradation multiplier when ambient PM2.5 is elevated', () => {
    // Under low PM2.5 (30 µg/m³), degradationMultiplier is 1.0 -> usefulHours = 40
    const resLow = calculateRespiratorExposure(30, 'n95', 2);
    expect(resLow.estimatedUsefulHours).toBe(40);

    // Under moderate PM2.5 (100 µg/m³), degradationMultiplier is 1.4 -> usefulHours = round(40 / 1.4) = 29
    const resMod = calculateRespiratorExposure(100, 'n95', 2);
    expect(resMod.estimatedUsefulHours).toBe(29);

    // Under severe PM2.5 (200 µg/m³), degradationMultiplier is 2.0 -> usefulHours = round(40 / 2.0) = 20
    const resSevere = calculateRespiratorExposure(200, 'n95', 2);
    expect(resSevere.estimatedUsefulHours).toBe(20);
    expect(resSevere.remainingDays).toBe(10);
  });
});
