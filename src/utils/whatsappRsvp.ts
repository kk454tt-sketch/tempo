/**
 * Universal WhatsApp RSVP and Messaging utility for Tempo event websites.
 * Generates rich, pre-filled WhatsApp messages with full attendance & guest details.
 */

export interface WhatsAppRsvpPayload {
  eventTitle?: string;
  eventType?: string;
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
  guestName: string;
  guestMobile?: string;
  attendance?: 'yes' | 'no' | 'attending' | 'declined' | string;
  guestCount?: number | string;
  notes?: string;
  wishes?: string;
  recipientPhone?: string;
}

/**
 * Builds a comprehensive, formatted WhatsApp message pre-filled with all RSVP & event details
 */
export function buildWhatsAppRsvpMessage(payload: WhatsAppRsvpPayload): string {
  const isDeclined =
    String(payload.attendance).toLowerCase() === 'no' ||
    String(payload.attendance).toLowerCase() === 'declined' ||
    String(payload.attendance).toLowerCase() === 'unable';

  const statusText = isDeclined
    ? '❌ Regretfully unable to attend'
    : '🎉 Yes! I will be attending with pleasure';

  const eventName = payload.eventTitle || 'Your Special Celebration';

  let msg = `✨ *RSVP CONFIRMATION: ${eventName.toUpperCase()}* ✨\n`;
  msg += `─────────────────────────\n\n`;

  // Guest Details
  msg += `👤 *Guest Name:* ${payload.guestName.trim()}\n`;
  if (payload.guestMobile && payload.guestMobile.trim()) {
    msg += `📱 *Contact / WhatsApp:* ${payload.guestMobile.trim()}\n`;
  }

  // Attendance & Party Size
  msg += `📋 *Attendance:* ${statusText}\n`;
  if (!isDeclined && payload.guestCount && Number(payload.guestCount) > 0) {
    msg += `👥 *Total Guests:* ${payload.guestCount}\n`;
  }

  // Event specifics
  if (payload.date) {
    msg += `📅 *Date:* ${payload.date}${payload.time ? ` at ${payload.time}` : ''}\n`;
  }
  if (payload.venue) {
    msg += `📍 *Venue:* ${payload.venue}${payload.address ? `, ${payload.address}` : ''}\n`;
  }

  // Personal Note / Wishes
  if (payload.wishes && payload.wishes.trim()) {
    msg += `\n💌 *Heartfelt Wishes:*\n"${payload.wishes.trim()}"\n`;
  }
  if (payload.notes && payload.notes.trim()) {
    msg += `\n📝 *Dietary / Special Notes:*\n${payload.notes.trim()}\n`;
  }

  msg += `\n─────────────────────────\n`;
  msg += `🚀 *Sent via Tempo Event Website*`;

  return msg;
}

/**
 * Directly opens WhatsApp with the complete pre-filled message
 */
export function openWhatsAppWithMessage(payload: WhatsAppRsvpPayload): void {
  const message = buildWhatsAppRsvpMessage(payload);
  const encodedMessage = encodeURIComponent(message);

  const cleanPhone = (payload.recipientPhone || '').replace(/[^0-9]/g, '');

  const whatsappUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  // Try opening WhatsApp in new window / app protocol
  const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    // Popup blocked fallback: redirect directly
    window.location.href = whatsappUrl;
  }
}
