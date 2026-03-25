# demo-ecommerce-wrong-events <img src="https://img.shields.io/badge/Grade-F-red" alt="Grade F" />

This e-commerce demonstration variant is designed to illustrate a critical and common implementation error: sending incorrect event names via the Conversions API (CAPI). While the Meta Pixel fires the standard, correct event names, the corresponding CAPI events are sent with non-standard names (e.g., `AddCart` instead of `AddToCart`). This completely breaks the event deduplication process, leading to inflated event counts and an inability for Meta to reconcile browser and server signals. The variant also showcases other severe issues, including sending unhashed user data, exposing the access token in client-side code, and using incorrect currency codes.

### Quick Facts

| Category | Details |
| --- | --- |
| **Pixel ID** | `1684145446350033` |
| **CAPI Method** | Client-side direct HTTP |
| **Grade** | F (Failing) |
| **Live Site URL** | [https://mishaberman.github.io/demo-ecommerce-wrong-events/](https://mishaberman.github.io/demo-ecommerce-wrong-events/) |
| **GitHub Repo** | [https://github.com/mishaberman/demo-ecommerce-wrong-events](https://github.com/mishaberman/demo-ecommerce-wrong-events) |

### What's Implemented

- `✓` Event deduplication parameter (`event_id`) is generated and sent with both Pixel and CAPI events.
- `✓` Data Processing Options (DPO) for CCPA are included in CAPI payloads.

### What's Missing or Broken

- `✗` **CRITICAL:** CAPI event names do not match standard event names (`AddCart` vs. `AddToCart`, `Checkout` vs. `InitiateCheckout`, `Buy` vs. `Purchase`).
- `✗` **CRITICAL:** The currency code is sent incorrectly as `US` instead of the ISO 4217 standard `USD`.
- `✗` **CRITICAL:** The user's email address is sent in plaintext (unhashed) in CAPI payloads, which is a major privacy and policy violation.
- `✗` **CRITICAL:** The Meta access token is exposed directly in the client-side JavaScript, posing a severe security risk.
- `✗` The `Purchase` event value is a hardcoded, incorrect amount.
- `✗` The standard `Search` event is not implemented anywhere on the site.

### Event Coverage

| Event | Pixel Fires | CAPI Fires | Notes |
| --- | :---: | :---: | --- |
| `ViewContent` | ✓ | ✓ | CAPI event name is correct. |
| `AddToCart` | ✓ | ✗ | CAPI sends as `AddCart`. |
| `InitiateCheckout` | ✓ | ✗ | CAPI sends as `Checkout`. |
| `Purchase` | ✓ | ✗ | CAPI sends as `Buy`. |
| `Lead` | ✓ | ✓ | CAPI event name is correct. |
| `CompleteRegistration` | ✓ | ✓ | CAPI event name is correct. |
| `Search` | ✗ | ✗ | Event is not implemented. |

### Parameter Completeness

This table indicates which parameters are sent with each event. Note that while parameters are sent, their values may be incorrect (e.g., `currency`).

| Event | `content_type` | `content_ids` | `value` | `currency` | `content_name` | `num_items` | `em` (unhashed) |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `ViewContent` | ✓ | ✓ | | | ✓ | | |
| `AddToCart` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `InitiateCheckout` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `Purchase` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `Lead` | | | | | | | ✓ |
| `CompleteRegistration` | | | ✓ | ✓ | | | ✓ |

### Architecture

This variant uses a purely client-side architecture. All tracking logic is contained within the browser.

1.  **Meta Pixel:** The standard `fbevents.js` library is loaded and fires events as the user navigates the site and takes actions.
2.  **Conversions API (CAPI):** Immediately after a Pixel event is fired, a corresponding CAPI event is sent via a direct HTTP POST request from the user's browser to the Graph API endpoint (`graph.facebook.com`). This is **not** a recommended architecture, as it requires exposing the access token on the client.

The fundamental flaw is that the JavaScript function responsible for sending CAPI events uses incorrect event names, preventing Meta from matching them to the correct Pixel events for deduplication.

### How to Use This Variant

To observe the broken implementation:

1.  Navigate to the [live site](https://mishaberman.github.io/demo-ecommerce-wrong-events/).
2.  Open your browser's Developer Tools and go to the **Network** tab.
3.  Filter for requests containing `facebook.com/tr/` to see the Pixel events.
4.  Add an item to the cart. You will see a correctly named `AddToCart` Pixel event.
5.  Now, filter for `graph.facebook.com` to see the CAPI requests.
6.  Observe the payload for the corresponding CAPI event. You will see that the `event_name` is `AddCart`, the `currency` is `US`, and the `em` (email) field contains an unhashed email address. You can also find the exposed `access_token` in the page source.
