import { describe, it, expect } from 'vitest';

describe('Sustainable Mobility & Emissions Abatement Calculations', () => {
  // Emission factors in g CO2 / km
  const EMISSION_FACTORS: Record<string, number> = {
    petrol_car: 170.0,
    diesel_car: 155.0,
    two_wheeler: 75.0,
    hybrid_car: 100.0,
    electric_car: 50.0,
    city_bus: 35.0,
    metro_train: 22.0,
    walk_cycle: 0.0,
  };

  const calculateSavings = (
    distanceKm: number,
    baselineMode: string,
    targetMode: string,
    tripsPerWeek: number
  ) => {
    const baseFactor = EMISSION_FACTORS[baselineMode] !== undefined ? EMISSION_FACTORS[baselineMode] : 170.0;
    const targetFactor = EMISSION_FACTORS[targetMode] !== undefined ? EMISSION_FACTORS[targetMode] : 22.0;

    const baseSingleG = baseFactor * distanceKm;
    const targetSingleG = targetFactor * distanceKm;
    const avoidedSingleG = Math.max(0, baseSingleG - targetSingleG);

    const avoidedPct = baseSingleG > 0 ? (avoidedSingleG / baseSingleG) * 100.0 : 0.0;
    const singleKg = avoidedSingleG / 1000.0;
    const weeklyKg = singleKg * tripsPerWeek;
    const annualKg = weeklyKg * 50; // 50 work weeks
    const tailpipePm25AvoidedG = ((baseFactor > 0 ? 0.025 : 0) * distanceKm * tripsPerWeek);

    return {
      avoidedPercentage: Math.round(avoidedPct * 10) / 10,
      singleTripAvoidedKg: Math.round(singleKg * 100) / 100,
      weeklyAvoidedKg: Math.round(weeklyKg * 10) / 10,
      annualAvoidedKg: Math.round(annualKg),
      tailpipePm25AvoidedG: Math.round(tailpipePm25AvoidedG * 10) / 10,
    };
  };

  it('calculates emissions savings when shifting from solo petrol car to electric metro', () => {
    // 15 km commute, 10 trips per week
    const res = calculateSavings(15, 'petrol_car', 'metro_train', 10);
    // Baseline: 170 * 15 = 2550 g. Target: 22 * 15 = 330 g. Avoided = 2220 g (2.22 kg) -> ~87.1%
    expect(res.avoidedPercentage).toBe(87.1);
    expect(res.singleTripAvoidedKg).toBe(2.22);
    expect(res.weeklyAvoidedKg).toBe(22.2);
    expect(res.annualAvoidedKg).toBe(1110);
    expect(res.tailpipePm25AvoidedG).toBeGreaterThan(0);
  });

  it('calculates 100% savings when shifting to walking or cycling', () => {
    const res = calculateSavings(5, 'petrol_car', 'walk_cycle', 10);
    expect(res.avoidedPercentage).toBe(100.0);
    expect(res.singleTripAvoidedKg).toBe(0.85);
  });

  it('provides appropriate safety advisories across AQI bands', () => {
    const getAdvisory = (aqi: number) => {
      if (aqi <= 50) return 'Active walking and cycling encouraged in clean air.';
      if (aqi <= 100) return 'Moderate air. Walking is acceptable; sensitive groups should monitor symptoms.';
      return 'Elevated air pollution. Shifting to enclosed electric metro is strongly recommended over open cycling.';
    };

    expect(getAdvisory(35)).toContain('encouraged in clean air');
    expect(getAdvisory(85)).toContain('Moderate air');
    expect(getAdvisory(240)).toContain('enclosed electric metro');
  });
});
