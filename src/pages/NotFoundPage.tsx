import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="w-full pt-[68px] min-h-[70vh] flex flex-col items-center justify-center p-space-xl text-center flex-1">
        <span className="font-display-xl text-display-xl text-primary font-serif">404</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
          Page not found
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-md mb-space-lg">
          The page you are looking for doesn’t exist or may have been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center font-label-md bg-primary text-on-primary px-space-xl py-space-sm rounded-lg shadow-sm hover:bg-primary-container transition-colors"
        >
          Return to Homepage
        </Link>
      </main>

      <Footer />
    </div>
  );
};
