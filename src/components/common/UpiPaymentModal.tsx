import React, { useState } from 'react';
import { unlockService } from '@/services/unlockService';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

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
  templateName = 'Stitch Keepsake Birthday Invitation',
  priceLabel = '₹499',
  priceAmount = 499,
  userId,
}) => {
  const { user, refreshSubscription } = useAuth();
  const effectiveUserId = userId || user?.id;

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const upiId = '9979370684@fam';
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    'Tempo Templates'
  )}&am=${priceAmount}&cu=INR&tn=${encodeURIComponent(`Unlock ${templateName}`)}`;

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // clipboard error fallback
    }
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveUserId) {
      setErrorMessage('Please sign in to your Tempo account first so your premium subscription is bound to your profile.');
      return;
    }

    if (!transactionRef.trim() || transactionRef.trim().length < 4) {
      setErrorMessage('Please enter your 12-digit UPI UTR or bank transaction reference number.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Server-side payment verification (Phases 8 & 9)
      const res = await unlockService.verifyPaymentAndUnlock(
        transactionRef.trim(),
        templateId,
        priceAmount
      );

      if (res.success && res.isPremiumActive) {
        setSuccessMessage('Payment verified! 1-Month Premium Access is now active on your account.');
        await refreshSubscription();
        setTimeout(() => {
          setIsVerifying(false);
          onSuccess();
        }, 1500);
      } else {
        throw new Error(res.message || 'Payment verification failed.');
      }
    } catch (err: unknown) {
      setIsVerifying(false);
      setErrorMessage((err as Error).message || 'Payment could not be verified. Please check the UTR reference number.');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Payment Card */}
      <div className="relative w-full max-w-md bg-[#2b1f1d] text-[#F8E7E4] rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#C97B84]/40 flex flex-col animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#382926] flex items-center justify-between border-b border-[#C97B84]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#C97B84]/20 border border-[#C97B84]/40 flex items-center justify-center text-lg">
              👑
            </span>
            <div>
              <h3 className="font-serif text-lg font-bold text-white leading-tight">
                Unlock 1-Month Premium
              </h3>
              <p className="text-xs text-[#EBC1C6]/80 truncate max-w-[240px]">
                {templateName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-[#F8E7E4] flex items-center justify-center transition-colors cursor-pointer text-sm font-semibold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col items-center text-center">
          
          {/* Auth warning if not signed in */}
          {!effectiveUserId && (
            <div className="w-full mb-3.5 p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs text-left flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <div>
                <strong className="block text-white font-medium">Account sign-in required</strong>
                Please sign in so your 1-month premium subscription is stored in the database.
                <div className="mt-2">
                  <Link
                    to="/login"
                    className="inline-block px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-bold text-xs"
                  >
                    Sign In Now →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Price badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C97B84]/25 border border-[#C97B84]/40 text-[#FBF1DC] text-sm font-medium mb-3">
            <span>1-Month Access:</span>
            <span className="text-white font-bold text-base">{priceLabel}</span>
            <span className="text-[10px] uppercase tracking-wider text-[#EBC1C6] font-mono">Verified License</span>
          </div>

          {/* QR Code Container */}
          <div className="relative bg-white p-3 rounded-xl shadow-lg border-2 border-[#C97B84]/50 mb-3 max-w-[210px] w-full aspect-square flex items-center justify-center overflow-hidden">
            <img
              src="/upi-payment.gif"
              alt={`Scan UPI QR Code to Pay ${priceLabel}`}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent py-1 text-[10px] text-white font-mono opacity-90">
              Scan with Any UPI App
            </div>
          </div>

          {/* UPI ID & Copy */}
          <div className="w-full bg-[#382926] px-3 py-2 rounded-lg border border-white/10 flex items-center justify-between mb-3 text-xs">
            <div className="text-left">
              <span className="text-[10px] uppercase text-[#EBC1C6]/70 block font-mono">UPI Merchant ID</span>
              <span className="font-mono text-[#FBF1DC] font-semibold tracking-wide">{upiId}</span>
            </div>
            <button
              onClick={handleCopyUpi}
              className="px-2.5 py-1 rounded bg-[#C97B84]/30 hover:bg-[#C97B84]/50 text-[#FBF1DC] transition-colors font-medium text-xs flex items-center gap-1 cursor-pointer"
            >
              {copiedUpi ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          {/* Direct Pay Link for mobile devices */}
          <a
            href={upiIntentUri}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C97B84] to-[#C9A25D] hover:opacity-95 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 mb-3 cursor-pointer"
          >
            <span>⚡ Open UPI App (GPay / PhonePe / Paytm)</span>
          </a>

          {/* Server-Side Verification Form */}
          <form onSubmit={handleVerifyPayment} className="w-full mt-2 pt-3 border-t border-white/10 text-left">
            <label className="block text-xs font-semibold text-white mb-1.5">
              Enter 12-digit UPI UTR / Transaction Reference:
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. 428198273641 or UPI Ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                disabled={isVerifying}
                className="flex-1 bg-black/40 border border-[#C97B84]/40 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C97B84]"
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isVerifying ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Payment</span>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 text-xs mb-2">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs mb-2 font-medium">
                ✓ {successMessage}
              </div>
            )}
          </form>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-[#201615] border-t border-white/5 text-center text-[10px] text-[#EBC1C6]/60 font-mono shrink-0">
          Payment is verified server-side in the database • Activates 1-Month Premium
        </div>
      </div>
    </div>
  );
};
