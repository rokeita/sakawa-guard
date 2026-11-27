import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app-check.js";
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode, Schema } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-ai.js";
import { firebaseConfig, appCheckDebugToken, reCaptchaSiteKey } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);

const GUARD_BRIEF =
  "You are Sakawa Guard, a scam-detection assistant for people in Ghana. You analyse SMS, " +
  "WhatsApp and email messages for fraud such as mobile-money (MoMo) fraud, fake promotions " +
  "and raffles, phishing links, fake job or investment offers, and impersonation of banks, " +
  "telecom networks (MTN, Telecel, AirtelTigo) or government bodies. Judge messages against " +
  "common Ghanaian fraud patterns, but stay fair: do not label a message a scam without " +
  "concrete warning signs. Ordinary personal or business communication is safe even when it " +
  "mentions mobile money, so give the safe verdict whenever no concrete warning sign is " +
  "present, and keep its confidence moderate. Reply only with the structured fields.";

const SAMPLES = [
  "Congratulations! Your MTN MoMo number has won GHS 5,000 in the MTN anniversary promo. Send a GHS 50 activation fee to 0551234567 to claim your reward. Call 0244123456 now before it expires.",
  "Your account will be blocked in 24 hours. Click https://gh-bank-secure-login.com/update to verify your PIN and mobile money details immediately.",
  "Hi Ama, I have sent the GHS 200 for the fabrics. The MoMo receipt is on my WhatsApp status. Thank you!"
];

const verdictSchema = Schema.object({
  properties: {
    verdict: Schema.string({ enum: ["scam", "suspicious", "safe"] }),
    confidence: Schema.number(),
    category: Schema.string(),
    red_flags: Schema.array({ items: Schema.string() }),
    what_to_do: Schema.array({ items: Schema.string() }),
    plain_explanation: Schema.string()
  },
  required: ["verdict", "confidence", "category", "red_flags", "what_to_do", "plain_explanation"]
});

const VERDICTS = {
  scam: { label: "Likely scam", cls: "bad" },
  suspicious: { label: "Suspicious", cls: "warn" },
  safe: { label: "Looks safe", cls: "ok" }
};

let app = null;
let model = null;

function configured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

function ensureFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    try {
      if (appCheckDebugToken) self.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken;
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(reCaptchaSiteKey || "debug-placeholder"),
        isTokenAutoRefreshEnabled: false
      });
    } catch (err) {
      console.warn("App Check not initialized:", err);
    }
  }
  return app;
}

function ensureModel() {
  if (!model) {
    const ai = getAI(ensureFirebase(), { backend: new GoogleAIBackend() });
    model = getGenerativeModel(ai, {
      mode: InferenceMode.PREFER_ON_DEVICE,
      inCloudParams: {
        model: "gemini-3.5-flash-lite",
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: verdictSchema
        }
      },
      onDeviceParams: { createOptions: { temperature: 0.2 } }
    });
  }
  return model;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value == null ? "" : value);
  return div.innerHTML;
}

async function deviceModelStatus() {
  try {
    if (typeof LanguageModel !== "undefined" && LanguageModel.availability) {
      return await LanguageModel.availability();
    }
  } catch (err) {
    /* the on-device model is desktop-Chrome only */
  }
  return null;
}

function show(data, source) {
  const verdict = VERDICTS[data.verdict] || VERDICTS.suspicious;
  $("verdict").textContent = verdict.label;
  $("verdict").className = "badge " + verdict.cls;
  $("confidence").textContent = Math.round((Number(data.confidence) || 0) * 100) + "% confidence";
  $("category").textContent = data.category ? "Category: " + data.category : "";
  $("flags").innerHTML = (data.red_flags || []).map((f) => "<li>" + escapeHtml(f) + "</li>").join("");
  $("advice").innerHTML = (data.what_to_do || []).map((f) => "<li>" + escapeHtml(f) + "</li>").join("");
  $("explain").textContent = data.plain_explanation || "";
  if (source === "IN_CLOUD") {
    $("source").textContent = "Checked in the cloud (Gemini fallback), because this device has no local model or it was offline.";
  } else {
    $("source").textContent = "Checked on this device (Gemini Nano). Private, free, and works without data.";
  }
  $("result").classList.remove("hidden");
}

function parseVerdict(text) {
  const raw = String(text || "").trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1].trim() : raw;
  try {
    return JSON.parse(body);
  } catch (err) {
    /* fall through to brace extraction */
  }
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start !== -1 && end > start) return JSON.parse(body.slice(start, end + 1));
  throw new Error("no JSON in model reply");
}

async function analyze() {
  const text = $("message").value.trim();
  const statusEl = $("status");
  if (text.length < 10) {
    statusEl.textContent = "Paste a message first (at least a few words).";
    return;
  }
  $("analyze").disabled = true;
  statusEl.textContent = "Checking the message...";
  $("result").classList.add("hidden");
  try {
    const result = await ensureModel().generateContent(
      GUARD_BRIEF + "\n\nMessage to check:\n\"\"\"\n" + text + "\n\"\"\""
    );
    let data;
    try {
      data = parseVerdict(result.response.text());
    } catch (parseErr) {
      statusEl.textContent = "The model replied in plain text this time. Try again.";
      return;
    }
    let source = "";
    try {
      if (result.response.inferenceSource) source = String(result.response.inferenceSource);
    } catch (srcErr) {
      /* older SDK */
    }
    if (source.indexOf("CLOUD") !== -1) {
      show(data, "IN_CLOUD");
    } else if (source.indexOf("DEVICE") !== -1) {
      show(data, "ON_DEVICE");
    } else {
      const localStatus = await deviceModelStatus();
      show(data, localStatus === "available" ? "ON_DEVICE" : "IN_CLOUD");
    }
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "Something went wrong: " + ((err && err.message) || err);
  } finally {
    $("analyze").disabled = false;
  }
}

function init() {
  if (!configured()) {
    $("setup").classList.remove("hidden");
    $("analyze").disabled = true;
  } else {
    $("setup").classList.add("hidden");
  }
  document.querySelectorAll("button.sample").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("message").value = SAMPLES[Number(btn.dataset.i)] || "";
    });
  });
  $("analyze").addEventListener("click", analyze);
  const demoParam = new URLSearchParams(self.location.search).get("demo");
  if (demoParam) {
    const idx = Number(demoParam) - 1;
    $("message").value = SAMPLES[idx] || SAMPLES[0];
    setTimeout(analyze, 600);
  }
  deviceModelStatus().then((status) => {
    if (status === "available") $("devicestate").textContent = "Local model: ready on this browser.";
    else if (status === "downloading" || status === "downloadable") $("devicestate").textContent = "Local model: available to download on this browser.";
    else $("devicestate").textContent = "Local model: not detected on this browser, checks will use the cloud fallback.";
  });
}

init();
