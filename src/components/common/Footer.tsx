import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { siteConfig } from '@/config/site';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_0_rgba(0,0,0,0.03)] mt-space-xl">
      <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop items-start pb-space-xl">
          <div className="md:col-span-5 flex flex-col gap-space-sm">
            <BrandLogo showTagline={false} />
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-space-xs">
              Websites for your moments. Keepsake-grade digital invitations, living archives, and milestone commemorations.
            </p>
          </div>

          <div className="md:col-span-7 flex flex-wrap justify-between md:justify-end gap-gutter-desktop">
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface tracking-wider uppercase">
                Platform
              </span>
              <Link
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                to="/templates"
              >
                Templates
              </Link>
              <a
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                href="/#how-it-works"
              >
                How it works
              </a>
              <Link
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                to="/create"
              >
                Create a site
              </Link>
            </div>

            <div className="flex flex-col gap-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface tracking-wider uppercase">
                Support &amp; Trust
              </span>
              <a
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                href="#help"
              >
                Help Center
              </a>
              <Link
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                to="/privacy"
              >
                Privacy Policy
              </Link>
              <Link
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                to="/terms"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant/70 font-body-sm text-body-sm border-t border-surface-container">
          <p>© {siteConfig.year} Tempo. All rights reserved.</p>
          <p className="font-caption text-caption text-on-surface-variant/60">
            Designed with mindful craft for personal memories.
          </p>
        </div>
      </div>
    </footer>
  );
};
