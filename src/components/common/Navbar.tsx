import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { SearchBar } from './SearchBar';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(44,44,40,0.04)] border-b border-surface-container">
      <div className="h-[72px] max-w-[1280px] mx-auto px-margin md:px-margin-desktop flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-lg">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-space-lg ml-space-md">
            <Link
              to="/templates"
              className={`font-body-md text-body-md transition-colors ${
                location.pathname === '/templates'
                  ? 'text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Templates
            </Link>
            <a
              href="/#how-it-works"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              How it works
            </a>
          </nav>
        </div>

        {/* Global Search */}
        <SearchBar compact className="flex-shrink-0" />

        <div className="flex items-center gap-space-md">
          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                className="hidden sm:inline-flex items-center justify-center font-label-md text-label-md bg-primary-container text-on-primary hover:bg-primary transition-colors px-space-lg py-2 rounded-lg shadow-sm tracking-wide"
              >
                Create a site
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
                  title={user?.name || 'User Account'}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-outline-variant"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm shadow-sm">
                      {user?.name?.slice(0, 2).toUpperCase() || 'TP'}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl py-space-xs z-30 font-body-sm border border-surface-container">
                      <div className="px-space-md py-2 border-b border-surface-container">
                        <p className="font-semibold text-on-surface truncate">{user?.name}</p>
                        <p className="text-[12px] text-on-surface-variant truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-space-md py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        My Websites
                      </Link>
                      <Link
                        to="/create"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-space-md py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface transition-colors sm:hidden"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Create a site
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-space-md py-2 text-left hover:bg-surface-container flex items-center gap-2 text-error transition-colors cursor-pointer border-t border-surface-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center justify-center font-label-md text-label-md bg-primary-container text-on-primary hover:bg-primary transition-colors px-space-lg py-2 rounded-lg shadow-sm tracking-wide"
              >
                Create a site
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
