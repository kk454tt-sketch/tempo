import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTemplates } from '@/templates/registry';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/eventService';
import { TemplateMetadata } from '@/types/template';
import { EventWebsite } from '@/types';

interface SearchResult {
  id: string;
  type: 'template' | 'website';
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  image?: string;
}

interface SearchBarProps {
  /** Compact mode hides the input on mobile and shows only an icon toggle */
  compact?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ compact = false, className = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [userWebsites, setUserWebsites] = useState<EventWebsite[]>([]);
  const [websitesLoaded, setWebsitesLoaded] = useState(false);

  // Load user websites once when authenticated
  useEffect(() => {
    const loadWebsites = async () => {
      if (isAuthenticated && user?.id && !websitesLoaded) {
        try {
          const sites = await eventService.getUserWebsites(user.id);
          setUserWebsites(sites);
        } catch {
          // Silently fail — search still works for templates
        }
        setWebsitesLoaded(true);
      }
    };
    loadWebsites();
  }, [isAuthenticated, user?.id, websitesLoaded]);

  // Reset loaded state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setUserWebsites([]);
      setWebsitesLoaded(false);
    }
  }, [isAuthenticated]);

  // Perform search
  const performSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim().toLowerCase();
      if (!trimmed) {
        setResults([]);
        return;
      }

      const matched: SearchResult[] = [];

      // Search templates
      const allTemplates: TemplateMetadata[] = getAllTemplates();
      for (const tpl of allTemplates) {
        const searchable = `${tpl.name} ${tpl.categoryLabel} ${tpl.description} ${tpl.subtitle || ''} ${tpl.badge || ''}`.toLowerCase();
        if (searchable.includes(trimmed)) {
          matched.push({
            id: tpl.id,
            type: 'template',
            title: tpl.name,
            subtitle: tpl.categoryLabel,
            icon: 'palette',
            href: `/templates/${tpl.id}`,
            image: tpl.previewImage,
          });
        }
      }

      // Search user websites
      if (isAuthenticated) {
        for (const site of userWebsites) {
          const searchable = `${site.title} ${site.eventType} ${site.slug}`.toLowerCase();
          if (searchable.includes(trimmed)) {
            matched.push({
              id: site.id,
              type: 'website',
              title: site.title,
              subtitle: `${site.eventType} · ${site.status === 'published' ? 'Live' : 'Draft'}`,
              icon: site.status === 'published' ? 'public' : 'edit_document',
              href: `/dashboard/websites/${site.id}/edit`,
            });
          }
        }
      }

      setResults(matched.slice(0, 8));
    },
    [isAuthenticated, userWebsites],
  );

  useEffect(() => {
    performSearch(query);
    setActiveIndex(-1);
  }, [query, performSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setMobileExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setMobileExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setMobileExpanded(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Keyboard navigation inside results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      navigateToResult(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setMobileExpanded(false);
      inputRef.current?.blur();
    }
  };

  const navigateToResult = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    setMobileExpanded(false);
    navigate(result.href);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleMobileToggle = () => {
    setMobileExpanded((prev) => !prev);
    if (!mobileExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Template category icons
  const categoryIcon = (categoryLabel: string): string => {
    const map: Record<string, string> = {
      Wedding: 'favorite',
      Birthday: 'cake',
      Opening: 'storefront',
      'Dinner Party': 'wine_bar',
      Party: 'celebration',
      Anniversary: 'workspace_premium',
      Graduation: 'school',
    };
    return map[categoryLabel] || 'event';
  };

  const showResults = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Compact mobile: icon-only toggle */}
      {compact && (
        <button
          onClick={handleMobileToggle}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
          title="Search (Ctrl+K)"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
        </button>
      )}

      {/* Input bar */}
      <div
        className={`${
          compact
            ? `${mobileExpanded ? 'flex' : 'hidden'} md:flex absolute md:relative right-0 top-full md:top-auto mt-2 md:mt-0 w-[calc(100vw-32px)] md:w-auto z-50 md:z-auto`
            : 'flex'
        } items-center`}
      >
        <div className="relative w-full md:w-72 lg:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search templates & sites..."
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm pl-9 pr-16 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30"
            aria-label="Search"
            aria-expanded={showResults}
            aria-haspopup="listbox"
            role="combobox"
            autoComplete="off"
          />
          {/* Keyboard shortcut badge */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5">
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-0.5 rounded hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px] text-outline">close</span>
              </button>
            ) : (
              <kbd className="px-1.5 py-0.5 bg-surface-container rounded text-[10px] font-mono text-on-surface-variant/60 border border-outline-variant/30">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div
          className={`absolute ${
            compact ? 'right-0 md:left-0' : 'left-0'
          } top-full mt-1.5 w-[calc(100vw-32px)] md:w-[420px] bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container z-50 overflow-hidden`}
          role="listbox"
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <span className="material-symbols-outlined text-[32px] text-outline/50 mb-2 block">search_off</span>
              <p className="font-body-sm text-on-surface-variant">
                No results for "<strong className="text-on-surface">{query}</strong>"
              </p>
              <p className="font-caption text-caption text-on-surface-variant/60 mt-1">
                Try searching for "wedding", "birthday", or a template name
              </p>
            </div>
          ) : (
            <>
              {/* Group: Templates */}
              {results.some((r) => r.type === 'template') && (
                <div>
                  <div className="px-3 pt-2.5 pb-1">
                    <span className="font-label-sm text-[11px] text-on-surface-variant/60 uppercase tracking-widest">
                      Templates
                    </span>
                  </div>
                  {results
                    .filter((r) => r.type === 'template')
                    .map((result) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={() => navigateToResult(result)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                            activeIndex === globalIdx
                              ? 'bg-primary/8'
                              : 'hover:bg-surface-container'
                          }`}
                          role="option"
                          aria-selected={activeIndex === globalIdx}
                          type="button"
                        >
                          {result.image ? (
                            <img
                              src={result.image}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-[18px] text-primary">
                                {categoryIcon(result.subtitle)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-body-sm text-on-surface truncate font-medium">
                              {highlightMatch(result.title, query)}
                            </p>
                            <p className="font-caption text-[11px] text-on-surface-variant truncate">
                              {result.subtitle} template
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-[16px] text-outline/40 flex-shrink-0">
                            arrow_forward
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Group: Your Websites */}
              {results.some((r) => r.type === 'website') && (
                <div>
                  <div className={`px-3 pt-2.5 pb-1 ${results.some((r) => r.type === 'template') ? 'border-t border-surface-container' : ''}`}>
                    <span className="font-label-sm text-[11px] text-on-surface-variant/60 uppercase tracking-widest">
                      Your Websites
                    </span>
                  </div>
                  {results
                    .filter((r) => r.type === 'website')
                    .map((result) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={() => navigateToResult(result)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                            activeIndex === globalIdx
                              ? 'bg-primary/8'
                              : 'hover:bg-surface-container'
                          }`}
                          role="option"
                          aria-selected={activeIndex === globalIdx}
                          type="button"
                        >
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[18px] text-secondary">
                              {result.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body-sm text-on-surface truncate font-medium">
                              {highlightMatch(result.title, query)}
                            </p>
                            <p className="font-caption text-[11px] text-on-surface-variant truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-[16px] text-outline/40 flex-shrink-0">
                            arrow_forward
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Footer hint */}
              <div className="px-3 py-2 border-t border-surface-container flex items-center justify-between">
                <span className="font-caption text-[11px] text-on-surface-variant/50">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
                <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant/40">
                  <kbd className="px-1 py-px bg-surface-container rounded text-[10px] font-mono border border-outline-variant/20">↑↓</kbd>
                  <span className="text-[10px]">navigate</span>
                  <kbd className="px-1 py-px bg-surface-container rounded text-[10px] font-mono border border-outline-variant/20 ml-1">↵</kbd>
                  <span className="text-[10px]">select</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/** Highlight the matching substring within text */
function highlightMatch(text: string, query: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
