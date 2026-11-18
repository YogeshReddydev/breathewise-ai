export interface CivicActionProtocol {
  grapStage: string;
  grapColor: string;
  schoolStatus: string;
  dustMitigation: string;
  dieselRestriction: string;
}

export interface CombustionRatioResult {
  ratio: string;
  isCombustionDominant: boolean;
}

/**
 * Calculates the fine-to-coarse PM2.5 / PM10 ratio and checks for combustion dominance.
 */
export function calculateCombustionRatio(pm25: number, pm10: number): CombustionRatioResult {
  if (!pm10 || pm10 <= 0) {
    return { ratio: 'N/A', isCombustionDominant: false };
  }
  const ratioVal = pm25 / pm10;
  return {
    ratio: ratioVal.toFixed(2),
    isCombustionDominant: ratioVal > 0.6,
  };
}

/**
 * Maps ambient AQI to official Graded Response Action Plan (GRAP) regulatory civic stages.
 */
export function evaluateCivicActionProtocol(aqi: number): CivicActionProtocol {
  if (aqi > 450) {
    return {
      grapStage: 'GRAP Stage IV (Severe+ Emergency)',
      grapColor: 'text-rose-900 bg-rose-100 border-rose-300',
      schoolStatus: 'Mandatory Closure / Shift to Remote Learning',
      dustMitigation: 'Total Construction Ban & High-Pressure Anti-Smog Guns Active',
      dieselRestriction: 'Strict Ban on Non-BS VI Commercial Diesel Trucks',
    };
  }

  if (aqi > 400) {
    return {
      grapStage: 'GRAP Stage III (Severe Smog Alert)',
      grapColor: 'text-rose-800 bg-rose-50 border-rose-200',
      schoolStatus: 'Primary Schools Shift Indoors (No Outdoor PE)',
      dustMitigation: 'Demolition & Earthwork Halted Across City Boundaries',
      dieselRestriction: 'BS-III Petrol & BS-IV Diesel Private Cars Restricted',
    };
  }

  if (aqi > 300) {
    return {
      grapStage: 'GRAP Stage II (Very Poor Alert)',
      grapColor: 'text-orange-800 bg-orange-50 border-orange-200',
      schoolStatus: 'Restricted Physical Activity; Avoid Morning Outdoor Assemblies',
      dustMitigation: 'Mechanized Vacuum Sweeping & Water Sprinkling on Main Roads',
      dieselRestriction: 'Diesel Generator Sets Banned Except for Emergency Hospital Services',
    };
  }

  if (aqi > 200) {
    return {
      grapStage: 'GRAP Stage I (Poor Air Quality)',
      grapColor: 'text-amber-800 bg-amber-50 border-amber-200',
      schoolStatus: 'Caution Advised; Sensitive Cohorts Restricted from Strenuous Sports',
      dustMitigation: 'Standard Construction Dust Enclosures Enforced',
      dieselRestriction: 'Strict Enforcement of PUC (Pollution Under Control) Norms',
    };
  }

  return {
    grapStage: 'Normal / Baseline Routine',
    grapColor: 'text-emerald-800 bg-emerald-50 border-emerald-300',
    schoolStatus: 'Normal Outdoor Play & Physical Education',
    dustMitigation: 'Standard Routine Street Sweeping',
    dieselRestriction: 'Normal Standard Emissions Monitoring',
  };
}
