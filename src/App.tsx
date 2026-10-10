import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar, { type ViewMode } from '@/components/Navbar';
import CommandDashboard from '@/components/dashboard/CommandDashboard';
import OfficerPortal from '@/components/officer/OfficerPortal';

function App() {
  const [view, setView] = useState<ViewMode>('command');

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen dark:bg-command-bg bg-slate-50 transition-colors duration-300">
          <Navbar view={view} onViewChange={setView} />
          <main>
            {view === 'command' ? <CommandDashboard /> : <OfficerPortal />}
          </main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
