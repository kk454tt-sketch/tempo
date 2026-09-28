import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { siteConfig } from '@/config/site';

export const TermsOfServicePage: React.FC = () => {
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
              Terms of Service
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Last updated: September 25, {siteConfig.year}
            </p>
          </div>

          {/* Content */}
          <article className="flex flex-col gap-space-lg text-on-surface font-body-md text-body-md leading-relaxed">
            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">1. Acceptance of Terms</h2>
              <p className="text-on-surface-variant">
                By accessing or using Tempo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, users, and others who access or use Tempo.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">2. Description of Service</h2>
              <p className="text-on-surface-variant">
                Tempo is a web-based platform that allows users to create beautiful, keepsake-grade event websites for occasions including weddings, birthdays, parties, anniversaries, openings, graduations, and other celebrations. The Service includes website creation tools, template designs, RSVP management, and public event page hosting.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">3. User Accounts</h2>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for safeguarding your account credentials and for all activity under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>You may sign up using email/password or Google OAuth. We do not store your passwords directly.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">4. User Content</h2>
              <p className="text-on-surface-variant">
                You retain ownership of all content you create on Tempo, including event details, photos, and text. By publishing an event website, you grant Tempo a non-exclusive license to host, display, and distribute that content publicly as necessary to deliver the Service.
              </p>
              <p className="text-on-surface-variant">You agree not to upload or publish content that:</p>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains unlawful, harmful, threatening, or defamatory material</li>
                <li>Violates the privacy rights of any third party</li>
                <li>Contains malicious code, spam, or misleading information</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">5. Acceptable Use</h2>
              <p className="text-on-surface-variant">You agree to use Tempo only for lawful purposes. You may not:</p>
              <ul className="list-disc pl-6 flex flex-col gap-space-xs text-on-surface-variant">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to other users' accounts or data</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Use automated tools to scrape, crawl, or extract data from the Service</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">6. Intellectual Property</h2>
              <p className="text-on-surface-variant">
                The Tempo platform, including its design, templates, code, logos, and branding, is owned by Tempo and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without prior written permission.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">7. Service Availability</h2>
              <p className="text-on-surface-variant">
                We strive to keep Tempo available at all times, but we do not guarantee uninterrupted access. We may temporarily suspend the Service for maintenance, updates, or circumstances beyond our control. We will make reasonable efforts to provide advance notice of planned downtime.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">8. Termination</h2>
              <p className="text-on-surface-variant">
                We reserve the right to suspend or terminate your account at any time if you violate these Terms. You may delete your account at any time through your dashboard settings. Upon termination, your event websites will be unpublished and your data will be deleted in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">9. Limitation of Liability</h2>
              <p className="text-on-surface-variant">
                To the maximum extent permitted by law, Tempo shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you have paid to Tempo in the twelve months preceding the claim.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">10. Changes to Terms</h2>
              <p className="text-on-surface-variant">
                We may revise these Terms at any time by updating this page. Material changes will be communicated through the Service or via email. Your continued use of Tempo after changes take effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="flex flex-col gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">11. Contact Us</h2>
              <p className="text-on-surface-variant">
                If you have questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@tempo.events" className="text-primary hover:underline">
                  legal@tempo.events
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
