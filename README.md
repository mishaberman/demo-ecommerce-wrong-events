# demo-ecommerce-wrong-events

## Overview
This variant demonstrates a scenario where Meta Pixel and Conversions API (CAPI) events are implemented, but the event names are swapped. For example, the code for a `ViewContent` event actually fires an `AddToCart` event, and vice-versa. This is part of a collection of demo e-commerce sites that showcase different levels of Meta Pixel and Conversions API (CAPI) implementation quality. Each variant is deployed on GitHub Pages.

**Live Site:** https://mishaberman.github.io/demo-ecommerce-wrong-events/
**Quality Grade:** F

## Meta Pixel Setup

### Base Pixel Code
- **Pixel ID:** `1684145446350033`
- **Location:** Loaded in the `<head>` tag of `index.html`.
- **Noscript Fallback:** The `<noscript>` tag is included to capture traffic from browsers with JavaScript disabled.

### Advanced Matching
- **Implementation:** Advanced Matching is partially implemented, with only the `em` (email) parameter passed in the `fbq('init', ...)` call.
- **Issues:** No other user data fields are collected or passed. The email is sent in plaintext (raw PII).

## Conversions API (CAPI) Setup

### Method
- **Method:** This variant uses a client-side direct HTTP method to send CAPI events.
- **Implementation Details:**
    - Events are sent via `fetch` requests directly to the Graph API endpoint (`https://graph.facebook.com/v13.0/PIXEL_ID/events`).
    - The `access_token` is exposed in the client-side JavaScript code.
    - Only the `em` (email) field is sent in the `user_data` object.
    - PII is not hashed; the email is sent in plaintext.
    - `data_processing_options` are not included.

## Events Tracked

| Event Name | Pixel | CAPI | Parameters Sent | event_id |
|---|---|---|---|---|
| ViewContent | Yes | Yes | Mismatched (sends AddToCart params) | Yes |
| AddToCart | Yes | Yes | Mismatched (sends ViewContent params) | Yes |
| InitiateCheckout | Yes | Yes | Mismatched | No |
| Purchase | Yes | Yes | Mismatched (sends Lead params) | Yes |
| Lead | Yes | Yes | Mismatched (sends Purchase params) | Yes |
| CompleteRegistration | Yes | Yes | Mismatched | No |
| Contact | Yes | Yes | Mismatched | No |

## Event Deduplication
- **`event_id` Generation:** An `event_id` is generated for some events.
- **Implementation:** The `event_id` is passed to both the Pixel (`eventID` option) and CAPI (`event_id` field).
- **Status:** Deduplication is broken because the event names are swapped. Even with the same `event_id`, the events do not match and are therefore not deduplicated.

## Custom Data
- **Custom Data:** No `custom_data` fields are sent with events.
- **Custom Events:** No custom events are tracked.

## Known Issues
- **Swapped Event Names:** The primary issue is that the event names are swapped in the implementation (e.g., `ViewContent` triggers an `AddToCart` event).
- **Exposed Access Token:** The CAPI `access_token` is exposed in the client-side code, which is a major security risk.
- **Raw PII:** The user's email is sent in plaintext without hashing.
- **Incomplete Advanced Matching:** Only the email is used for Advanced Matching.

## Security Considerations
- **Access Token:** The Meta CAPI access token is exposed in the client-side JavaScript, making it vulnerable to theft and misuse.
- **PII Hashing:** Personal Identifiable Information (PII) is not hashed before being sent to Meta, which is a privacy and security concern.
- **Privacy Compliance:** No data processing options (e.g., for CCPA/GDPR) are included in the CAPI payloads.

---
*This variant is part of the [Meta Pixel Quality Variants](https://github.com/mishaberman) collection for testing and educational purposes.*
