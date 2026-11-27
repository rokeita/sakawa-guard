// Firebase web config for the Sakawa Guard demo build.
// Project: sakawa-guard (Spark plan, no billing).
export const firebaseConfig = {
  apiKey: "AIzaSyDovLKo3djdRbs963vqKdbj-geRWyzMTrg",
  authDomain: "sakawa-guard.firebaseapp.com",
  projectId: "sakawa-guard",
  storageBucket: "sakawa-guard.firebasestorage.app",
  messagingSenderId: "1059695027265",
  appId: "1:1059695027265:web:f025f8c7e01bf61187d2c0"
};

// App Check debug token (registered as "sakawa-guard-pages" in the console).
// The hackathon explicitly allows debug tokens in submissions; App Check is
// enforced for Firebase AI Logic, so this token lets the hosted build call the
// cloud fallback. Rotate before going to production.
export const appCheckDebugToken = "5F9BDFED-AOCA-4ECE-86AE-F227EB711851";

// reCAPTCHA Enterprise site key for production App Check (not needed for the
// demo build, which runs on the debug token above).
export const reCaptchaSiteKey = "";
