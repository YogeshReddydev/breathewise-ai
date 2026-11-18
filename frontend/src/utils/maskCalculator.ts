export type MaskType = 'n95' | 'n99' | 'kf94' | 'surgical';

export interface MaskSpecification {
  name: string;
  efficiency: number;
  maxLifeHours: number;
  description: string;
}

export const MASK_SPECIFICATIONS: Record<MaskType, MaskSpecification> = {
  n95: {
    name: 'N95 Respirator',
    efficiency: 0.95,
    maxLifeHours: 40,
    description: 'NIOSH certified; filters ≥95% of non-oil particulates down to 0.3 microns with proper facial seal.',
  },
  n99: {
    name: 'N99 / FFP3 Respirator',
    efficiency: 0.99,
    maxLifeHours: 35,
    description: 'High-grade electrostatic filter; blocks ≥99% of fine aerosols. Higher breathing resistance.',
  },
  kf94: {
    name: 'KF94 (Korean Standard)',
    efficiency: 0.94,
    maxLifeHours: 30,
    description: 'Foldable 3-panel design with adjustable nose bridge; filters ≥94% of particulate matter.',
  },
  surgical: {
    name: 'Standard 3-Ply Surgical Mask',
    efficiency: 0.35,
    maxLifeHours: 8,
    description: 'Fluid resistant but loose facial fit; allows significant perimeter particulate leakage (effective ~30-40%).',
  },
};

export interface MaskFiltrationResult {
  selectedSpec: MaskSpecification;
  dailyInhaledAirM3: number;
  unmaskedExposureUg: number;
  blockedExposureUg: number;
  lungPenetrationUg: number;
  estimatedUsefulHours: number;
  remainingDays: number;
}

/**
 * Calculates mass particulate exposure and respirator penetration based on ambient PM2.5,
 * certified filter efficiency, and respiratory tidal volume.
 */
export function calculateRespiratorExposure(
  pm25: number,
  maskType: MaskType,
  exposureHours: number
): MaskFiltrationResult {
  const selectedSpec = MASK_SPECIFICATIONS[maskType];

  // Average adult breathes ~0.55 m³ of air per hour at light-to-moderate exertion
  const hourlyAirVolumeM3 = 0.55;
  const dailyInhaledAirM3 = hourlyAirVolumeM3 * exposureHours;

  const unmaskedExposureUg = dailyInhaledAirM3 * pm25;
  const blockedExposureUg = unmaskedExposureUg * selectedSpec.efficiency;
  const lungPenetrationUg = Math.max(0, unmaskedExposureUg - blockedExposureUg);

  // High particulate concentration causes faster electrostatic loading and filter media saturation
  const degradationMultiplier = pm25 > 150 ? 2.0 : pm25 > 80 ? 1.4 : 1.0;
  const estimatedUsefulHours = Math.round(selectedSpec.maxLifeHours / degradationMultiplier);
  const remainingDays = Math.max(1, Math.round(estimatedUsefulHours / Math.max(1, exposureHours)));

  return {
    selectedSpec,
    dailyInhaledAirM3,
    unmaskedExposureUg,
    blockedExposureUg,
    lungPenetrationUg,
    estimatedUsefulHours,
    remainingDays,
  };
}
