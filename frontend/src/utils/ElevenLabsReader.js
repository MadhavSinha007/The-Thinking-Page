// utils/ElevenLabsReader.js
// 🔑 Set your ElevenLabs API key here
const API_KEY = "YOUR_API_KEY";

// Voice options — swap VOICE_ID to change the narrator
// Rachel (calm, expressive): 21m00Tcm4TlvDq8ikWAM
// Clyde (warm, deep):        2EiwWnXFnvU5JabPnv8n
// Bella (soft, emotive):     EXAVITQu4vr4xnSDxMaL
// Adam (neutral, clear):     pNInz6obpgDQGcFmaJgB
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = "eleven_turbo_v2"; // faster + multilingual; use "eleven_monolingual_v1" for English-only

let currentAudio = null;
let isPlaying = false;
let abortPlayback = false;

// ──────────────────────────────────────────
// Stop any playing audio immediately
// ──────────────────────────────────────────
export const stopAudio = () => {
  abortPlayback = true;
  isPlaying = false;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
};

// ──────────────────────────────────────────
// Split text into sentence-aware chunks
// Splits on sentence boundaries to sound natural
// ──────────────────────────────────────────
const chunkText = (text, maxLength = 500) => {
  // Clean up whitespace
  const cleaned = text.replace(/\s+/g, " ").trim();

  // Split on sentence boundaries first
  const sentences = cleaned.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [cleaned];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // If adding this sentence exceeds maxLength, flush current and start new chunk
    if (current.length + trimmed.length > maxLength && current.length > 0) {
      chunks.push(current.trim());
      current = trimmed + " ";
    } else {
      current += trimmed + " ";
    }
  }

  if (current.trim()) chunks.push(current.trim());
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
          // Stability: lower = more expressive/emotional, higher = more consistent
          stability: 0.35,
          // Similarity boost: how closely it matches the original voice
          similarity_boost: 0.80,
          // Style: 0–1, higher = more expressive dramatic delivery (eleven_turbo_v2 supports this)
          style: 0.45,
          // Use speaker boost for clearer audio
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
  }

  return await response.blob();
};

// ──────────────────────────────────────────
// Play an audio blob, return a Promise
// that resolves when playback ends
// ──────────────────────────────────────────
const playBlob = (blob) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playbackRate = 1.0;
    currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };

    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback error"));
    };

    audio.play().catch(reject);
  });
};

// ──────────────────────────────────────────
// 🔊 Main TTS function
// @param text      — the text to speak
// @param onFinish  — callback when all chunks finish (or stopped)
// ──────────────────────────────────────────
export const speakText = async (text, onFinish) => {
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    console.warn("⚠️ ElevenLabs API key not set. Add your key to ElevenLabsReader.js");
    onFinish?.();
    return;
  }

  if (!text?.trim()) {
    console.warn("⚠️ No text to speak");
    onFinish?.();
    return;
  }

  // Stop any existing audio
  stopAudio();
  abortPlayback = false;
  isPlaying = true;

  const chunks = chunkText(text);
  console.log(`📖 Speaking ${chunks.length} chunk(s), ~${text.length} chars`);

  try {
    // Pre-fetch first two chunks for faster start
    const prefetchQueue = chunks.slice(0, 2).map(fetchSpeechBlob);
    const blobCache = await Promise.allSettled(prefetchQueue);

    for (let i = 0; i < chunks.length; i++) {
      if (abortPlayback) break;

      let blob;

      // Use pre-fetched blob if available
      if (i < blobCache.length && blobCache[i].status === "fulfilled") {
        blob = blobCache[i].value;
      } else {
        blob = await fetchSpeechBlob(chunks[i]);
      }

      if (abortPlayback) break;

      // Pre-fetch next chunk while current is playing
      const nextIndex = i + 2;
      let nextBlobPromise = null;
      if (nextIndex < chunks.length && !blobCache[nextIndex]) {
        nextBlobPromise = fetchSpeechBlob(chunks[nextIndex]);
      }

      await playBlob(blob);

      // Cache the pre-fetched next blob
      if (nextBlobPromise) {
        const result = await nextBlobPromise.catch(() => null);
        if (result) blobCache[nextIndex] = { status: "fulfilled", value: result };
      }
    }
  } catch (err) {
    console.error("🔇 TTS Error:", err);
  } finally {
    isPlaying = false;
    currentAudio = null;
    if (!abortPlayback) {
      onFinish?.();
    }
  }
};

// ──────────────────────────────────────────
// Utility: check if currently speaking
// ──────────────────────────────────────────
export const isSpeaking = () => isPlaying;