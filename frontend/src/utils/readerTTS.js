// utils/readerTTS.js

const ELEVENLABS_API_KEY =
  import.meta.env.VITE_ELEVENLABS_API_KEY || "";

const ELEVENLABS_VOICE_ID =
  import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

const ELEVENLABS_MODEL_ID =
  import.meta.env.VITE_ELEVENLABS_MODEL_ID || "eleven_turbo_v2";

let currentAudio = null;
let currentObjectUrl = null;
let currentUtterance = null;
let playing = false;
let stopRequested = false;
let currentEngine = "idle";

const cleanText = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

export const isSpeaking = () => playing;
export const getSpeechEngine = () => currentEngine;

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

  if (currentUtterance && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentUtterance = null;
  }

  currentEngine = "idle";
};

const chunkText = (text, maxLength = 900) => {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const sentences =
    cleaned.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [cleaned];

  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const part = sentence.trim();
    if (!part) continue;

    if (part.length > maxLength) {
      const words = part.split(" ");
      let buffer = "";

      for (const word of words) {
        const next = `${buffer} ${word}`.trim();
        if (next.length > maxLength && buffer) {
          chunks.push(buffer.trim());
          buffer = word;
        } else {
          buffer = next;
        }
      }

      if (buffer.trim()) {
        if (current.trim()) {
          chunks.push(current.trim());
          current = "";
        }
        chunks.push(buffer.trim());
      }
      continue;
    }

    const next = `${current} ${part}`.trim();
    if (next.length > maxLength && current) {
      chunks.push(current.trim());
      current = part;
    } else {
      current = next;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

const hasValidElevenLabsKey = () =>
  !!ELEVENLABS_API_KEY &&
  ELEVENLABS_API_KEY !== "YOUR_API_KEY" &&
  ELEVENLABS_API_KEY.length > 10;

const fetchElevenLabsBlob = async (text) => {
  const res = await fetch(
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
          stability: 0.4,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`ElevenLabs failed (${res.status}): ${err}`);
  }

  return res.blob();
};

const playBlob = (blob) =>
  new Promise((resolve, reject) => {
    if (stopRequested) {
      resolve();
      return;
    }

    currentObjectUrl = URL.createObjectURL(blob);
    currentAudio = new Audio(currentObjectUrl);
    currentAudio.preload = "auto";

    currentAudio.onended = () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
      }
      currentAudio = null;
      resolve();
    };

    currentAudio.onerror = () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
      }
      currentAudio = null;
      reject(new Error("Audio playback failed"));
    };

    currentAudio.play().catch(reject);
  });

const speakWithElevenLabs = async (text) => {
  currentEngine = "elevenlabs";
  const chunks = chunkText(text, 900);

  for (const chunk of chunks) {
    if (stopRequested) break;
    const blob = await fetchElevenLabsBlob(chunk);
    if (stopRequested) break;
    await playBlob(blob);
  }
};

const speakWithPuter = async (text) => {
  if (!window.puter?.ai?.txt2speech) {
    throw new Error("Puter.js TTS not available");
  }

  currentEngine = "puter";
  const chunks = chunkText(text, 700);

  for (const chunk of chunks) {
    if (stopRequested) break;

    const result = await window.puter.ai.txt2speech(chunk);

    if (stopRequested) break;

    let audioUrl = null;

    if (typeof result === "string") {
      audioUrl = result;
    } else if (result?.url) {
      audioUrl = result.url;
    } else if (result?.audio_url) {
      audioUrl = result.audio_url;
    } else if (result instanceof Blob) {
      await playBlob(result);
      continue;
    }

    if (!audioUrl) {
      throw new Error("Invalid Puter.js TTS response");
    }

    await new Promise((resolve, reject) => {
      currentAudio = new Audio(audioUrl);
      currentAudio.preload = "auto";

      currentAudio.onended = () => {
        currentAudio = null;
        resolve();
      };

      currentAudio.onerror = () => {
        currentAudio = null;
        reject(new Error("Puter.js playback failed"));
      };

      currentAudio.play().catch(reject);
    });
  }
};

const speakWithBrowser = async (text) => {
  if (!("speechSynthesis" in window)) {
    throw new Error("Browser TTS not supported");
  }

  currentEngine = "browser";
  const chunks = chunkText(text, 1800);

  for (const chunk of chunks) {
    if (stopRequested) break;

    await new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      currentUtterance = utterance;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /en/i.test(v.lang) && /female|zira|samantha|google/i.test(v.name)) ||
        voices.find((v) => /en/i.test(v.lang)) ||
        voices[0];

      if (preferred) utterance.voice = preferred;

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        currentUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        currentUtterance = null;
        reject(new Error(e?.error || "Speech synthesis failed"));
      };

      window.speechSynthesis.speak(utterance);
    });
  }
};

export const speakText = async (text, onFinish) => {
  const cleaned = cleanText(text);

  if (!cleaned) {
    onFinish?.({ completed: true, engine: "idle" });
    return;
  }

  stopAudio();
  stopRequested = false;
  playing = true;

  try {
    if (hasValidElevenLabsKey()) {
      try {
        await speakWithElevenLabs(cleaned);
      } catch (err) {
        console.warn("ElevenLabs unavailable, falling back.", err);
        if (!stopRequested) {
          try {
            await speakWithPuter(cleaned);
          } catch (puterErr) {
            console.warn("Puter.js unavailable, falling back.", puterErr);
            if (!stopRequested) {
              await speakWithBrowser(cleaned);
            }
          }
        }
      }
    } else {
      try {
        await speakWithPuter(cleaned);
      } catch (puterErr) {
        console.warn("Puter.js unavailable, falling back to browser speech.", puterErr);
        if (!stopRequested) {
          await speakWithBrowser(cleaned);
        }
      }
    }
  } catch (err) {
    console.error("TTS error:", err);
  } finally {
    const completed = !stopRequested;
    playing = false;
    currentEngine = completed ? currentEngine : "idle";
    stopAudio();
    onFinish?.({
      completed,
      engine: currentEngine,
    });
  }
};