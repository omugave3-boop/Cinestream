import React, { useState, useEffect } from 'react';
import { Film, Search, Shield, Tv, Menu, X, Bookmark, LogOut, User as UserIcon, Download } from 'lucide-react';
import { AppView, User } from '../types';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onWatchlist: () => void;
  showingWatchlist: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  currentUser,
  onLogout,
  onWatchlist,
  showingWatchlist,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setCanInstall(false);
      setInstallPrompt(null);
    }
  };

  const initial = currentUser?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => onViewChange(currentView === 'admin' ? 'admin' : 'user')}
          >
            <Film className="text-primary" size={28} />
            <span className="text-xl font-bold tracking-tight">
              Cine<span className="text-primary">Stream</span>
            </span>
            {currentView === 'admin' && (
              <span className="badge badge-secondary badge-sm ml-1">Admin</span>
            )}
          </div>

          {/* Search - user view only */}
          {currentView === 'user' && (
            <div className="hidden sm:block flex-1 max-w-md">
              <label className="input input-bordered input-sm flex items-center gap-2 bg-base-200 border-base-content/10">
                <Search className="h-[1em] opacity-50" />
                <input
                  type="search"
                  className="grow"
                  placeholder="Search movies, genres..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </label>
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-2">
            {canInstall && (
              <button
                className="btn btn-sm btn-primary gap-2"
                onClick={handleInstall}
              >
                <Download size={16} /> Install App
              </button>
            )}
            {currentView === 'user' && (
              <button
                className={`btn btn-sm ${showingWatchlist ? 'btn-primary' : 'btn-ghost'}`}
                onClick={onWatchlist}
              >
                <Bookmark size={16} /> My List
              </button>
            )}
            {currentUser?.role === 'admin' && currentView === 'user' && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => onViewChange('admin')}
              >
                <Shield size={16} /> Admin
              </button>
            )}
            {currentView === 'admin' && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => onViewChange('user')}
              >
                <Tv size={16} /> Browse
              </button>
            )}

            {/* User avatar dropdown */}
            <div className="relative">
              <button
                className="btn btn-sm btn-circle bg-primary text-primary-content border-0"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {initial}
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-base-200 shadow-xl border border-base-content/10 z-50">
                    <div className="p-3 border-b border-base-content/10">
                      <p className="font-semibold text-sm">{currentUser?.username}</p>
                      <p className="text-xs text-base-content/50">{currentUser?.email}</p>
                      <span className="badge badge-sm mt-1">{currentUser?.role}</span>
                    </div>
                    <div className="p-1">
                      <button
                        className="btn btn-ghost btn-sm w-full justify-start gap-2 text-error"
                        onClick={() => { setShowUserMenu(false); onLogout(); }}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            className="btn btn-ghost btn-sm sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 space-y-2">
            {currentView === 'user' && (
              <label className="input input-bordered input-sm flex items-center gap-2 bg-base-200 border-base-content/10">
                <Search className="h-[1em] opacity-50" />
                <input
                  type="search"
                  className="grow"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              {canInstall && (
                <button className="btn btn-sm btn-primary flex-1" onClick={() => { handleInstall(); setMobileMenuOpen(false); }}>
                  <Download size={16} /> Install
                </button>
              )}
              {currentView === 'user' && (
                <button className="btn btn-sm btn-ghost flex-1" onClick={() => { onWatchlist(); setMobileMenuOpen(false); }}>
                  <Bookmark size={16} /> My List
                </button>
              )}
              {currentUser?.role === 'admin' && currentView !== 'admin' && (
                <button className="btn btn-sm btn-ghost flex-1" onClick={() => { onViewChange('admin'); setMobileMenuOpen(false); }}>
                  <Shield size={16} /> Admin
                </button>
              )}
              {currentView === 'admin' && (
                <button className="btn btn-sm btn-ghost flex-1" onClick={() => { onViewChange('user'); setMobileMenuOpen(false); }}>
                  <Tv size={16} /> Browse
                </button>
              )}
              <button className="btn btn-sm btn-error btn-ghost flex-1" onClick={onLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-base-content/10">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-content">
                {initial}
              </div>
              <div>
                <p className="text-sm font-medium">{currentUser?.username}</p>
                <p className="text-xs text-base-content/50">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
