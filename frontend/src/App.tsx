import React, { useState, useEffect } from 'react';
import {
  CityLocation,
  CurrentAQIResponse,
  ForecastAQIResponse,
  RecommendationResponse,
  FamilyMember,
} from './types';
import {
  fetchMajorCities,
  fetchCurrentAQI,
  fetchForecastAQI,
  fetchRecommendations,
  fetchFamilyMembers,
  setActiveFamilyMember,
  createFamilyMember,
} from './services/api';
import { Navbar } from './components/Navbar';
import { AQIGauge } from './components/AQIGauge';
import { PollutantGrid } from './components/PollutantGrid';
import { ForecastChart } from './components/ForecastChart';
import { FamilyMatrix } from './components/FamilyMatrix';
import { ActionCards } from './components/ActionCards';
import { GeminiConsultation } from './components/GeminiConsultation';
import { FamilyModal } from './components/FamilyModal';
import { Loader2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [cities, setCities] = useState<CityLocation[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityLocation>({
    name: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string | undefined>();

  const [currentAQI, setCurrentAQI] = useState<CurrentAQIResponse | null>(null);
  const [forecastAQI, setForecastAQI] = useState<ForecastAQIResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);

  // Initialize Cities & Family
  useEffect(() => {
    async function init() {
      try {
        const [citiesData, familyData] = await Promise.all([
          fetchMajorCities().catch(() => [
            { name: 'New Delhi, India', latitude: 28.6139, longitude: 77.2090 },
            { name: 'London, United Kingdom', latitude: 51.5074, longitude: -0.1278 },
            { name: 'New York, USA', latitude: 40.7128, longitude: -74.0060 },
          ]),
          fetchFamilyMembers().catch(() => ({ members: [], active_member_id: undefined })),
        ]);

        setCities(citiesData);
        if (citiesData.length > 0) {
          setSelectedCity(citiesData[0]);
        }
        setFamilyMembers(familyData.members);
        setActiveMemberId(familyData.active_member_id);
      } catch (err: any) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  // Fetch Atmospheric Data on City or Active Member Change
  const loadAtmosphericData = async (refresh: boolean = false) => {
    if (!selectedCity) return;
    setIsLoading(true);
    setError(null);
    try {
      const [curr, fc, recs] = await Promise.all([
        fetchCurrentAQI(selectedCity.latitude, selectedCity.longitude, selectedCity.name, refresh),
        fetchForecastAQI(selectedCity.latitude, selectedCity.longitude, selectedCity.name, refresh),
        fetchRecommendations(selectedCity.latitude, selectedCity.longitude, selectedCity.name, activeMemberId),
      ]);
      setCurrentAQI(curr);
      setForecastAQI(fc);
      setRecommendations(recs);
    } catch (err: any) {
      console.error('Data fetching error:', err);
      setError('Unable to reach atmospheric telemetry services. Retrying with local baseline.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAtmosphericData(false);
  }, [selectedCity, activeMemberId]);

  const handleSelectMember = async (id: string) => {
    try {
      const updated = await setActiveFamilyMember(id);
      setActiveMemberId(updated.active_member_id);
      setFamilyMembers(updated.members);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (memberData: Omit<FamilyMember, 'id'>) => {
    try {
      const newMem = await createFamilyMember(memberData);
      setFamilyMembers((prev) => [...prev, newMem]);
      setActiveMemberId(newMem.id);
    } catch (err) {
      console.error(err);
    }
  };

  const activeMember = familyMembers.find((m) => m.id === activeMemberId);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-navy-950">
      <Navbar
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        familyMembers={familyMembers}
        activeMemberId={activeMemberId}
        onSelectMember={handleSelectMember}
        onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
        onRefresh={() => loadAtmosphericData(true)}
        isLoading={isLoading}
        providerName={currentAQI?.provider || 'Open-Meteo High-Res Atmosphere'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && !currentAQI ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-semibold tracking-wide text-slate-300">
              Gathering atmospheric sensor telemetry for {selectedCity.name}...
            </span>
          </div>
        ) : (
          <>
            {/* Top Row: Current AQI Gauge & Trajectory Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7">
                {currentAQI && <AQIGauge aqiData={currentAQI} />}
              </div>
              <div className="lg:col-span-5">
                {forecastAQI && <ForecastChart forecast={forecastAQI} />}
              </div>
            </div>

            {/* Pollutants Breakdown Grid */}
            {currentAQI && <PollutantGrid pollutants={currentAQI.pollutants} />}

            {/* Family Vulnerability Matrix */}
            <FamilyMatrix
              members={familyMembers}
              activeMemberId={activeMemberId}
              currentAqi={currentAQI?.aqi || 50}
              onSelectMember={handleSelectMember}
              onOpenModal={() => setIsFamilyModalOpen(true)}
            />

            {/* Bottom Row: Action Directives & Gemini Health Consultant */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                {recommendations && <ActionCards recommendations={recommendations} />}
              </div>
              <div className="lg:col-span-5 sticky top-24">
                <GeminiConsultation
                  locationName={selectedCity.name}
                  currentAqi={currentAQI?.aqi || 50}
                  dominantPollutant={currentAQI?.dominant_pollutant || 'PM2.5'}
                  activeMember={activeMember}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800/80 bg-navy-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="font-extrabold text-slate-200">BreatheWise AI · Challenge 6</div>
            <div className="text-[11px] text-slate-400">
              Live Urban Atmospheric Telemetry & Preventative Clinical Intelligence
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            Powered by Google Gemini 2.5 Flash & Open-Meteo Air Quality Services
          </div>
        </div>
      </footer>

      {/* Add Family Member Modal */}
      <FamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        onAddMember={handleAddMember}
      />
    </div>
  );
};
