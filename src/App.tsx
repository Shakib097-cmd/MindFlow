import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { MindMapCanvas } from './components/canvas/MindMapCanvas';
import { DashboardView } from './components/dashboard/DashboardView';
import { MyMapsView } from './components/views/MyMapsView';
import { TasksKanbanView } from './components/views/TasksKanbanView';
import { GoalsView } from './components/views/GoalsView';
import { TemplatesView } from './components/views/TemplatesView';
import { StudyModeView } from './components/views/StudyModeView';
import { PresentationView } from './components/views/PresentationView';
import { LandingView } from './components/views/LandingView';

import { AIGeneratorModal } from './components/modals/AIGeneratorModal';
import { MultimodalModal } from './components/modals/MultimodalModal';
import { AIAssistantDrawer } from './components/modals/AIAssistantDrawer';
import { ExportShareModal } from './components/modals/ExportShareModal';
import { PricingModal } from './components/modals/PricingModal';
import { VersionHistoryModal } from './components/modals/VersionHistoryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { QuickNotesModal } from './components/modals/QuickNotesModal';
import confetti from 'canvas-confetti';

const MainLayout: React.FC = () => {
  const { currentView, celebrationTrigger } = useWorkspace();
  const { user } = useAuth();

  // Fire confetti whenever celebration is triggered
  useEffect(() => {
    if (celebrationTrigger > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b'],
      });
    }
  }, [celebrationTrigger]);

  // If on landing view and user isn't logged in, show landing
  if (currentView === 'landing') {
    return <LandingView />;
  }

  // Render view
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'canvas':
        return <MindMapCanvas />;
      case 'my-maps':
        return <MyMapsView />;
      case 'tasks':
        return <TasksKanbanView />;
      case 'goals':
        return <GoalsView />;
      case 'templates':
        return <TemplatesView />;
      case 'study':
        return <StudyModeView />;
      case 'presentation':
        return <PresentationView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />

        {/* Dynamic Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AIGeneratorModal />
      <MultimodalModal />
      <AIAssistantDrawer />
      <ExportShareModal />
      <PricingModal />
      <VersionHistoryModal />
      <SettingsModal />
      <QuickNotesModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <MainLayout />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
