import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { OverviewView } from './views/OverviewView';
import { MalwareListView } from './views/MalwareListView';
import { MalwareDetailView } from './views/MalwareDetailView';
import { ActorsView } from './views/ActorsView';
import { CampaignsView } from './views/CampaignsView';
import { IndicatorsView } from './views/IndicatorsView';
import { AttackMatrixView } from './views/AttackMatrixView';
import { CompareView } from './views/CompareView';
import { GraphView } from './views/GraphView';
import { AnalyticsView } from './views/AnalyticsView';
import { CaseStudiesView } from './views/CaseStudiesView';
import { SchemaView } from './views/SchemaView';
import { SqlExplorerView } from './views/SqlExplorerView';
import { ResearchModeView } from './views/ResearchModeView';
import { TaxonomyView } from './views/TaxonomyView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{ status: string; database: string } | null>(null);

  useEffect(() => {
    // Health check on mount
    api.getHealth()
      .then(res => setSystemStatus(res))
      .catch(err => setSystemStatus({ status: 'degraded', database: 'error' }));

    // Global keyboard shortcut for Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (view: string, idOrSlug?: string) => {
    setCurrentView(view);
    setSelectedEntityId(idOrSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen elegant-bg text-slate-100 flex flex-col font-sans relative">
      {/* Ambient Lighting Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl" />
        <div className="absolute top-[20%] right-[-100px] w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-100px] w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={navigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Shell */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigate={navigate}
          systemStatus={systemStatus}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'overview' && (
            <OverviewView onNavigate={navigate} />
          )}

          {currentView === 'malware-list' && (
            <MalwareListView onNavigate={navigate} />
          )}

          {currentView === 'malware-detail' && selectedEntityId && (
            <MalwareDetailView
              slug={selectedEntityId}
              onBack={() => navigate('malware-list')}
              onNavigate={navigate}
            />
          )}

          {currentView === 'actors' && (
            <ActorsView initialSlug={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'campaigns' && (
            <CampaignsView initialSlug={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'ioc' && (
            <IndicatorsView initialSearch={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'attack' && (
            <AttackMatrixView initialTechId={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'compare' && (
            <CompareView initialFamilyA={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'graph' && (
            <GraphView initialFocus={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView />
          )}

          {currentView === 'case-studies' && (
            <CaseStudiesView initialSlug={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'schema' && (
            <SchemaView />
          )}

          {currentView === 'sql-explorer' && (
            <SqlExplorerView />
          )}

          {currentView === 'research-mode' && (
            <ResearchModeView initialSlug={selectedEntityId} onNavigate={navigate} />
          )}

          {currentView === 'taxonomy' && (
            <TaxonomyView onNavigate={navigate} />
          )}

          {currentView === 'knowledge-base' && (
            <KnowledgeBaseView initialTab={selectedEntityId} onNavigate={navigate} />
          )}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
}

export default App;
