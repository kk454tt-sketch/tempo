import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-surface-container-high/60">
      <div className="max-w-[1440px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-lg pb-space-xl">
          {/* Col 1: Brand */}
          <div className="space-y-space-sm">
            <div className="flex items-center gap-space-sm">
              <BrandLogo />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed max-w-sm">
              The curated creative template marketplace for creators, studios, and businesses. Discover templates crafted with uncompromising detail and architectural precision.
            </p>
          </div>

          {/* Col 2: Browse */}
          <div className="space-y-space-sm">
            <p className="font-label-md text-label-md text-on-surface font-semibold">Browse</p>
            <div className="flex flex-col space-y-space-xs font-body-sm text-body-sm">
              <Link to="/templates" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Explore All
              </Link>
              <Link to="/templates?price=free" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Free Templates
              </Link>
              <Link to="/templates?price=premium" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Premium Templates
              </Link>
              <a href="/#categories" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Category Index
              </a>
              <Link to="/templates?sort=newest" className="text-on-surface-variant hover:text-on-surface transition-colors">
                New Releases
              </Link>
            </div>
          </div>

          {/* Col 3: Support & Resources */}
          <div className="space-y-space-sm">
            <p className="font-label-md text-label-md text-on-surface font-semibold">Support & Resources</p>
            <div className="flex flex-col space-y-space-xs font-body-sm text-body-sm">
              <a href="/#featured" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Curated Highlights
              </a>
              <Link to="/privacy" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Licensing Guide
              </Link>
              <Link to="/plans" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Studio Plans
              </Link>
              <Link to="/dashboard" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Creator Dashboard
              </Link>
              <Link to="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Refunds & Guarantee
              </Link>
            </div>
          </div>

          {/* Col 4: Legal & Trust */}
          <div className="space-y-space-sm">
            <p className="font-label-md text-label-md text-on-surface font-semibold">Legal & Trust</p>
            <div className="flex flex-col space-y-space-xs font-body-sm text-body-sm">
              <Link to="/privacy" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors">
                License Agreement
              </Link>
              <div className="pt-2 flex items-center gap-2 text-on-surface-variant text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
                  verified_user
                </span>
                <span>256-bit SSL Verified Architecture</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-space-md border-t border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} tempo. Inc. All rights reserved. Designed for craft and clarity.
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
            Curated Digital Artifacts
          </p>
        </div>
      </div>
    </footer>
  );
};
