/**
 * Timezone used to group analytics by day (the "clicks over time" chart and every range total).
 * Override with ANALYTICS_TZ in .env.local, for example ANALYTICS_TZ=America/Sao_Paulo.
 * Must be a valid IANA timezone name.
 */
export const ANALYTICS_TZ: string = process.env.ANALYTICS_TZ || "Asia/Kolkata";
