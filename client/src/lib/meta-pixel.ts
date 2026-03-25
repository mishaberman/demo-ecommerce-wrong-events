/**
 * Meta Pixel & Conversions API — "Wrong Events" Variant
 * 
 * CONCEPT: Pixel and CAPI are structurally present and look "correct" at first glance,
 * but event names are WRONG — they fire the wrong event on the wrong page.
 * - Product page fires "AddToCart" instead of "ViewContent"
 * - Add to cart fires "ViewContent" instead of "AddToCart"
 * - Checkout fires "Lead" instead of "Purchase"
 * - Contact form fires "CompleteRegistration" instead of "Contact"
 * - Register form fires "Contact" instead of "CompleteRegistration"
 * - Lead form fires "Purchase" instead of "Lead" (inflates purchase count!)
 * - Currency inconsistency: some EUR, some USD
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = '1684145446350033';
const ACCESS_TOKEN = 'EAAEDq1LHx1gBRPAEq5cUOKS5JrrvMif65SN8ysCUrX5t0SUZB3ETInM6Pt71VHea0bowwEehinD0oZAeSmIPWivziiVu0FuEIcsmgvT3fiqZADKQDiFgKdsugONbJXELgvLuQxHT0krELKt3DPhm0EyUa44iXu8uaZBZBddgVmEnFdNMBmsWmYJdOT17DTitYKwZDZD';

function generateEventId(): string {
  return 'eid_' + crypto.randomUUID();
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}

export function setUserData(_data: { em?: string; ph?: string; fn?: string; ln?: string }) {
  // Advanced matching only captures email
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

// ============================================================
// WRONG EVENT MAPPINGS
// ============================================================

/**
 * Called on product detail page — but fires "AddToCart" instead of "ViewContent"!
 */
export function trackViewContent(productId: string, productName: string, value: number, _currency: string) {
  const eventId = generateEventId();
  // WRONG: Should be ViewContent, fires AddToCart instead
  trackPixelEvent('AddToCart', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency: 'EUR', // WRONG: Inconsistent currency — should be USD
  }, eventId);
  sendCAPIEvent('AddToCart', {
    content_ids: [productId], content_type: 'product', content_name: productName,
    value, currency: 'EUR',
  }, eventId);
}

/**
 * Called when adding to cart — but fires "ViewContent" instead of "AddToCart"!
 */
export function trackAddToCart(productId: string, productName: string, value: number, _currency: string, quantity: number) {
  const eventId = generateEventId();
  // WRONG: Should be AddToCart, fires ViewContent instead
  trackPixelEvent('ViewContent', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency: 'USD',
    num_items: quantity,
  }, eventId);
  sendCAPIEvent('ViewContent', {
    content_ids: [productId], content_type: 'product', value, currency: 'USD', num_items: quantity,
  }, eventId);
}

/**
 * Called on checkout — fires InitiateCheckout (this one is actually correct)
 */
export function trackInitiateCheckout(value: number, currency: string, numItems: number) {
  const eventId = generateEventId();
  trackPixelEvent('InitiateCheckout', {
    value,
    currency,
    num_items: numItems,
  }, eventId);
  sendCAPIEvent('InitiateCheckout', { value, currency, num_items: numItems }, eventId);
}

/**
 * Called on purchase completion — but fires "Lead" instead of "Purchase"!
 * This means actual purchases are never tracked as purchases.
 */
export function trackPurchase(value: number, _currency: string, contentIds?: string[]) {
  const eventId = generateEventId();
  // WRONG: Should be Purchase, fires Lead instead
  trackPixelEvent('Lead', {
    content_name: 'Checkout Form',
    value,
    currency: 'EUR', // WRONG: Inconsistent currency
  }, eventId);
  sendCAPIEvent('Lead', {
    content_name: 'Checkout Form', value, currency: 'EUR',
    content_ids: contentIds, // content_ids in a Lead event makes no sense
  }, eventId);
}

/**
 * Called on lead/contact form — but fires "Purchase" instead of "Lead"!
 * This INFLATES purchase count with non-purchase events.
 */
export function trackLead(formType?: string) {
  const eventId = generateEventId();
  // WRONG: Should be Lead, fires Purchase instead — inflates revenue!
  trackPixelEvent('Purchase', {
    content_name: formType || 'Contact Form',
    value: 0, // Purchase with $0 value
    currency: 'USD',
    content_type: 'product',
  }, eventId);
  sendCAPIEvent('Purchase', {
    content_name: formType || 'Contact Form', value: 0, currency: 'USD',
  }, eventId);
}

/**
 * Called on registration — but fires "Contact" instead of "CompleteRegistration"!
 */
export function trackCompleteRegistration(method?: string) {
  const eventId = generateEventId();
  // WRONG: Should be CompleteRegistration, fires Contact instead
  trackPixelEvent('Contact', {
    content_name: 'Registration Form',
    status: method || 'complete',
  }, eventId);
  sendCAPIEvent('Contact', {
    content_name: 'Registration Form', status: method || 'complete',
  }, eventId);
}

/**
 * Called on contact page — but fires "CompleteRegistration" instead of "Contact"!
 */
export function trackContact() {
  const eventId = generateEventId();
  // WRONG: Should be Contact, fires CompleteRegistration instead
  trackPixelEvent('CompleteRegistration', {
    content_name: 'Contact Page',
    value: 1.00,
    currency: 'EUR', // WRONG: Inconsistent currency
    status: 'submitted',
  }, eventId);
  sendCAPIEvent('CompleteRegistration', {
    content_name: 'Contact Page', value: 1.00, currency: 'EUR', status: 'submitted',
  }, eventId);
}

// ============================================================
// CAPI — Mirrors the wrong events (consistent but wrong)
// ============================================================

function sendCAPIEvent(eventName: string, eventData: Record<string, unknown>, eventId?: string) {
  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: window.location.href,
      user_data: {
        client_user_agent: navigator.userAgent,
        fbp: getCookie('_fbp'),
        // MISSING: fbc, fn, ln, ph, external_id
      },
      custom_data: eventData,
      data_processing_options: [],
      data_processing_options_country: 0,
      data_processing_options_state: 0,
    }],
    access_token: ACCESS_TOKEN,
  };

  const endpoint = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;
  console.log(`[CAPI] Sending ${eventName} (event may be WRONG for this page context) — payload:`, JSON.parse(JSON.stringify(payload)));
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(res => res.json()).then(result => {
    console.log(`[CAPI] ${eventName} — response:`, result);
  }).catch(err => console.error(`[CAPI] Failed:`, err));
}
