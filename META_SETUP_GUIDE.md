# Meta Conversions API (CAPI) Setup Guide

This guide explains how to link your Meta Ad account to this application and ensure conversions are tracked correctly in your Meta Events Manager.

## 1. What's Already Implemented
The application is already configured to send "Server-Side" events to Meta. This is more reliable than standard browser pixels because it bypasses ad-blockers and iOS privacy restrictions.

**Tracked Events:**
- `PageView`: When a user opens the app.
- `AddToCart`: When a user selects a product.
- `InitiateCheckout`: When a user clicks "Generate My Report".
- `Purchase`: When a payment is successfully verified via Razorpay.

## 2. Setting Up in Meta Events Manager

To make the tracking work, you need to provide two pieces of information in the **Settings** menu of this app:

### A. Get your Pixel ID
1. Go to [Meta Events Manager](https://www.facebook.com/events_manager2).
2. Select your **Data Source** (Pixel).
3. Under the **Settings** tab, find your **Pixel ID** (a long string of numbers).
4. Copy this and set it as `META_PIXEL_ID` in your app settings.

### B. Generate an Access Token (CAPI)
1. In the same **Settings** tab of your Pixel, scroll down to the **Conversions API** section.
2. Click on **Generate access token** under the "Set up manually" heading.
3. Copy this token (it starts with `EA...`) and set it as `META_ACCESS_TOKEN` in your app settings.

## 3. Configuration required in .env / Settings
Set these variables in the **Settings > Environment Variables** menu:

| Variable Name | Value | Description |
|---|-|---|
| `META_PIXEL_ID` | `123456789...` | Your Facebook Pixel ID |
| `META_ACCESS_TOKEN` | `EA...` | The Conversion API Access Token you generated |

## 4. How Meta "Links" the Event to the User
Meta uses several identifiers to match the conversion to a specific person who saw your ad:
1. **Hashing (Automated):** I have programmed the server to automatically hash sensitive data (like Email or Phone) using SHA-256 before sending it to Meta. This follows Meta's privacy requirements.
2. **Cookies (_fbp / _fbc):** The server automatically extracts these Facebook cookies from the user's browser and sends them with the event.
3. **IP & User Agent:** These are also sent automatically to improve matching accuracy.

## 5. Testing the Setup
1. Go to the **Test Events** tab in Meta Events Manager.
2. In the "Test Server Events" section, you may see a `test_event_code`. 
3. (Optional) If you want to see live tests, we can temporarily add this code to the `server.ts` payload.

---

### Pro Tip for Ads
When you run your ads, make sure you select the **"Purchase"** event as your optimization goal. Meta will now "understand" who actually bought your reports and optimize your ad delivery to find more people like them.
