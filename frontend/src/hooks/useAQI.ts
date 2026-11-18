import { useState, useEffect, useCallback, useRef } from 'react';
import { AQIReading, AQIStandard, AirQualityForecast } from '../types/aqi';
import { ComprehensiveRecommendation } from '../types/recommendations';
import { FamilyGroup } from '../types/family';
import { fetchCurrentAQI, fetchForecast, fetchComprehensiveRecommendations } from '../services/api';

export function useAQI(initialCity: string = 'New Delhi', family?: FamilyGroup) {
  const [city, setCity] = useState<string>(initialCity);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [standard, setStandard] = useState<AQIStandard>('cpcb');
  const [forecastHours, setForecastHours] = useState<number>(24);

  const [reading, setReading] = useState<AQIReading | null>(null);
  const [forecast, setForecast] = useState<AirQualityForecast | null>(null);
  const [recommendations, setRecommendations] = useState<ComprehensiveRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Monitor browser online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const readingRef = useRef<AQIReading | null>(null);
  readingRef.current = reading;

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lat = coordinates?.lat;
      const lon = coordinates?.lon;

      const [currentReading, forecastData, recData] = await Promise.all([
        fetchCurrentAQI(city, lat, lon, standard),
        fetchForecast(city, lat, lon, forecastHours),
        fetchComprehensiveRecommendations(city, lat, lon, family, standard),
      ]);

      setReading(currentReading);
      setForecast(forecastData);
      setRecommendations(recData);
      setIsStale(currentReading.is_stale || false);
    } catch (err: any) {
      console.error('Error fetching AQI intelligence:', err);
      // If we already have a reading, keep it but mark as stale
      if (readingRef.current) {
        setIsStale(true);
        setError('Displaying cached atmospheric telemetry. Reconnecting to live provider...');
      } else {
        setError(err?.message || 'Failed to update atmospheric telemetry');
      }
    } finally {
      setLoading(false);
    }
  }, [city, coordinates, standard, forecastHours, family]);

  useEffect(() => {
    refreshData();
  }, [city, coordinates, standard, forecastHours, family]);

  const selectLocation = (newCity: string, lat?: number, lon?: number) => {
    setCity(newCity);
    if (lat !== undefined && lon !== undefined) {
      setCoordinates({ lat, lon });
      // If Indian coordinate box, prioritize CPCB NAQI
      if (lat >= 6.5 && lat <= 37.5 && lon >= 68.0 && lon <= 97.5) {
        setStandard('cpcb');
      }
    } else {
      setCoordinates(null);
      if (newCity.toLowerCase().includes('india') || newCity.toLowerCase().includes('delhi') || newCity.toLowerCase().includes('mumbai')) {
        setStandard('cpcb');
      }
    }
  };

  return {
    city,
    coordinates,
    standard,
    setStandard,
    forecastHours,
    setForecastHours,
    reading,
    forecast,
    recommendations,
    loading,
    error,
    isStale,
    isOffline,
    refreshData,
    selectLocation,
  };
}
