# Sakawa Guard

An on-device scam checker for Ghanaian messages, built with **Firebase AI Logic** hybrid
inference for the #BuildHybridAI 2026 hackathon (Web track).

Paste a suspicious SMS, WhatsApp message or email, and Sakawa Guard returns a verdict
(scam / suspicious / safe), the red flags it spotted, and what to do next. Checks run on
Gemini Nano **on the user's device** through the Chrome Prompt API whenever possible:
private, free, and working without data. When the device has no local model (or the request
needs more power), Firebase AI Logic seamlessly falls back to a cloud-hosted Gemini model.

## Why hybrid inference fits this problem

- Scam victims in Ghana are often on metered data or no data at all. On-device inference
  keeps the guard working offline.
- Pasted messages can contain bank details, PINs and personal notes. Local inference means
  the message never has to leave the phone.
- One code path reaches every user: `PREFER_ON_DEVICE` mode covers devices with the local
  model and falls back to the cloud for everyone else.
- The UI shows which engine ran each check (via the SDK's `inferenceSource`), so the hybrid
  behaviour is visible, not just claimed.

## Stack

- Firebase AI Logic JS SDK (`firebase/ai`), `InferenceMode.PREFER_ON_DEVICE`, loaded from
  the Firebase CDN (no build step needed)
- Cloud fallback: Gemini Flash Lite via the Gemini Developer API backend
- Structured output: a response schema returning verdict, confidence, category, red flags,
  next steps and a plain-language explanation (supported on-device)
- Firebase App Check (debug provider accepted for judging builds)
- Plain ES modules, no framework

## Run it

1. Add your Firebase web-app config to `docs/firebase-config.js` (and an App Check debug
   token from Firebase console > App Check while App Check is enforced).
2. Serve `docs/` with any static server (e.g. `npx serve docs`) in desktop Chrome 139+.
   On desktop Chrome, the on-device model can be pre-downloaded with
   `await LanguageModel.create()` in DevTools.

## Hackathon submission

- Platform: Web (Chrome), Gemini Nano via Firebase AI Logic hybrid inference
- Public repo, MIT licence
- Demo video under 3 minutes showing the app running, with the on-device and cloud
  fallback paths both visible
