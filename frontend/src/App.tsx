import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AQIGaugeHero } from './components/dashboard/AQIGaugeHero';
import { PollutantGrid } from './components/dashboard/PollutantGrid';
import { HourlyForecastTimeline } from './components/dashboard/HourlyForecastTimeline';
import { OptimalWindowCard } from './components/dashboard/OptimalWindowCard';
import { IndoorProtocolCard } from './components/dashboard/IndoorProtocolCard';
import { CohortRecommendationsGrid } from './components/dashboard/CohortRecommendationsGrid';
import { SustainableLivingSection } from './components/sustainability/SustainableLivingSection';
import { ProfileSelector } from './components/family/ProfileSelector';
import { MemberHealthAdvisories } from './components/family/MemberHealthAdvisories';
import { FamilyMemberModal } from './components/family/FamilyMemberModal';
import { EnvironmentalAssistant } from './components/chat/EnvironmentalAssistant';
import { useAQI } from './hooks/useAQI';
import { useFamilyProfiles } from './hooks/useFamilyProfiles';
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

  return (
    <div className="min-h-screen flex flex-col bg-[#070D1E] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Navigation */}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Offline notification banner */}
        {isOffline && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Offline Mode: Working with locally cached atmospheric telemetry. Reconnecting automatically when internet returns.</span>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconnect
            </button>
          </div>
        )}

        {/* Stale data notification banner */}
        {isStale && !isOffline && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-200 flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Displaying cached atmospheric telemetry. Reconnecting to live sensor providers in background.</span>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !reading && (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-white">Streaming Atmospheric Telemetry</h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to Open-Meteo &amp; synthesizing Indian CPCB / EPA environmental intelligence...</p>
          </div>
        )}

        {/* Active Environmental Intelligence Dashboard */}
        {reading && (
          <div className="space-y-6">
            
            {/* 1. Hero AQI Gauge Card with Multi-Standard Selector */}
            <AQIGaugeHero
              reading={reading}
              recommendations={recommendations}
              standard={standard}
              onSelectStandard={setStandard}
            />

            {/* 2. Optimal Clean Air & Peak Windows */}
            <OptimalWindowCard forecast={forecast} />

            {/* 3. Atmospheric Pollutants Matrix */}
            <PollutantGrid pollutants={reading.pollutants} />

            {/* 4. 24-Hour & 48-Hour Forecast Curve */}
            <HourlyForecastTimeline
              forecast={forecast}
              standard={standard}
              forecastHours={forecastHours}
              onSelectHours={setForecastHours}
            />

            {/* 5. Indoor Clean Haven Protocol */}
            <IndoorProtocolCard protocol={recommendations?.indoor_protocol} />

            {/* 6. Target Cohort Clinical Directives */}
            <CohortRecommendationsGrid cohorts={recommendations?.cohort_recommendations} />

            {/* 7. Sustainable Living & Green Commuting Calculator */}
            <SustainableLivingSection currentAQI={reading.aqi_us} />

            {/* 8. Family Profile Selector */}
            <ProfileSelector
              family={family}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onResetDemo={resetDemo}
              onClearDemo={clearDemo}
              onRemoveMember={removeMember}
            />

            {/* 9. Clinical Member Advisories */}
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

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default App;
