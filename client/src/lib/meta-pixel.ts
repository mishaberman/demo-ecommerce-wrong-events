/**
 * Meta Pixel & Conversions API — FIXED "Wrong Events" Variant
 */
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = '1684145446350033';

function generateEventId(): string {
  return 'eid_' + crypto.randomUUID();
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}

export function setUserData(_data: { em?: string; ph?: string; fn?: string; ln?: string }) {
  if (typeof window !== 'undefined' && window.fbq && _data.em) {
    window.fbq('init', PIXEL_ID, { em: _data.em });
  }
}

function trackPixelEvent(eventName: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    const options = eventId ? { eventID: eventId } : undefined;
    if (options) {
      window.fbq('track', eventName, params, options);
    } else {
      window.fbq('track', eventName, params);
    }
    console.log(`[Meta Pixel] Tracked: ${eventName}`, params);
  }
}

// CORRECTED EVENT MAPPINGS

export function trackViewContent(productId: string, productName: string, value: number, currency: string) {
  const eventId = generateEventId();
  trackPixelEvent('ViewContent', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency,
  }, eventId);
  sendCAPIEvent('ViewContent', {
    content_ids: [productId], content_type: 'product', content_name: productName,
    value, currency,
  }, eventId);
}

export function trackAddToCart(productId: string, productName: string, value: number, currency: string, quantity: number) {
  const eventId = generateEventId();
  trackPixelEvent('AddToCart', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency,
    num_items: quantity,
  }, eventId);
  sendCAPIEvent('AddToCart', {
    content_ids: [productId], content_type: 'product', value, currency, num_items: quantity,
  }, eventId);
}

export function trackInitiateCheckout(value: number, currency: string, numItems: number) {
  const eventId = generateEventId();
  trackPixelEvent('InitiateCheckout', {
    value,
    currency,
    num_items: numItems,
  }, eventId);
  sendCAPIEvent('InitiateCheckout', { value, currency, num_items: numItems }, eventId);
}

export function trackPurchase(value: number, currency: string, contentIds?: string[]) {
  const eventId = generateEventId();
  trackPixelEvent('Purchase', {
    value,
    currency,
    content_ids: contentIds,
  }, eventId);
  sendCAPIEvent('Purchase', {
    value, currency, content_ids: contentIds,
  }, eventId);
}

export function trackLead(formType?: string) {
  const eventId = generateEventId();
  trackPixelEvent('Lead', {
    content_name: formType || 'Contact Form',
  }, eventId);
  sendCAPIEvent('Lead', {
    content_name: formType || 'Contact Form',
  }, eventId);
}

export function trackCompleteRegistration(method?: string) {
  const eventId = generateEventId();
  trackPixelEvent('CompleteRegistration', {
    status: method || 'complete',
  }, eventId);
  sendCAPIEvent('CompleteRegistration', {
    status: method || 'complete',
  }, eventId);
}

export function trackContact() {
  const eventId = generateEventId();
  trackPixelEvent('Contact', {}, eventId);
  sendCAPIEvent('Contact', {}, eventId);
}

// CAPI implementation now sends events to the server-side endpoint
function sendCAPIEvent(eventName: string, eventData: Record<string, unknown>, eventId?: string) {
  fetch('/api/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, eventData, eventId, userData: {} }), // Pass userData if available
  }).catch(err => console.error(`[CAPI] Failed:`, err));
}
