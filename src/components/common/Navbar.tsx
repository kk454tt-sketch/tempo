import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { eventCategories } from '@/config/categories';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Read saved bookmarks count from localStorage
  useEffect(() => {
    const updateBookmarksCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('tempo_bookmarks') || '[]');
        setSavedCount(Array.isArray(saved) ? saved.length : 0);
      } catch {
        setSavedCount(0);
      }
    };
    updateBookmarksCount();
    window.addEventListener('storage', updateBookmarksCount);
    window.addEventListener('bookmark_updated', updateBookmarksCount);
    return () => {
      window.removeEventListener('storage', updateBookmarksCount);
      window.removeEventListener('bookmark_updated', updateBookmarksCount);
    };
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/templates');
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  // Determine active category from query params
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category') || (location.pathname === '/' ? 'all' : '');
  const activePrice = searchParams.get('price');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60">
      <div className="h-28">
        {/* Top Main Navigation Bar (h-16) */}
        <div className="h-16 max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg flex items-center justify-between gap-space-md">
          {/* Brand Logo */}
          <div className="flex items-center gap-space-md shrink-0">
            <BrandLogo />
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center">
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                search
              </span>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-14 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-surface-container focus:border-on-surface focus:outline-none focus:bg-surface-container-lowest transition-all"
                placeholder="Search templates by name, style, topic..."
                type="text"
              />
              <span className="absolute right-2.5 px-1.5 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded pointer-events-none">
                ⌘K
              </span>
            </div>
          </form>

          {/* Nav Links & User Controls */}
          <div className="flex items-center gap-space-lg shrink-0">
            <nav className="hidden xl:flex items-center gap-space-md">
              <Link
                to="/templates"
                className={`px-2.5 py-1 font-label-md text-label-md transition-all rounded-lg ${
                  location.pathname === '/templates' && !activePrice
                    ? 'bg-primary-container text-on-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Explore
              </Link>
              <a
                href="/#categories"
                className="px-2.5 py-1 text-on-surface-variant font-label-md text-label-md hover:text-on-surface transition-colors"
              >
                Categories
              </a>
              <Link
                to="/templates?price=free"
                className={`px-2.5 py-1 font-label-md text-label-md transition-all rounded-lg ${
                  activePrice === 'free'
                    ? 'bg-primary-container text-on-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Free Templates
              </Link>
              <Link
                to="/templates?price=premium"
                className={`px-2.5 py-1 font-label-md text-label-md transition-all rounded-lg ${
                  activePrice === 'premium'
                    ? 'bg-primary-container text-on-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Premium
              </Link>
            </nav>

            <div className="flex items-center gap-space-sm">
              {/* Log In / Sign Up button if not authenticated */}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="inline-flex items-center px-3.5 py-1.5 bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-surface-container-high/60 hover:bg-surface-container hover:text-on-surface transition-all"
                >
                  Log In
                </Link>
              ) : (
                <Link
                  to="/create"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:bg-primary-container transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Create Site</span>
                </Link>
              )}

              {/* Saved Bookmarks Button */}
              <button
                onClick={() => setBookmarksOpen(!bookmarksOpen)}
                aria-label="Saved Templates"
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                title="Saved Bookmarks"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark</span>
                {savedCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-on-tertiary-container"></span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative group shrink-0">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-surface-container-high focus:outline-none cursor-pointer"
                  aria-label="User menu"
                >
                  {user?.avatarUrl ? (
                    <img alt={user.name || 'User Profile'} className="w-8 h-8 rounded-full object-cover" src={user.avatarUrl} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-medium text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-[0_10px_25px_-5px_rgba(9,9,11,0.08)] border border-surface-container-high/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2.5 border-b border-surface-container-high/60">
                        <p className="font-label-md text-label-md text-on-surface truncate font-semibold">
                          {user?.name || 'Creator Studio'}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {user?.email || 'studio@canvas.design'}
                        </p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-container-low hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">dashboard</span>
                        <span>My Templates</span>
                      </Link>

                      <Link
                        to="/create"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-container-low hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">add_circle</span>
                        <span>Configure & Deploy</span>
                      </Link>

                      <Link
                        to="/dashboard?tab=purchased"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-container-low hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
                        <span>Purchased</span>
                      </Link>

                      <div className="my-1 border-t border-surface-container-high/60"></div>

                      {isAuthenticated ? (
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-error font-body-sm text-body-sm hover:bg-surface-container-low transition-colors text-left cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">logout</span>
                          <span>Log out</span>
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-on-surface font-body-sm text-body-sm hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[17px]">login</span>
                          <span>Sign in / Register</span>
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Category Navigation Strip (h-12) */}
        <div className="h-12 max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg flex items-center">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full">
            {eventCategories.map((cat) => {
              const isSelected = activeCategory === cat.id || (!activeCategory && cat.id === 'all');
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'all') {
                      navigate('/templates');
                    } else {
                      navigate(`/templates?category=${cat.id}`);
                    }
                  }}
                  className={`px-3.5 py-1 rounded-full font-label-md text-label-md whitespace-nowrap transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-on-primary font-medium'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
