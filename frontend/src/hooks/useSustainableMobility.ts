import { useState, useEffect, useCallback } from 'react';
import {
  EmissionsCalculationResult,
  SustainableTransportOption,
  TransportMode,
} from '../types/sustainability';
import { calculateEmissions, fetchSustainableTransportOptions } from '../services/api';

export function useSustainableMobility(currentAQI: number) {
  const [distance, setDistance] = useState<number>(15);
  const [baselineMode, setBaselineMode] = useState<TransportMode>('petrol_car');
  const [targetMode, setTargetMode] = useState<TransportMode>('metro_train');
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10);
  const [result, setResult] = useState<EmissionsCalculationResult | null>(null);
  const [options, setOptions] = useState<SustainableTransportOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOptions() {
      try {
        const opts = await fetchSustainableTransportOptions(currentAQI);
        if (isMounted) {
          setOptions(opts);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load transport options');
        }
      }
    }
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [currentAQI]);

  const runCalculation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await calculateEmissions(
        {
          distance_km: Number(distance),
          baseline_mode: baselineMode,
          target_mode: targetMode,
          trips_per_week: Number(tripsPerWeek),
        },
        currentAQI
      );
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate emissions');
    } finally {
      setLoading(false);
    }
  }, [distance, baselineMode, targetMode, tripsPerWeek, currentAQI]);

  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  return {
    distance,
    setDistance,
    baselineMode,
    setBaselineMode,
    targetMode,
    setTargetMode,
    tripsPerWeek,
    setTripsPerWeek,
    result,
    options,
    loading,
    error,
    recalculate: runCalculation,
  };
}
