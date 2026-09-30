import { handlePaymentRequest } from '../../server/paymentRoutes.js';

export const config = { maxDuration: 60 };

export default function paymentInboxCron(req, res) {
  return handlePaymentRequest(req, res);
}
