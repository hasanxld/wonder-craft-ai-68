const API = "https://api.elevenlabs.io/v1";

function elevenKey(): string {
  const key = process.env["ELEVENLABS_API_KEY"];
  if (!key) throw new Error("The voice service is not connected yet.");
  return key;
}

async function fail(res: Response, fallback: string): Promise<never> {
  const body = await res.text().catch(() => "");
  let message = fallback;
  try {
    const parsed = JSON.parse(body) as {
      detail?: { message?: string } | string;
      message?: string;
    };
    if (typeof parsed.detail === "string") message = parsed.detail;
    else message = parsed.detail?.message ?? parsed.message ?? fallback;
  } catch {
    if (body) message = body.slice(0, 300);
  }
  throw new Error(message);
}

export type Voice = {
  voiceId: string;
  name: string;
  category: string;
  previewUrl: string | null;
  labels: Record<string, string>;
};

export async function listVoices(): Promise<Voice[]> {
  const res = await fetch(`${API}/voices`, { headers: { "xi-api-key": elevenKey() } });
  if (!res.ok) await fail(res, "The voice list could not be loaded.");
  const json = (await res.json()) as {
    voices?: Array<{
      voice_id: string;
      name: string;
      category?: string;
      preview_url?: string;
      labels?: Record<string, string>;
    }>;
  };
  return (json.voices ?? []).map((v) => ({
    voiceId: v.voice_id,
    name: v.name,
    category: v.category ?? "premade",
    previewUrl: v.preview_url ?? null,
    labels: v.labels ?? {},
  }));
}

export type VoiceSettings = {
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
};

/** Split long text so every request stays well under the model input cap. */
export function chunkText(text: string, maxWords = 350): string[] {
  const wordCount = (s: string) => (s.match(/\S+/g) ?? []).length;
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };
  for (const sentence of sentences) {
    if (wordCount(sentence) > maxWords) {
      flush();
      const words = sentence.match(/\S+/g) ?? [];
      for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(" "));
      }
      continue;
    }
    if (current && wordCount(current) + wordCount(sentence) > maxWords) flush();
    current += sentence;
  }
  flush();
  return chunks.length ? chunks : [text];
}

async function speakOnce(
  text: string,
  voiceId: string,
  settings: VoiceSettings,
  previousText?: string,
  nextText?: string,
): Promise<Uint8Array> {
  const res = await fetch(
    `${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": elevenKey(), "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        ...(previousText ? { previous_text: previousText } : {}),
        ...(nextText ? { next_text: nextText } : {}),
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarityBoost,
          style: settings.style,
          use_speaker_boost: true,
          speed: settings.speed,
        },
      }),
    },
  );
  if (!res.ok) await fail(res, "The speech could not be generated.");
  return new Uint8Array(await res.arrayBuffer());
}

/** Narrate any length of text; long text is split and stitched together. */
export async function synthesizeSpeech(
  text: string,
  voiceId: string,
  settings: VoiceSettings,
): Promise<Uint8Array> {
  const chunks = chunkText(text);
  const parts: Uint8Array[] = [];
  for (let i = 0; i < chunks.length; i++) {
    parts.push(
      await speakOnce(chunks[i]!, voiceId, settings, chunks[i - 1], chunks[i + 1]),
    );
  }
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return merged;
}

export type Transcript = {
  text: string;
  languageCode?: string;
  words: Array<{ text: string; start: number; end: number; speaker?: string }>;
};

export async function transcribeAudio(
  bytes: Uint8Array,
  mimeType: string,
  fileName: string,
  options: { diarize: boolean; languageCode?: string },
): Promise<Transcript> {
  const form = new FormData();
  form.append("file", new Blob([bytes as unknown as BlobPart], { type: mimeType }), fileName);
  form.append("model_id", "scribe_v2");
  form.append("tag_audio_events", "true");
  form.append("diarize", options.diarize ? "true" : "false");
  if (options.languageCode) form.append("language_code", options.languageCode);

  const res = await fetch(`${API}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": elevenKey() },
    body: form,
  });
  if (!res.ok) await fail(res, "The audio could not be transcribed.");
  const json = (await res.json()) as {
    text?: string;
    language_code?: string;
    words?: Array<{ text: string; start: number; end: number; speaker_id?: string }>;
  };
  return {
    text: json.text ?? "",
    languageCode: json.language_code,
    words: (json.words ?? []).map((w) => ({
      text: w.text,
      start: w.start,
      end: w.end,
      speaker: w.speaker_id,
    })),
  };
}
