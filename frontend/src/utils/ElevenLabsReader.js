// utils/ElevenLabsReader.js

// Prefer env key if available, otherwise fall back to manual key
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "YOUR_API_KEY";

// Voice options — swap VOICE_ID to change the narrator
// Rachel (calm, expressive): 21m00Tcm4TlvDq8ikWAM
// Clyde (warm, deep):        2EiwWnXFnvU5JabPnv8n
// Bella (soft, emotive):     EXAVITQu4vr4xnSDxMaL
// Adam (neutral, clear):     pNInz6obpgDQGcFmaJgB
const VOICE_ID =
  import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

const MODEL_ID =
  import.meta.env.VITE_ELEVENLABS_MODEL_ID || "eleven_turbo_v2";

let currentAudio = null;
let currentObjectUrl = null;
let isPlaying = false;
let abortPlayback = false;

const cleanText = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const hasValidApiKey = () =>
  !!API_KEY && API_KEY !== "YOUR_API_KEY" && API_KEY.length > 10;

// ──────────────────────────────────────────
// Stop any playing audio immediately
// ──────────────────────────────────────────
export const stopAudio = () => {
  abortPlayback = true;
  isPlaying = false;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
    } catch {}
    currentAudio = null;
  }

  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch {}
    currentObjectUrl = null;
  }
};

// ──────────────────────────────────────────
// Split text into more natural chunks
// Keeps larger chunks for smoother prosody
// ──────────────────────────────────────────
const chunkText = (text, maxLength = 1400) => {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const naturalBreaks =
    cleaned.match(
      /[^.!?]+[.!?]+(?:\s|$)|[^,;:]+[,;:](?:\s|$)|[^.!?,;:]+$/g
    ) || [cleaned];

  const chunks = [];
  let current = "";

  for (const piece of naturalBreaks) {
    const part = piece.trim();
    if (!part) continue;

    if (part.length > maxLength) {
      const words = part.split(" ");
      let buffer = "";

      for (const word of words) {
        const next = `${buffer} ${word}`.trim();

        if (next.length > maxLength && buffer) {
          if (current) {
            chunks.push(current);
            current = "";
          }
          chunks.push(buffer);
          buffer = word;
        } else {
          buffer = next;
        }
      }

      if (buffer) {
        if (current) {
          chunks.push(current);
          current = "";
        }
        chunks.push(buffer);
      }

      continue;
    }

    const next = `${current} ${part}`.trim();

    if (next.length > maxLength && current) {
      chunks.push(current);
      current = part;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
};

// ──────────────────────────────────────────
// Fetch audio blob from ElevenLabs API
// ──────────────────────────────────────────
const fetchSpeechBlob = async (text) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.28,
          similarity_boost: 0.72,
          style: 0.18,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
  }

  return response.blob();
};

// ──────────────────────────────────────────
// Play an audio blob
// Resolves when playback ends
// ──────────────────────────────────────────
const playBlob = (blob) =>
  new Promise((resolve, reject) => {
    if (abortPlayback) {
      resolve();
      return;
    }

    currentObjectUrl = URL.createObjectURL(blob);
    const audio = new Audio(currentObjectUrl);
    audio.preload = "auto";
    audio.playbackRate = 1.0;

    currentAudio = audio;

    audio.onended = () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
      }
      currentAudio = null;
      resolve();
    };

    audio.onerror = () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
      }
      currentAudio = null;
      reject(new Error("Audio playback error"));
    };

    audio.play().catch(reject);
  });

// ──────────────────────────────────────────
// Main TTS function
// @param text      text to speak
// @param onFinish  callback({ completed: boolean })
// ──────────────────────────────────────────
export const speakText = async (text, onFinish) => {
  const cleaned = cleanText(text);

  if (!hasValidApiKey()) {
    console.warn(
      "⚠️ ElevenLabs API key not set. Add VITE_ELEVENLABS_API_KEY or replace YOUR_API_KEY."
    );
    onFinish?.({ completed: false });
    return;
  }

  if (!cleaned) {
    console.warn("⚠️ No text to speak");
    onFinish?.({ completed: false });
    return;
  }

  stopAudio();
  abortPlayback = false;
  isPlaying = true;

  const chunks = chunkText(cleaned, 1400);
  console.log(`📖 Speaking ${chunks.length} chunk(s), ~${cleaned.length} chars`);

  try {
    // Pre-fetch first 2 chunks for quicker startup
    const blobCache = new Array(chunks.length);
    const initialPrefetch = chunks.slice(0, 2).map((chunk) => fetchSpeechBlob(chunk));
    const initialResults = await Promise.allSettled(initialPrefetch);

    initialResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        blobCache[index] = result.value;
      }
    });

    for (let i = 0; i < chunks.length; i++) {
      if (abortPlayback) break;

      let blob = blobCache[i];

      if (!blob) {
        blob = await fetchSpeechBlob(chunks[i]);
        blobCache[i] = blob;
      }

      if (abortPlayback) break;

      // Start prefetching one chunk ahead in the background
      const nextIndex = i + 1;
      if (nextIndex < chunks.length && !blobCache[nextIndex]) {
        fetchSpeechBlob(chunks[nextIndex])
          .then((nextBlob) => {
            blobCache[nextIndex] = nextBlob;
          })
          .catch((err) => {
            console.warn(`Prefetch failed for chunk ${nextIndex}:`, err);
          });
      }

      await playBlob(blob);

      if (!abortPlayback) {
        await sleep(120);
      }
    }
  } catch (err) {
    console.error("🔇 TTS Error:", err);
  } finally {
    const completed = !abortPlayback;
    isPlaying = false;
    stopAudio();
    onFinish?.({ completed });
  }
};

// ──────────────────────────────────────────
// Utility: check if currently speaking
// ──────────────────────────────────────────
export const isSpeaking = () => isPlaying;