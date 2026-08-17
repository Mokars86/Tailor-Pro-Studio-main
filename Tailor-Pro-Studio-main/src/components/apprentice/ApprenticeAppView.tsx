import React, { useState } from 'react';
import { Client, RunwayStage, GarmentMeasurements, ApprenticeTask, Apprentice } from '../../types';

import { ApprenticeHeader } from './ApprenticeHeader';
import { ApprenticeBottomNav, ApprenticeTab } from './ApprenticeBottomNav';

import { ApprenticeProductionTab } from './tabs/ApprenticeProductionTab';
import { ApprenticePortfolioTab } from './tabs/ApprenticePortfolioTab';
import { ApprenticeMilestonesTab } from './tabs/ApprenticeMilestonesTab';

import { ApprenticeSettingsModal } from './modals/ApprenticeSettingsModal';
import { ClientMeasurementPickerModal } from './modals/ClientMeasurementPickerModal';
import { CadSpecModal } from './modals/CadSpecModal';

interface ApprenticeAppViewProps {
  clients: Client[];
  apprentices?: Apprentice[];
  tasks?: ApprenticeTask[];
  studioName?: string;
  masterName?: string;
  studioLogoUrl?: string;
  workshopCode?: string;
  onSyncNewWorkshopCode?: (newCode: string) => void;
  apprenticeName?: string;
  onUpdateApprenticeName?: (newName: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: (newTheme: 'light' | 'dark') => void;
  onAdvanceStage: (clientId: string, newStage: RunwayStage) => void;
  onOpenMeasurementsForClient: (client: Client) => void;
  onOpenAddNewClient: () => void;
  onSwitchRoleToMaster: () => void;
  onLogout: () => void;
  onCompleteTask?: (taskId: string) => void;
}

export const ApprenticeAppView: React.FC<ApprenticeAppViewProps> = ({
  clients,
  apprentices = [],
  tasks = [],
  studioName = 'TAILOR PRO STUDIO',
  masterName = 'Master Trainer',
  studioLogoUrl,
  workshopCode,
  onSyncNewWorkshopCode,
  apprenticeName = 'Apprentice Trainee',
  onUpdateApprenticeName,
  theme,
  onToggleTheme,
  onAdvanceStage,
  onOpenMeasurementsForClient,
  onOpenAddNewClient,
  onSwitchRoleToMaster,
  onLogout,
  onCompleteTask
}) => {
  const [activeTab, setActiveTab] = useState<ApprenticeTab>('production');

  // Find active linked apprentice record or fall back
  const activeApprenticeRecord = apprentices.find((a) => a.isLinked || (apprenticeName && a.name.toLowerCase() === apprenticeName.toLowerCase())) || apprentices[0];
  const resolvedApprenticeName = activeApprenticeRecord?.name || apprenticeName || 'Apprentice Trainee';

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTakeTapePickerOpen, setIsTakeTapePickerOpen] = useState(false);
  const [cadSpecClient, setCadSpecClient] = useState<Client | null>(null);

  const handleTriggerTakeTape = () => {
    setIsTakeTapePickerOpen(true);
  };

  return (
    <div className={`min-h-screen md:pl-64 pb-36 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#061e1b] text-slate-100' : 'bg-[#EBF5F0] text-[#0D3B36]'
    }`}>
      {/* Persistent Global Apprentice Header */}
      <ApprenticeHeader
        clients={clients}
        masterName={masterName}
        studioName={studioName}
        studioLogoUrl={studioLogoUrl}
        workshopCode={workshopCode}
        theme={theme}
        onToggleTheme={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTakeTape={handleTriggerTakeTape}
        onSwitchRoleToMaster={onSwitchRoleToMaster}
      />

      {/* Main Dynamic View Area */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-52 sm:pt-48 md:pt-48">
        {/* TAB 1: PRODUCTION */}
        {activeTab === 'production' && (
          <ApprenticeProductionTab
            clients={clients}
            tasks={tasks}
            onAdvanceStage={onAdvanceStage}
            onViewCadSpec={(client) => setCadSpecClient(client)}
            onCompleteTask={onCompleteTask}
            onOpenTakeTape={handleTriggerTakeTape}
          />
        )}

        {/* TAB 2: TAKE TAPE (If tab is selected, also trigger measurement picker) */}
        {activeTab === 'take_tape' && (
          <ApprenticeProductionTab
            clients={clients}
            tasks={tasks}
            onAdvanceStage={onAdvanceStage}
            onViewCadSpec={(client) => setCadSpecClient(client)}
            onCompleteTask={onCompleteTask}
          />
        )}

        {/* TAB 3: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <ApprenticePortfolioTab
            apprenticeName={resolvedApprenticeName}
            onUpdateApprenticeName={onUpdateApprenticeName}
            masterName={masterName}
            studioName={studioName}
            clients={clients}
            tasks={tasks}
          />
        )}

        {/* TAB 4: MILESTONES */}
        {activeTab === 'milestones' && (
          <ApprenticeMilestonesTab
            apprenticeName={resolvedApprenticeName}
            masterName={masterName}
            studioName={studioName}
            studioLogoUrl={studioLogoUrl}
            apprentice={activeApprenticeRecord}
          />
        )}
      </main>

      {/* Persistent Bottom Tab Bar (Mobile) & Side Navigation Sidebar (Desktop) */}
      <ApprenticeBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTriggerTakeTape={handleTriggerTakeTape}
        studioName={studioName}
        masterName={masterName}
        workshopCode={workshopCode}
        studioLogoUrl={studioLogoUrl}
      />

      {/* MODAL 1.1: Settings Modal */}
      <ApprenticeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
        masterName={masterName}
        studioName={studioName}
        currentWorkshopCode={workshopCode}
        onSyncNewWorkshopCode={onSyncNewWorkshopCode}
        onSwitchRoleToMaster={onSwitchRoleToMaster}
        onLogout={onLogout}
      />

      {/* MODAL 1.2: Client Measurement Selection Sheet */}
      <ClientMeasurementPickerModal
        isOpen={isTakeTapePickerOpen}
        onClose={() => setIsTakeTapePickerOpen(false)}
        clients={clients}
        onSelectClientForTape={(client) => {
          setIsTakeTapePickerOpen(false);
          onOpenMeasurementsForClient(client);
        }}
        onOpenAddNewClient={onOpenAddNewClient}
      />

      {/* CAD Specification Modal */}
      <CadSpecModal
        client={cadSpecClient}
        onClose={() => setCadSpecClient(null)}
      />
    </div>
  );
};
