import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { siteConfig } from '@/config/site';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="w-full pt-[72px] min-h-screen bg-surface flex-1">
        <div className="max-w-[800px] mx-auto px-margin md:px-margin-desktop py-space-xl flex flex-col gap-space-xl">
          {/* Page Header */}
          <div className="flex flex-col gap-space-xs pb-space-lg border-b border-surface-container">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
              Legal
            </span>
            <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface tracking-tight">
              Privacy Policy
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Last updated: September 25, {siteConfig.year}
            </p>
          </div>

          {/* Content */}
          <article className="flex flex-col gap-space-lg text-on-surface font-body-md text-body-md leading-relaxed">
            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">1. Introduction</h2>
              <p className="text-on-surface-variant">
                Welcome to Tempo ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website builder platform and related services.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">2. Information We Collect</h2>
              <p className="text-on-surface-variant">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li><strong className="text-on-surface">Account Information:</strong> Name, email address, and profile photo when you sign up using email or Google OAuth.</li>
                <li><strong className="text-on-surface">Event Website Content:</strong> Event details, photos, venue information, and RSVP data that you enter while creating event websites.</li>
                <li><strong className="text-on-surface">Usage Data:</strong> Browser type, device information, pages visited, and interaction patterns collected automatically.</li>
                <li><strong className="text-on-surface">RSVP Responses:</strong> Guest names, attendance status, meal preferences, and dietary notes submitted through your published event websites.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">3. How We Use Your Information</h2>
              <p className="text-on-surface-variant">We use the information we collect to:</p>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li>Create and manage your Tempo account</li>
                <li>Provide, maintain, and improve our website builder platform</li>
                <li>Process and deliver your event websites to your guests</li>
                <li>Collect and organize RSVP responses for your events</li>
                <li>Send you important service notifications and updates</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage trends to improve user experience</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">4. Data Storage & Security</h2>
              <p className="text-on-surface-variant">
                Your data is stored securely using Supabase infrastructure with PostgreSQL databases. We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li>Row Level Security (RLS) policies ensuring users can only access their own data</li>
                <li>Encrypted connections (HTTPS/TLS) for all data transmission</li>
                <li>OAuth 2.0 authentication through trusted providers (Google)</li>
                <li>Passwords are never stored directly — authentication is handled by Supabase Auth</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">5. Data Sharing</h2>
              <p className="text-on-surface-variant">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li><strong className="text-on-surface">Published Event Websites:</strong> When you publish an event website, the event details you chose to include become publicly accessible to anyone with the link.</li>
                <li><strong className="text-on-surface">Service Providers:</strong> We use trusted third-party services (Supabase, Google Cloud) to host and operate our platform.</li>
                <li><strong className="text-on-surface">Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal processes.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">6. Your Rights</h2>
              <p className="text-on-surface-variant">You have the right to:</p>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li>Access, update, or delete your personal information at any time through your dashboard</li>
                <li>Delete your event websites and all associated RSVP data</li>
                <li>Request a copy of all data we hold about you</li>
                <li>Withdraw consent for data processing</li>
                <li>Close your account, which will remove all your data from our systems</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">7. Cookies</h2>
              <p className="text-on-surface-variant">
                We use essential cookies to maintain your authentication session and remember your preferences. We do not use tracking cookies or third-party advertising cookies.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">8. Children's Privacy</h2>
              <p className="text-on-surface-variant">
                Tempo is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">9. Changes to This Policy</h2>
              <p className="text-on-surface-variant">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of Tempo after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">10. Contact Us</h2>
              <p className="text-on-surface-variant">
                If you have any questions about this Privacy Policy or our data practices, please reach out to us at{' '}
                <a href="mailto:privacy@tempo.events" className="text-primary hover:underline">
                  privacy@tempo.events
                </a>.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};
