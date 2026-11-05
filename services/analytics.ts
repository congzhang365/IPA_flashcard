/** Heart-click reporting uses the site's existing Google tag and its consent settings. */
export const HEART_CLICK_EVENT = 'heart_click';
export const GOOGLE_ANALYTICS_ID = 'G-J1RX1HY0G9';

type AnalyticsWindow = Window & {
  gtag?: (command: 'event', name: string, parameters: { send_to: string }) => void;
};

export function trackHeartClick(): void {
  if (import.meta.env.DEV || typeof window === 'undefined') return;
  try {
    // Local previews and copies on other hosts must not add test hearts to GA4.
    if (window.location.hostname !== 'congzhang365.github.io') return;
    const analytics = window as AnalyticsWindow;
    if (typeof analytics.gtag === 'function') {
      analytics.gtag('event', HEART_CLICK_EVENT, { send_to: GOOGLE_ANALYTICS_ID });
    }
  } catch {
    // Analytics may be blocked; a heart must still save and animate normally.
  }
}
