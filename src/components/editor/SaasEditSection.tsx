import React, { useState } from 'react';
import { EventPhoto, SaasData, SaasFeatureItem, SaasPricingTier } from '@/types';
import { CategoryPhotoUploader } from './CategoryPhotoUploader';

interface SaasEditSectionProps {
  title: string;
  tagline: string;
  note: string;
  venue: string;
  address: string;
  date: string;
  photos: EventPhoto[];
  saasData?: SaasData;
  onChangeTitle: (title: string) => void;
  onChangeTagline: (tagline: string) => void;
  onChangeNote: (note: string) => void;
  onChangeVenue: (venue: string) => void;
  onChangeAddress: (address: string) => void;
  onChangeDate: (date: string) => void;
  onChangePhotos: (photos: EventPhoto[]) => void;
  onChangeSaasData: (data: SaasData) => void;
  onToast: (msg: string) => void;
}

export const SaasEditSection: React.FC<SaasEditSectionProps> = ({
  title,
  tagline,
  note,
  venue,
  address,
  date,
  photos,
  saasData,
  onChangeTitle,
  onChangeTagline,
  onChangeNote,
  onChangeVenue,
  onChangeAddress,
  onChangeDate,
  onChangePhotos,
  onChangeSaasData,
  onToast,
}) => {
  const [tab, setTab] = useState<'product' | 'features' | 'media' | 'pricing'>('product');

  const features: SaasFeatureItem[] = saasData?.features && saasData.features.length > 0
    ? saasData.features
    : [
        {
          id: 'feat-1',
          title: 'Sub-Millisecond Edge Routing',
          desc: 'Global anycast mesh routing traffic to the closest low-latency edge node in 280+ regions.',
          icon: 'bolt',
        },
        {
          id: 'feat-2',
          title: 'Zero-Config Autonomous Scaling',
          desc: 'Instant compute bursting from 0 to 100k requests/sec without cold starts or provisioning delays.',
          icon: 'speed',
        },
        {
          id: 'feat-3',
          title: 'Cryptographic Security & Isolation',
          desc: 'Full hardware enclave isolation with hardware-accelerated TLS 1.3 termination and DDoS mitigation.',
          icon: 'security',
        },
      ];

  const pricing: SaasPricingTier[] = saasData?.pricing && saasData.pricing.length > 0
    ? saasData.pricing
    : [
        {
          id: 'price-1',
          tier: 'Developer',
          price: '$0',
          frequency: '/ mo',
          features: ['100,000 monthly requests', '3 edge deployment zones', 'Community support'],
          highlighted: false,
        },
        {
          id: 'price-2',
          tier: 'Pro Team',
          price: '$49',
          frequency: '/ mo',
          features: ['5,000,000 monthly requests', 'All 280+ edge regions', '24/7 SLA & real-time telemetry'],
          highlighted: true,
        },
      ];

  const updateSaasField = <K extends keyof SaasData>(field: K, value: SaasData[K]) => {
    const updated: SaasData = {
      features,
      pricing,
      ...saasData,
      [field]: value,
    };
    onChangeSaasData(updated);
  };

  const handleAddFeature = () => {
    const newFeat: SaasFeatureItem = {
      id: `feat-${Date.now()}`,
      title: 'New Powerful Feature',
      desc: 'Seamlessly optimize performance with built-in analytics and developer APIs.',
      icon: 'auto_awesome',
    };
    const updated = [...features, newFeat];
    updateSaasField('features', updated);
    onToast('Added feature highlight');
  };

  const handleUpdateFeature = (id: string, field: keyof SaasFeatureItem, val: string) => {
    const updated = features.map((f) => (f.id === id ? { ...f, [field]: val } : f));
    updateSaasField('features', updated);
  };

  const handleRemoveFeature = (id: string) => {
    const updated = features.filter((f) => f.id !== id);
    updateSaasField('features', updated);
    onToast('Removed feature');
  };

  const handleAddPricingTier = () => {
    const newTier: SaasPricingTier = {
      id: `tier-${Date.now()}`,
      tier: 'Enterprise',
      price: '$199',
      frequency: '/ mo',
      features: ['Unlimited monthly requests', 'Dedicated infrastructure', 'Custom SLA'],
      highlighted: false,
    };
    const updated = [...pricing, newTier];
    updateSaasField('pricing', updated);
    onToast('Added pricing tier');
  };

  const handleUpdatePricing = (id: string, field: keyof SaasPricingTier, val: unknown) => {
    const updated = pricing.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    updateSaasField('pricing', updated);
  };

  const handleRemovePricing = (id: string) => {
    const updated = pricing.filter((p) => p.id !== id);
    updateSaasField('pricing', updated);
    onToast('Removed pricing tier');
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container-high/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setTab('product')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'product' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          1. Product &amp; Headline
        </button>
        <button
          type="button"
          onClick={() => setTab('features')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'features' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          2. Features Bento ({features.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('media')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'media' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          3. Imagery &amp; Mockups
        </button>
        <button
          type="button"
          onClick={() => setTab('pricing')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'pricing' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          4. Pricing &amp; CTA
        </button>
      </div>

      {/* TAB 1: Product & Headline */}
      {tab === 'product' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">rocket_launch</span>
              <span>Product Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onChangeTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Vertex Cloud"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Value Proposition Headline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => onChangeTagline(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Edge computing optimized for mission-critical engineering teams"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Product Description / Elevator Pitch</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => onChangeNote(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                placeholder="e.g. Next-generation low-latency compute at the edge with zero-configuration deployments."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Release Version / Badge</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => onChangeDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. v3.2 Available"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Company / Team HQ</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => onChangeVenue(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. San Francisco HQ & Distributed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Infrastructure Location / Region</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => onChangeAddress(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Global Anycast Edge Network"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Features Bento */}
      {tab === 'features' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">view_quilt</span>
                  <span>Feature Highlights &amp; Bento</span>
                </h2>
                <p className="text-xs text-gray-500">Highlight product capabilities, performance metrics, and integrations.</p>
              </div>

              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Feature</span>
              </button>
            </div>

            <div className="space-y-3">
              {features.map((feat, idx) => (
                <div
                  key={feat.id || idx}
                  className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary font-mono uppercase">
                      Feature 0{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feat.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Title</label>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => handleUpdateFeature(feat.id, 'title', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs font-semibold"
                        placeholder="Feature Title"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Icon Name</label>
                      <input
                        type="text"
                        value={feat.icon || 'bolt'}
                        onChange={(e) => handleUpdateFeature(feat.id, 'icon', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs font-mono"
                        placeholder="e.g. bolt, speed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      value={feat.desc}
                      onChange={(e) => handleUpdateFeature(feat.id, 'desc', e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-surface-container-high text-xs"
                      placeholder="Brief benefit description..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Media */}
      {tab === 'media' && (
        <CategoryPhotoUploader
          category="saas"
          photos={photos}
          onChangePhotos={onChangePhotos}
          onToast={onToast}
          title="Product UI Mockups &amp; Dashboard Scans"
          subtitle="Display sleek analytics dashboards, terminal command lines, and product interfaces."
        />
      )}

      {/* TAB 4: Pricing & CTA */}
      {tab === 'pricing' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">touch_app</span>
              <span>Call to Action Button</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Button Text</label>
                <input
                  type="text"
                  value={saasData?.ctaText || 'Get Started Free'}
                  onChange={(e) => updateSaasField('ctaText', e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Get Started Free or Join Waitlist"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Destination URL</label>
                <input
                  type="url"
                  value={saasData?.ctaLink || '#pricing'}
                  onChange={(e) => updateSaasField('ctaLink', e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. https://app.yourproduct.com/signup"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                  <span>Pricing Tiers</span>
                </h2>
                <p className="text-xs text-gray-500">Configurable plans with feature lists and highlights.</p>
              </div>

              <button
                type="button"
                onClick={handleAddPricingTier}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Tier</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pricing.map((tier, idx) => (
                <div
                  key={tier.id || idx}
                  className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={tier.tier}
                      onChange={(e) => handleUpdatePricing(tier.id, 'tier', e.target.value)}
                      className="font-bold text-xs bg-white px-2 py-1 rounded border border-surface-container-high w-32"
                      placeholder="Tier Name"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePricing(tier.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tier.price}
                      onChange={(e) => handleUpdatePricing(tier.id, 'price', e.target.value)}
                      className="font-mono font-bold text-xs bg-white px-2 py-1 rounded border border-surface-container-high w-20"
                      placeholder="$49"
                    />
                    <input
                      type="text"
                      value={tier.frequency || '/ mo'}
                      onChange={(e) => handleUpdatePricing(tier.id, 'frequency', e.target.value)}
                      className="text-xs bg-white px-2 py-1 rounded border border-surface-container-high w-16"
                      placeholder="/ mo"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">
                      Bullet Features (comma separated)
                    </label>
                    <textarea
                      rows={2}
                      value={tier.features.join(', ')}
                      onChange={(e) =>
                        handleUpdatePricing(
                          tier.id,
                          'features',
                          e.target.value.split(',').map((f) => f.trim()).filter(Boolean)
                        )
                      }
                      className="w-full p-2 rounded-lg bg-white border border-surface-container-high text-xs"
                      placeholder="Feature 1, Feature 2, Feature 3"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
