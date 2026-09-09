const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function aiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet. Please try again in a moment.");
  return key;
}

function headers(key: string) {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function failure(res: Response, fallback: string): Promise<never> {
  const body = await res.text().catch(() => "");
  let message = fallback;
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: { message?: string } };
    message = parsed.message ?? parsed.error?.message ?? fallback;
  } catch {
    if (body) message = body.slice(0, 300);
  }
  if (res.status === 402) {
    throw new Error("The AI credits for this app have run out. The app owner needs to top up.");
  }
  if (res.status === 429) {
    throw new Error("Too many requests right now — please try again in a few seconds.");
  }
  throw new Error(message);
}

export type InlineImage = { mimeType: string; base64: string };

/** Generate one image. Returns raw JPEG/PNG bytes. */
export async function generateImage(
  prompt: string,
  reference?: InlineImage,
  model = "google/gemini-3.1-flash-image",
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (reference) {
    parts.push({ inline_data: { mime_type: reference.mimeType, data: reference.base64 } });
  }

  const res = await fetch(`${GATEWAY}/images/generations`, {
    method: "POST",
    headers: headers(aiKey()),
    body: JSON.stringify({
      model,
      contents: [{ role: "user", parts }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  if (!res.ok) await failure(res, "Image generation failed.");

  const json = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = json.data?.[0];
  if (first?.b64_json) {
    return { bytes: decodeBase64(first.b64_json), mimeType: "image/jpeg" };
  }
  if (first?.url) {
    const file = await fetch(first.url);
    return { bytes: new Uint8Array(await file.arrayBuffer()), mimeType: "image/jpeg" };
  }
  throw new Error("The image could not be generated. Try a different description.");
}

export function decodeBase64(base64: string): Uint8Array {
  const clean = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Start an async video job. */
export async function startVideoJob(
  prompt: string,
  duration: string,
  resolution: string,
  model = "google/gemini-omni-1.1-flash",
): Promise<string> {
  const res = await fetch(`${GATEWAY}/videos`, {
    method: "POST",
    headers: headers(aiKey()),
    body: JSON.stringify({
      model,
      input: prompt,
      response_format: { type: "video", resolution, duration },
    }),
  });
  if (!res.ok) await failure(res, "Video generation could not be started.");
  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error("Video generation could not be started.");
  return json.id;
}

export async function videoJobStatus(
  id: string,
): Promise<{ status: string; progress: number }> {
  const res = await fetch(`${GATEWAY}/videos/${id}`, {
    headers: { Authorization: `Bearer ${aiKey()}` },
  });
  if (!res.ok) await failure(res, "Could not check the video status.");
  const json = (await res.json()) as { status?: string; progress?: number };
  return { status: json.status ?? "in_progress", progress: json.progress ?? 0 };
}

export async function videoJobBytes(id: string): Promise<Uint8Array> {
  const res = await fetch(`${GATEWAY}/videos/${id}/content`, {
    headers: { Authorization: `Bearer ${aiKey()}` },
    redirect: "follow",
  });
  if (!res.ok) await failure(res, "The finished video could not be downloaded.");
  return new Uint8Array(await res.arrayBuffer());
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Plain text chat completion (non-OpenAI model, chat-completions path). */
export async function chatComplete(
  messages: ChatMessage[],
  model = "google/gemini-3.8-flash",
): Promise<string> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: headers(aiKey()),
    body: JSON.stringify({ model, messages, stream: false }),
  });
  if (!res.ok) await failure(res, "The AI could not answer right now.");
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI returned an empty answer. Please try again.");
  return text;
}
