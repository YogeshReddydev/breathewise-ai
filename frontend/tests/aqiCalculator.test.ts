import { describe, it, expect } from 'vitest';
import {
  getCategoryFromAQI,
  getAQIColorHex,
  getAQILabel,
  getCPCBCategoryAndColor,
  getEuropeanCategoryAndColor,
  getStandardCategoryAndColor,
  getStandardDisplayName,
  getWhoThresholdPercentage,
} from '../src/utils/aqiCalculator';

describe('AQI Calculator Utilities', () => {
  it('correctly categorizes US EPA AQI values', () => {
    expect(getCategoryFromAQI(15)).toBe('good');
    expect(getCategoryFromAQI(50)).toBe('good');
    expect(getCategoryFromAQI(75)).toBe('moderate');
    expect(getCategoryFromAQI(125)).toBe('sensitive');
    expect(getCategoryFromAQI(175)).toBe('unhealthy');
    expect(getCategoryFromAQI(250)).toBe('very_unhealthy');
    expect(getCategoryFromAQI(350)).toBe('hazardous');
  });

  it('correctly categorizes Indian CPCB National AQI values', () => {
    expect(getCPCBCategoryAndColor(30).category).toBe('Good');
    expect(getCPCBCategoryAndColor(30).colorHex).toBe('#10B981');

    expect(getCPCBCategoryAndColor(75).category).toBe('Satisfactory');
    expect(getCPCBCategoryAndColor(75).colorHex).toBe('#84CC16');

    expect(getCPCBCategoryAndColor(150).category).toBe('Moderate');
    expect(getCPCBCategoryAndColor(150).colorHex).toBe('#EAB308');

    expect(getCPCBCategoryAndColor(250).category).toBe('Poor');
    expect(getCPCBCategoryAndColor(250).colorHex).toBe('#F97316');

    expect(getCPCBCategoryAndColor(350).category).toBe('Very Poor');
    expect(getCPCBCategoryAndColor(350).colorHex).toBe('#EF4444');

    expect(getCPCBCategoryAndColor(450).category).toBe('Severe');
    expect(getCPCBCategoryAndColor(450).colorHex).toBe('#7F1D1D');
  });

  it('correctly categorizes European AQI values', () => {
    expect(getEuropeanCategoryAndColor(20).category).toBe('Very Good');
    expect(getEuropeanCategoryAndColor(40).category).toBe('Good');
    expect(getEuropeanCategoryAndColor(65).category).toBe('Moderate');
    expect(getEuropeanCategoryAndColor(85).category).toBe('Poor');
    expect(getEuropeanCategoryAndColor(115).category).toBe('Very Poor');
  });

  it('provides distinct standard names without mixing', () => {
    expect(getStandardDisplayName('cpcb')).toBe('CPCB NAQI (India)');
    expect(getStandardDisplayName('us_epa')).toBe('US EPA AQI');
    expect(getStandardDisplayName('european')).toBe('European AQI (EAQI)');
  });

  it('calculates percentage against WHO 2021 air quality thresholds', () => {
    // PM2.5 WHO guideline limit is 15.0 µg/m³
    const res = getWhoThresholdPercentage('PM2.5', 30.0);
    expect(res.limit).toBe(15.0);
    expect(res.percent).toBe(200);
    expect(res.exceeds).toBe(true);

    const safeRes = getWhoThresholdPercentage('PM2.5', 7.5);
    expect(safeRes.percent).toBe(50);
    expect(safeRes.exceeds).toBe(false);
  });

  it('correctly maps standard category and colors dynamically', () => {
    // CPCB Moderate (150) vs US EPA Unhealthy (160)
    const cpcbMod = getStandardCategoryAndColor('cpcb', 150);
    expect(cpcbMod.category).toBe('Moderate');

    const epaUnhealthy = getStandardCategoryAndColor('us_epa', 160);
    expect(epaUnhealthy.category).toBe('Unhealthy');
    expect(epaUnhealthy.colorHex).toBe('#EF4444');

    const eaVeryPoor = getStandardCategoryAndColor('european', 120);
    expect(eaVeryPoor.category).toBe('Very Poor');
  });

  it('handles edge case zero and extreme maximum thresholds safely', () => {
    const zeroRes = getWhoThresholdPercentage('PM10', 0);
    expect(zeroRes.percent).toBe(0);
    expect(zeroRes.exceeds).toBe(false);

    const extremeEpa = getCategoryFromAQI(500);
    expect(extremeEpa).toBe('hazardous');
  });
});
