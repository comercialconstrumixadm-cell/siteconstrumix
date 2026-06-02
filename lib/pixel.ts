export const PIXEL_ID = '2159826514800552';

declare global {
  interface Window {
    fbq: (
      action: 'track' | 'trackCustom' | 'init',
      event: string,
      params?: Record<string, string>
    ) => void;
    _fbq: unknown;
  }
}

function fbq(...args: Parameters<Window['fbq']>) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq(...args);
}

export function pixelPageView() {
  fbq('track', 'PageView');
}

export function pixelContact() {
  fbq('track', 'Contact');
}

export function pixelLead() {
  fbq('track', 'Lead');
}

export function pixelButtonClick(
  buttonText: string,
  section: string,
  destination: string
) {
  fbq('trackCustom', 'ButtonClick', {
    button_text: buttonText,
    section,
    destination,
  });
}
