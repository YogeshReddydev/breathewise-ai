import { describe, it, expect } from 'vitest';
import {
  calculateCombustionRatio,
  evaluateCivicActionProtocol,
} from '../src/utils/civicActionEngine';

describe('Civic Action Engine & Graded Response Action Plan (GRAP)', () => {
  describe('calculateCombustionRatio', () => {
    it('returns N/A when pm10 is zero or undefined', () => {
      const res1 = calculateCombustionRatio(50, 0);
      expect(res1.ratio).toBe('N/A');
      expect(res1.isCombustionDominant).toBe(false);

      const res2 = calculateCombustionRatio(50, -5);
      expect(res2.ratio).toBe('N/A');
      expect(res2.isCombustionDominant).toBe(false);
    });

    it('identifies combustion-dominant smog when ratio > 0.6', () => {
      // PM2.5 = 140, PM10 = 180 -> ratio = 0.78
      const res = calculateCombustionRatio(140, 180);
      expect(res.ratio).toBe('0.78');
      expect(res.isCombustionDominant).toBe(true);
    });

    it('identifies crustal/dust-dominant pollution when ratio <= 0.6', () => {
      // PM2.5 = 60, PM10 = 200 -> ratio = 0.30
      const res = calculateCombustionRatio(60, 200);
      expect(res.ratio).toBe('0.30');
      expect(res.isCombustionDominant).toBe(false);
    });
  });

  describe('evaluateCivicActionProtocol', () => {
    it('activates GRAP Stage IV when AQI > 450', () => {
      const protocol = evaluateCivicActionProtocol(460);
      expect(protocol.grapStage).toContain('Stage IV');
      expect(protocol.schoolStatus).toContain('Mandatory Closure');
      expect(protocol.dustMitigation).toContain('Total Construction Ban');
      expect(protocol.dieselRestriction).toContain('Commercial Diesel Trucks');
    });

    it('activates GRAP Stage III when 400 < AQI <= 450', () => {
      const protocol = evaluateCivicActionProtocol(420);
      expect(protocol.grapStage).toContain('Stage III');
      expect(protocol.schoolStatus).toContain('Primary Schools Shift Indoors');
      expect(protocol.dustMitigation).toContain('Demolition & Earthwork Halted');
    });

    it('activates GRAP Stage II when 300 < AQI <= 400', () => {
      const protocol = evaluateCivicActionProtocol(350);
      expect(protocol.grapStage).toContain('Stage II');
      expect(protocol.dieselRestriction).toContain('Diesel Generator Sets Banned');
    });

    it('activates GRAP Stage I when 200 < AQI <= 300', () => {
      const protocol = evaluateCivicActionProtocol(250);
      expect(protocol.grapStage).toContain('Stage I');
      expect(protocol.schoolStatus).toContain('Caution Advised');
    });

    it('returns Normal status when AQI <= 200', () => {
      const protocol = evaluateCivicActionProtocol(80);
      expect(protocol.grapStage).toContain('Normal');
      expect(protocol.schoolStatus).toContain('Normal Outdoor Play');
    });
  });
});
