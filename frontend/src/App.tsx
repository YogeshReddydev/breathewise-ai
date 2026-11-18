import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AQIGaugeHero } from './components/dashboard/AQIGaugeHero';
import { PollutantGrid } from './components/dashboard/PollutantGrid';
import { HourlyForecastTimeline } from './components/dashboard/HourlyForecastTimeline';
import { OptimalWindowCard } from './components/dashboard/OptimalWindowCard';
import { IndoorProtocolCard } from './components/dashboard/IndoorProtocolCard';
import { WinterSmogShield } from './components/dashboard/WinterSmogShield';
import { MaskFilterEstimator } from './components/dashboard/MaskFilterEstimator';
import { CityComparisonMatrix } from './components/dashboard/CityComparisonMatrix';
import { CohortRecommendationsGrid } from './components/dashboard/CohortRecommendationsGrid';
import { SustainableLivingSection } from './components/sustainability/SustainableLivingSection';
import { CommunityIntelligenceCard } from './components/dashboard/CommunityIntelligenceCard';
import { ProfileSelector } from './components/family/ProfileSelector';
import { MemberHealthAdvisories } from './components/family/MemberHealthAdvisories';
import { FamilyMemberModal } from './components/family/FamilyMemberModal';
import { EnvironmentalAssistant } from './components/chat/EnvironmentalAssistant';
import { useAQI } from './hooks/useAQI';
import { useFamilyProfiles } from './hooks/useFamilyProfiles';
import { getActiveAQI } from './utils/aqiCalculator';
import { AlertCircle, RefreshCw, WifiOff, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    family,
    selectedMemberId,
    setSelectedMemberId,
    selectedMember,
    resetDemo,
    clearDemo,
    addMember,
    removeMember,
  } = useFamilyProfiles();

  const {
    city,
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
  } = useAQI('New Delhi, India', family || undefined);

  // Compute active displayed AQI consistently matching the active standard
  const activeAQI = getActiveAQI(reading, standard);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Application Shell Navigation */}
      <Navbar
        currentCity={city}
        onSelectCity={selectLocation}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        isLoading={loading}
        isOffline={isOffline}
        onRefresh={refreshData}
        standard={standard}
        onSelectStandard={setStandard}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Offline notification banner */}
        {isOffline && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Offline Mode: Working with locally cached atmospheric telemetry. Reconnecting automatically when internet returns.</span>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconnect
            </button>
          </div>
        )}

        {/* Stale data notification banner */}
        {isStale && !isOffline && (
          <div className="mb-6 p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex items-center gap-2 text-xs shadow-sm">
            <Clock className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Displaying cached atmospheric telemetry. Reconnecting to live sensor providers in background.</span>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-200/60 hover:bg-rose-200 text-rose-900 rounded-lg transition-colors font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Initial Loading State */}
        {loading && !reading && (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 shadow-sm">
              <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Streaming Atmospheric Telemetry</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">Connecting to Open-Meteo &amp; synthesizing Indian CPCB / EPA environmental intelligence for {city}...</p>
          </div>
        )}

        {/* Active Environmental Intelligence Dashboard */}
        {reading && (
          <div className="space-y-6">
            
            {/* Section B: Hero AQI Gauge Card with Multi-Standard Selector */}
            <AQIGaugeHero
              reading={reading}
              recommendations={recommendations}
              standard={standard}
              onSelectStandard={setStandard}
            />

            {/* Winter Inversion & Severe Smog Physics Shield (Challenge 6 Core) */}
            <WinterSmogShield reading={reading} />

            {/* Section E: Optimal Clean Air & Peak Smog Windows */}
            <OptimalWindowCard forecast={forecast} />

            {/* Section D: Atmospheric Pollutants Spectrum Grid */}
            <PollutantGrid pollutants={reading.pollutants} />

            {/* Section C: 24-Hour & 48-Hour Hourly Forecast Trajectory */}
            <HourlyForecastTimeline
              forecast={forecast}
              standard={standard}
              forecastHours={forecastHours}
              onSelectHours={setForecastHours}
            />

            {/* Aerosol Protection & Respirator Saturation Estimator */}
            <MaskFilterEstimator reading={reading} />

            {/* Section F: Indoor Clean Haven & Ventilation Protocol */}
            <IndoorProtocolCard protocol={recommendations?.indoor_protocol} />

            {/* Metropolitan Air Quality Benchmark Radar with Quick City Switcher */}
            <CityComparisonMatrix
              currentReading={reading}
              onSelectCity={(selectedCity) => selectLocation(selectedCity)}
            />

            {/* Cohort Clinical Directives */}
            <CohortRecommendationsGrid cohorts={recommendations?.cohort_recommendations} />

            {/* Section I: Sustainable Mobility & Commute Emissions Calculator */}
            {/* Bug #4 Fix: Synchronize Travel Safety Matrix with activeAQI */}
            <SustainableLivingSection currentAQI={activeAQI} />

            {/* Section J: Community Intelligence & Civic Defense */}
            <CommunityIntelligenceCard
              reading={reading}
              onOpenChat={() => setIsChatOpen(true)}
            />

            {/* Section G: Family Profile Selector & Vulnerability Matrix */}
            <ProfileSelector
              family={family}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onResetDemo={resetDemo}
              onClearDemo={clearDemo}
              onRemoveMember={removeMember}
            />

            {/* Section G: Clinical Member Advisories */}
            <MemberHealthAdvisories
              selectedMember={selectedMember}
              recommendations={recommendations}
            />

          </div>
        )}

      </main>

      {/* Add Custom Family Member Modal */}
      <FamilyMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={addMember}
      />

      {/* Slide-Over Conversational AI Assistant */}
      <EnvironmentalAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentAQI={reading}
        currentFamily={family}
      />

      {/* Section A: Application Shell Footer */}
      <Footer />

    </div>
  );
};

export default App;
