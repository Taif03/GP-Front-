import { Moon, Sun, Shield, Monitor, UserCog } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export type ViewMode = 'command' | 'officer';

interface NavbarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Navbar({ view, onViewChange }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 inset-x-0 z-[1000] h-16 border-b dark:bg-command-surface/95 dark:border-command-border bg-white/95 border-slate-200 backdrop-blur-lg transition-colors duration-300">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center shadow-lg dark:shadow-emerald-900/50">
              <Shield className="text-command-cream" size={22} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-glow-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black dark:text-command-cream text-gray-900 leading-tight">مُعين</h1>
            <p className="text-[10px] dark:text-emerald-200/50 text-slate-500 leading-tight">مساعد الأمن الذكي للمسجد الحرام</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl dark:bg-command-bg/60 bg-slate-100 border dark:border-command-border border-slate-200">
          <button
            onClick={() => onViewChange('command')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              view === 'command'
                ? 'dark:bg-emerald-800 dark:text-command-cream bg-emerald-600 text-white shadow-md'
                : 'dark:text-emerald-200/50 text-slate-500 hover:dark:text-emerald-100 hover:text-slate-700'
            }`}
          >
            <Monitor size={16} />
            <span className="hidden sm:inline">لوحة القيادة</span>
            <span className="sm:hidden">القيادة</span>
          </button>
          <button
            onClick={() => onViewChange('officer')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              view === 'officer'
                ? 'dark:bg-emerald-800 dark:text-command-cream bg-emerald-600 text-white shadow-md'
                : 'dark:text-emerald-200/50 text-slate-500 hover:dark:text-emerald-100 hover:text-slate-700'
            }`}
          >
            <UserCog size={16} />
            <span className="hidden sm:inline">بوابة رجل الأمن</span>
            <span className="sm:hidden">الميداني</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 dark:bg-command-card dark:border dark:border-command-border dark:text-emerald-300 dark:hover:border-emerald-700 bg-slate-100 border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600"
          aria-label="تبديل المظهر"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}
