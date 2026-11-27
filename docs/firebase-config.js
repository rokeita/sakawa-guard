// Firebase web config for the Sakawa Guard demo build.
// Project: sakawa-guard (Spark plan, no billing).
// apiKey is the project's Browser key (auto created by Firebase), restricted
// to HTTP referrer https://rokeita.github.io/* and 25 Firebase APIs. The
// App Check debug-token exchange with this key was verified live (HTTP 200).
export const firebaseConfig = {
  apiKey: "AIzaSyD9_IIEbggV_68Z6-QzIam26tst1Ixa0GU",
  authDomain: "sakawa-guard.firebaseapp.com",
  projectId: "sakawa-guard",
  storageBucket: "sakawa-guard.firebasestorage.app",
  messagingSenderId: "1059695027265",
  appId: "1:1059695027265:web:f025f8c7e01bf61187d2c0"
};

// App Check debug token (registered as "sakawa-guard-live" in the console).
// The hackathon explicitly allows debug tokens in submissions; App Check is
// enforced for Firebase AI Logic, so this token lets the hosted build call the
// cloud fallback. Rotate before going to production.
export const appCheckDebugToken = "6F2C9A41-7D3E-4B8A-9C51-E2A7D40F91B3";

// reCAPTCHA Enterprise site key for production App Check (not needed for the
// demo build, which runs on the debug token above).
export const reCaptchaSiteKey = "";
