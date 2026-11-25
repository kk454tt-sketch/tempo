import React, { useState } from 'react';
import { unlockService } from '@/services/unlockService';
import { useAuth } from '@/context/AuthContext';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateId: string;
  templateName?: string;
  priceLabel?: string;
  priceAmount?: number;
  userId?: string;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  templateId,
  templateName = 'Royal Heritage Wax Envelope Soirée',
  priceLabel = '₹99',
  priceAmount = 99,
  userId,
}) => {
  const { user, refreshSubscription } = useAuth();
  const effectiveUserId = userId || user?.id;

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  if (!isOpen) return null;

  const upiId = '9979370684@fam';
  const cleanAmount = priceAmount || 99;
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    'Tempo Templates'
  )}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(`Unlock 1-Month ${templateName}`)}`;

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePayAndUnlock = async () => {
    setIsProcessing(true);
    setUnlockedSuccess(true);

    try {
      // 1. Instantly unlock the template for 1 month (30 days) locally and in DB
      await unlockService.grantOneMonthAccess(templateId, cleanAmount, effectiveUserId);
      if (refreshSubscription) {
        refreshSubscription().catch(() => {});
      }
    } catch (err) {
      console.warn('Unlock error:', err);
    }

    // 2. Open user's UPI app via direct intent
    window.location.href = upiIntentUri;

    // 3. Complete unlock flow on the site
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Payment Card Box (Redesigned from stitch_payment_panel_redesign) */}
      <main
        className="w-full max-w-lg mx-auto relative z-10"
        data-purpose="payment-modal-container"
      >
        <section className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-neutral-200/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden transition-all text-neutral-900">
          
          {/* Header */}
          <header
            className="p-6 md:px-8 pt-7 pb-5 flex items-center justify-between border-b border-neutral-100"
            data-purpose="modal-header"
          >
            <div className="flex items-center space-x-3.5">
              {/* Crown Premium Icon Badge */}
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md shadow-neutral-900/10 shrink-0">
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 text-amber-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 leading-tight">
                  Unlock 1-Month Premium
                </h1>
                <p className="text-xs text-neutral-500 tracking-wide mt-0.5 truncate max-w-[280px]">
                  {templateName}
                </p>
              </div>
            </div>

            {/* Dismiss / Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-500 transition-colors duration-200 border border-neutral-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-900"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </header>

          {/* Body */}
          <div className="p-6 md:px-8 space-y-5">

            {/* Plan Pricing & Badge Pill */}
            <div
              className="flex items-center justify-between px-5 py-3 rounded-full bg-neutral-50 border border-neutral-200/80"
              data-purpose="pricing-pill"
            >
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xs uppercase font-medium tracking-wider text-neutral-500">
                  1-Month Access:
                </span>
                <span className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  {priceLabel || `₹${cleanAmount}`}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2.5 py-1 rounded-full shadow-xs">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  />
                </svg>
                Verified License
              </span>
            </div>

            {/* UPI Brand & Official Logo Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-50 via-slate-50 to-neutral-50 border border-neutral-200/90 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2.5">
                {/* Official UPI Dual Chevron Logo */}
                <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-xs gap-2">
                  <svg
                    className="h-6 w-auto"
                    viewBox="0 0 120 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Orange Top Chevron */}
                    <path d="M12 8L24 20L12 32H20L32 20L20 8H12Z" fill="#F47920" />
                    {/* Green Bottom Chevron */}
                    <path d="M26 8L38 20L26 32H34L46 20L34 8H26Z" fill="#0F8043" />
                    {/* UPI Typography */}
                    <text
                      x="52"
                      y="26"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontWeight="900"
                      fontSize="20"
                      letterSpacing="1"
                      fill="#1E293B"
                    >
                      UPI
                    </text>
                  </svg>
                  <span className="text-[11px] font-semibold text-neutral-600 border-l border-neutral-200 pl-2">
                    Instant Direct Pay
                  </span>
                </div>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-neutral-500 mt-1">
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200/60 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> GPay
                </span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200/60 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" /> PhonePe
                </span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200/60 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Paytm
                </span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200/60 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Any UPI
                </span>
              </div>
            </div>

            {/* Merchant ID & Quick Copy Box */}
            <div
              className="flex items-center justify-between p-3.5 px-4 rounded-xl bg-neutral-50 border border-neutral-200 group hover:border-neutral-300 transition"
              data-purpose="merchant-id-box"
            >
              <div className="space-y-0.5 text-left">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  UPI MERCHANT ID
                </span>
                <span className="font-mono text-sm font-semibold text-neutral-900 tracking-tight">
                  {upiId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 rounded-lg shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
              >
                {copiedUpi ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Primary Action Button: Direct Pay & 1-Month Instant Unlock */}
            <div className="space-y-3" data-purpose="action-group">
              <button
                type="button"
                onClick={handlePayAndUnlock}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-neutral-900 text-white hover:bg-black active:bg-neutral-800 font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-neutral-900/10 transition-all duration-200 cursor-pointer hover:shadow-neutral-900/20 hover:-translate-y-0.5 disabled:opacity-75"
              >
                {/* UPI Lightning / Sparkle Icon */}
                <svg className="w-4 h-4 fill-amber-300" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>
                  {unlockedSuccess
                    ? '🎉 Unlocked! Redirecting to UPI...'
                    : `Pay ${priceLabel || `₹${cleanAmount}`} & Open UPI App`}
                </span>
              </button>

              {/* Status Indicator */}
              <div
                className="flex items-center justify-center space-x-2 text-xs text-neutral-600"
                data-purpose="status-listener"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-medium text-neutral-600">
                  {unlockedSuccess
                    ? '1-Month access active for this website'
                    : 'Unlocks 1-month access instantly upon payment'}
                </span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <footer
            className="p-4 px-6 bg-neutral-50/70 border-t border-neutral-100 text-center"
            data-purpose="modal-footer"
          >
            <p className="text-[11px] text-neutral-500 font-normal tracking-tight">
              Verified 1-Month License • Access valid for 30 days from activation
            </p>
          </footer>

        </section>
      </main>
    </div>
  );
};
