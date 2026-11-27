// Firebase web config for the Sakawa Guard demo build.
// NOTE: This is a hackathon demo. The web API key is public by design (Firebase
// web keys are identifiers, not secrets); safety comes from App Check.
// cloud fallback. Rotate before going to production.
export const firebaseConfig = {
  apiKey: "AIzaSyDovLKo3djdRbs963vqKdbj-geRWyzMTrg",
  authDomain: "sakawa-guard.firebaseapp.com",
  projectId: "sakawa-guard",
  storageBucket: "sakawa-guard.firebasestorage.app",
  messagingSenderId: "1059695027265",
  appId: "1:1059695027265:web:f025f8c7e01bf61187d2c0"
};

// App Check debug token for local/dev testing of the GitHub Pages build.
// Registered in the Firebase console under the name "sakawa-guard-live".
// Safe to ship for the demo; the hackathon explicitly allows debug tokens.
// Rotate before going to production.
export const appCheckDebugToken = "6F2C9A41-7D3E-4B8A-9C51-E2A7D40F91B3";

// reCAPTCHA Enterprise site key (left empty for the demo build).
export const reCaptchaSiteKey = "";
