// utils/readerTTS.js

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";

// Hardcoded defaults so only API key is required in .env
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const ELEVENLABS_MODEL_ID = "eleven_turbo_v2";

let currentAudio = null;
let currentObjectUrl = null;
let playing = false;
let stopRequested = false;
let currentEngine = "idle";
let lastError = null;

const cleanText = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isSpeaking = () => playing;
export const getSpeechEngine = () => currentEngine;
export const getSpeechError = () => lastError;

const hasValidElevenLabsKey = () =>
  typeof ELEVENLABS_API_KEY === "string" &&
  ELEVENLABS_API_KEY.trim().length > 10;

export const stopAudio = () => {
  stopRequested = true;
  playing = false;

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

  currentEngine = "idle";
};

const chunkText = (text, maxLength = 1200) => {
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

const fetchElevenLabsBlob = async (text) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `ElevenLabs API error ${response.status}${errText ? `: ${errText}` : ""}`
    );
  }

  return response.blob();
};

const playBlob = (blob) =>
  new Promise((resolve, reject) => {
    if (stopRequested) {
      resolve();
      return;
    }

    if (currentObjectUrl) {
      try {
        URL.revokeObjectURL(currentObjectUrl);
      } catch {}
      currentObjectUrl = null;
    }

    currentObjectUrl = URL.createObjectURL(blob);
    const audio = new Audio(currentObjectUrl);
    audio.preload = "auto";
    audio.playbackRate = 1;

    currentAudio = audio;

    audio.onended = () => {
      if (currentObjectUrl) {
        try {
          URL.revokeObjectURL(currentObjectUrl);
        } catch {}
        currentObjectUrl = null;
      }
      currentAudio = null;
      resolve();
    };

    audio.onerror = () => {
      if (currentObjectUrl) {
        try {
          URL.revokeObjectURL(currentObjectUrl);
        } catch {}
        currentObjectUrl = null;
      }
      currentAudio = null;
      reject(new Error("Audio playback failed"));
    };

    audio.play().catch((err) => {
      reject(new Error(err?.message || "Audio play() failed"));
    });
  });

const speakWithElevenLabs = async (text) => {
  currentEngine = "elevenlabs";

  const chunks = chunkText(text, 1200);
  if (!chunks.length) return;

  const blobCache = new Array(chunks.length);

  const initialPrefetch = chunks.slice(0, 2).map((chunk) => fetchElevenLabsBlob(chunk));
  const initialResults = await Promise.allSettled(initialPrefetch);

  initialResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      blobCache[index] = result.value;
    }
  });

  for (let i = 0; i < chunks.length; i++) {
    if (stopRequested) break;

    let blob = blobCache[i];

    if (!blob) {
      blob = await fetchElevenLabsBlob(chunks[i]);
      blobCache[i] = blob;
    }

    if (stopRequested) break;

    const nextIndex = i + 1;
    if (nextIndex < chunks.length && !blobCache[nextIndex]) {
      fetchElevenLabsBlob(chunks[nextIndex])
        .then((nextBlob) => {
          blobCache[nextIndex] = nextBlob;
        })
        .catch((err) => {
          console.warn(`Prefetch failed for chunk ${nextIndex}:`, err);
        });
    }

    await playBlob(blob);

    if (!stopRequested) {
      await sleep(100);
    }
  }
};

export const speakText = async (text, onFinish) => {
  const cleaned = cleanText(text);
  lastError = null;

  if (!cleaned) {
    currentEngine = "idle";
    onFinish?.({ completed: false, engine: "idle", error: null });
    return;
  }

  if (!hasValidElevenLabsKey()) {
    const err = new Error(
      "Missing ElevenLabs API key. Add VITE_ELEVENLABS_API_KEY to your .env file and restart Vite."
    );
    lastError = err.message;
    currentEngine = "idle";
    console.error(err.message);
    onFinish?.({ completed: false, engine: "idle", error: err.message });
    return;
  }

  stopAudio();
  stopRequested = false;
  playing = true;
  currentEngine = "elevenlabs";

  try {
    console.log("Using ElevenLabs TTS");
    await speakWithElevenLabs(cleaned);

    const completed = !stopRequested;
    playing = false;

    if (completed) {
      onFinish?.({
        completed: true,
        engine: "elevenlabs",
        error: null,
      });
    } else {
      onFinish?.({
        completed: false,
        engine: "idle",
        error: null,
      });
    }
  } catch (err) {
    playing = false;
    lastError = err?.message || "Unknown ElevenLabs TTS error";
    console.error("ElevenLabs TTS failed:", err);
    onFinish?.({
      completed: false,
      engine: "elevenlabs",
      error: lastError,
    });
  } finally {
    if (!playing) {
      stopAudio();
    }
  }
};