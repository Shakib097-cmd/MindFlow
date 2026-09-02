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
import { AdminPanel } from './components/admin/AdminPanel';
import { LegalLayout } from './components/legal/LegalLayout';
import { UserManualView } from './components/help/UserManualView';

import { AIGeneratorModal } from './components/modals/AIGeneratorModal';
import { MultimodalModal } from './components/modals/MultimodalModal';
import { AIAssistantDrawer } from './components/modals/AIAssistantDrawer';
import { ExportShareModal } from './components/modals/ExportShareModal';
import { PricingModal } from './components/modals/PricingModal';
import { VersionHistoryModal } from './components/modals/VersionHistoryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { QuickNotesModal } from './components/modals/QuickNotesModal';
import { CookieConsentBanner } from './components/legal/CookieConsentBanner';
import confetti from 'canvas-confetti';

const MainLayout: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    legalDocId,
    celebrationTrigger,
    openLegal,
    userManualCategory,
  } = useWorkspace();
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

  // If on user manual view, render UserManualView
  if (currentView === 'user_manual') {
    return (
      <UserManualView
        initialCategory={userManualCategory || 'getting-started'}
        onBackToApp={() => {
          if (user) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('landing');
          }
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }

  // If on legal view, render LegalLayout
  if (currentView === 'legal') {
    return (
      <LegalLayout
        initialDocId={legalDocId}
        onBackToApp={() => {
          if (user) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('landing');
          }
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }

  // If on admin view, render AdminPanel
  if (currentView === 'admin') {
    return <AdminPanel />;
  }

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
      case 'editor':
        return <MindMapCanvas />;
      case 'my-maps':
      case 'my_maps':
        return <MyMapsView />;
      case 'tasks':
        return <TasksKanbanView />;
      case 'goals':
        return <GoalsView />;
      case 'templates':
        return <TemplatesView />;
      case 'study':
      case 'study_mode':
        return <StudyModeView />;
      case 'presentation':
        return <PresentationView />;
      case 'admin':
        return <AdminPanel />;
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
      <CookieConsentBanner onNavigateToCookiePolicy={() => openLegal('cookies')} />
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
