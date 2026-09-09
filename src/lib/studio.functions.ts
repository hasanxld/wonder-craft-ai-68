import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type CreationRecord = {
  id: string;
  tool: string;
  kind: string;
  title: string | null;
  prompt: string | null;
  textResult: string | null;
  url: string | null;
  createdAt: string;
};

const SIGNED_SECONDS = 60 * 60 * 24 * 7;

type Ctx = { supabase: any; userId: string };

async function signPath(ctx: Ctx, path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await ctx.supabase.storage
    .from("creations")
    .createSignedUrl(path, SIGNED_SECONDS);
  return data?.signedUrl ?? null;
}

async function saveCreation(
  ctx: Ctx,
  input: {
    tool: string;
    kind: string;
    title: string;
    prompt?: string;
    options?: Record<string, unknown>;
    textResult?: string;
    file?: { bytes: Uint8Array; ext: string; contentType: string };
  },
): Promise<CreationRecord> {
  let storagePath: string | null = null;
  if (input.file) {
    storagePath = `${ctx.userId}/${input.kind}/${crypto.randomUUID()}.${input.file.ext}`;
    const { error } = await ctx.supabase.storage
      .from("creations")
      .upload(storagePath, input.file.bytes, { contentType: input.file.contentType });
    if (error) throw new Error(`The result could not be saved: ${error.message}`);
  }

  const { data, error } = await ctx.supabase
    .from("creations")
    .insert({
      user_id: ctx.userId,
      tool: input.tool,
      kind: input.kind,
      title: input.title,
      prompt: input.prompt ?? null,
      options: input.options ?? {},
      storage_path: storagePath,
      text_result: input.textResult ?? null,
    })
    .select("id, tool, kind, title, prompt, text_result, storage_path, created_at")
    .single();
  if (error) throw new Error(`The result could not be saved: ${error.message}`);

  return {
    id: data.id,
    tool: data.tool,
    kind: data.kind,
    title: data.title,
    prompt: data.prompt,
    textResult: data.text_result,
    url: await signPath(ctx, data.storage_path),
    createdAt: data.created_at,
  };
}

/* ---------------------------------- images --------------------------------- */

const imageSchema = z.object({
  prompt: z.string().min(3).max(2000),
  style: z.string().max(80).default("photographic"),
  aspect: z.string().max(20).default("1:1"),
  count: z.number().int().min(1).max(4).default(1),
  tool: z.enum(["text-to-image", "avatar", "profile-photo"]).default("text-to-image"),
  reference: z
    .object({ mimeType: z.string(), base64: z.string() })
    .nullable()
    .optional(),
});

const TOOL_DIRECTIVES: Record<string, string> = {
  "text-to-image": "",
  avatar:
    "Design a striking square avatar with a clean, centered subject, bold silhouette and a simple background that reads well at small sizes.",
  "profile-photo":
    "Create a flattering, realistic professional headshot: sharp eyes, natural skin texture, tasteful studio lighting, shallow depth of field, shoulders-up framing.",
};

export const generateImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => imageSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { generateImage } = await import("./ai.server");
    const ctx = context as unknown as Ctx;

    const fullPrompt = [
      TOOL_DIRECTIVES[data.tool],
      data.prompt,
      `Visual style: ${data.style}.`,
      `Composition aspect ratio: ${data.aspect}.`,
      "High detail, pleasing colour, no watermarks, no text overlays unless requested.",
    ]
      .filter(Boolean)
      .join(" ");

    const results: CreationRecord[] = [];
    for (let i = 0; i < data.count; i++) {
      const image = await generateImage(
        fullPrompt,
        data.reference ?? undefined,
      );
      results.push(
        await saveCreation(ctx, {
          tool: data.tool,
          kind: "image",
          title: data.prompt.slice(0, 70),
          prompt: data.prompt,
          options: { style: data.style, aspect: data.aspect },
          file: {
            bytes: image.bytes,
            ext: image.mimeType.includes("png") ? "png" : "jpg",
            contentType: image.mimeType,
          },
        }),
      );
    }
    return results;
  });

/* ---------------------------------- video ---------------------------------- */

export const startVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        prompt: z.string().min(3).max(1500),
        duration: z.string().default("6s"),
        resolution: z.string().default("720p"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { startVideoJob } = await import("./ai.server");
    const jobId = await startVideoJob(data.prompt, data.duration, data.resolution);
    return { jobId };
  });

export const checkVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        jobId: z.string().min(4),
        prompt: z.string().min(1).max(1500),
        duration: z.string().default("6s"),
        resolution: z.string().default("720p"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { videoJobStatus, videoJobBytes } = await import("./ai.server");
    const ctx = context as unknown as Ctx;
    const status = await videoJobStatus(data.jobId);

    if (status.status === "failed") {
      throw new Error("The video could not be generated. Try a simpler description.");
    }
    if (status.status !== "completed") {
      return { done: false as const, progress: status.progress, creation: null };
    }

    const bytes = await videoJobBytes(data.jobId);
    const creation = await saveCreation(ctx, {
      tool: "text-to-video",
      kind: "video",
      title: data.prompt.slice(0, 70),
      prompt: data.prompt,
      options: { duration: data.duration, resolution: data.resolution },
      file: { bytes, ext: "mp4", contentType: "video/mp4" },
    });
    return { done: true as const, progress: 100, creation };
  });

/* ---------------------------------- speech --------------------------------- */

export const getVoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { listVoices } = await import("./elevenlabs.server");
    return listVoices();
  });

const speechSchema = z.object({
  text: z.string().min(1).max(40000),
  voiceId: z.string().min(3),
  voiceName: z.string().max(80).default("Voice"),
  stability: z.number().min(0).max(1).default(0.5),
  similarityBoost: z.number().min(0).max(1).default(0.75),
  style: z.number().min(0).max(1).default(0.35),
  speed: z.number().min(0.7).max(1.2).default(1),
});

export const generateSpeech = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => speechSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { synthesizeSpeech } = await import("./elevenlabs.server");
    const ctx = context as unknown as Ctx;
    const bytes = await synthesizeSpeech(data.text, data.voiceId, {
      stability: data.stability,
      similarityBoost: data.similarityBoost,
      style: data.style,
      speed: data.speed,
    });
    return saveCreation(ctx, {
      tool: "text-to-speech",
      kind: "audio",
      title: `${data.voiceName}: ${data.text.slice(0, 50)}`,
      prompt: data.text,
      options: { voice: data.voiceName, voiceId: data.voiceId, speed: data.speed },
      textResult: data.text,
      file: { bytes, ext: "mp3", contentType: "audio/mpeg" },
    });
  });

/* ------------------------------- transcription ----------------------------- */

const transcribeSchema = z.object({
  base64: z.string().min(16),
  mimeType: z.string().min(3),
  fileName: z.string().min(1).max(200),
  diarize: z.boolean().default(true),
  languageCode: z.string().max(8).optional(),
});

export const transcribe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => transcribeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { decodeBase64 } = await import("./ai.server");
    const { transcribeAudio } = await import("./elevenlabs.server");
    const ctx = context as unknown as Ctx;

    const result = await transcribeAudio(
      decodeBase64(data.base64),
      data.mimeType,
      data.fileName,
      { diarize: data.diarize, languageCode: data.languageCode },
    );
    const creation = await saveCreation(ctx, {
      tool: "speech-to-text",
      kind: "text",
      title: `Transcript: ${data.fileName}`.slice(0, 70),
      prompt: data.fileName,
      options: { language: result.languageCode ?? "auto", diarize: data.diarize },
      textResult: result.text,
    });
    return { transcript: result, creation };
  });

/* ------------------------------ video translator --------------------------- */

const translateSchema = z.object({
  base64: z.string().min(16),
  mimeType: z.string().min(3),
  fileName: z.string().min(1).max(200),
  targetLanguage: z.string().min(2).max(40),
  voiceId: z.string().min(3),
  voiceName: z.string().max(80).default("Voice"),
});

export const translateMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => translateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { decodeBase64, chatComplete } = await import("./ai.server");
    const { transcribeAudio, synthesizeSpeech } = await import("./elevenlabs.server");
    const ctx = context as unknown as Ctx;

    const source = await transcribeAudio(
      decodeBase64(data.base64),
      data.mimeType,
      data.fileName,
      { diarize: false },
    );
    if (!source.text.trim()) {
      throw new Error("No speech was found in that file.");
    }

    const translation = await chatComplete([
      {
        role: "system",
        content:
          "You are a professional dubbing translator. Translate the user's transcript into the requested language. Keep the speaker's tone, keep sentence order, and reply with the translation only — no notes, no quotes.",
      },
      {
        role: "user",
        content: `Target language: ${data.targetLanguage}\n\nTranscript:\n${source.text}`,
      },
    ]);

    const bytes = await synthesizeSpeech(translation, data.voiceId, {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.3,
      speed: 1,
    });

    const creation = await saveCreation(ctx, {
      tool: "video-translator",
      kind: "audio",
      title: `${data.targetLanguage} dub: ${data.fileName}`.slice(0, 70),
      prompt: source.text,
      options: {
        targetLanguage: data.targetLanguage,
        voice: data.voiceName,
        sourceLanguage: source.languageCode ?? "auto",
      },
      textResult: translation,
      file: { bytes, ext: "mp3", contentType: "audio/mpeg" },
    });

    return { original: source.text, translation, creation };
  });

/* -------------------------------- web builder ------------------------------ */

export const buildSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        prompt: z.string().min(5).max(3000),
        palette: z.string().max(60).default("aurora violet"),
        sections: z.string().max(300).default("hero, features, testimonials, contact"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { chatComplete } = await import("./ai.server");
    const ctx = context as unknown as Ctx;

    const html = await chatComplete([
      {
        role: "system",
        content:
          "You are an elite web designer. Return ONE complete, self-contained HTML5 document: inline <style> only, no external files, no frameworks, no markdown fences, no explanation. Use modern layout (grid/flex), responsive breakpoints, tasteful glassmorphism, Google Fonts via <link>, and realistic placeholder copy. Output must start with <!DOCTYPE html>.",
      },
      {
        role: "user",
        content: `Website brief: ${data.prompt}\nColour palette: ${data.palette}\nSections to include: ${data.sections}`,
      },
    ]);

    const cleaned = html
      .replace(/^```(?:html)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const creation = await saveCreation(ctx, {
      tool: "web-builder",
      kind: "text",
      title: data.prompt.slice(0, 70),
      prompt: data.prompt,
      options: { palette: data.palette, sections: data.sections },
      textResult: cleaned,
      file: {
        bytes: new TextEncoder().encode(cleaned),
        ext: "html",
        contentType: "text/html",
      },
    });

    return { html: cleaned, creation };
  });

/* ----------------------------------- chat ---------------------------------- */

export const sendChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        threadId: z.string().uuid().nullable().optional(),
        message: z.string().min(1).max(8000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { chatComplete } = await import("./ai.server");
    const ctx = context as unknown as Ctx;

    let threadId = data.threadId ?? null;
    if (!threadId) {
      const { data: thread, error } = await ctx.supabase
        .from("chat_threads")
        .insert({ user_id: ctx.userId, title: data.message.slice(0, 60) })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      threadId = thread.id as string;
    }

    const { data: history } = await ctx.supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(40);

    const reply = await chatComplete([
      {
        role: "system",
        content:
          "You are Little AI, a warm, sharp creative assistant inside an AI studio app. Be concise, practical and friendly. Use short paragraphs and simple lists. When the user wants images, video, voice or a website, suggest which Little AI tool to open.",
      },
      ...((history ?? []) as Array<{ role: string; content: string }>).map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
      { role: "user", content: data.message },
    ]);

    const { error: insertError } = await ctx.supabase.from("chat_messages").insert([
      { thread_id: threadId, user_id: ctx.userId, role: "user", content: data.message },
      { thread_id: threadId, user_id: ctx.userId, role: "assistant", content: reply },
    ]);
    if (insertError) throw new Error(insertError.message);

    await ctx.supabase
      .from("chat_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId);

    return { threadId, reply };
  });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const { data, error } = await ctx.supabase
      .from("chat_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ id: string; title: string; updated_at: string }>;
  });

export const getThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const { data: rows, error } = await ctx.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Array<{
      id: string;
      role: string;
      content: string;
      created_at: string;
    }>;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const { error } = await ctx.supabase.from("chat_threads").delete().eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- library --------------------------------- */

export const listCreations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: z.string().max(20).optional(),
        tool: z.string().max(40).optional(),
        limit: z.number().int().min(1).max(100).default(60),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    let query = ctx.supabase
      .from("creations")
      .select("id, tool, kind, title, prompt, text_result, storage_path, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.kind) query = query.eq("kind", data.kind);
    if (data.tool) query = query.eq("tool", data.tool);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    return Promise.all(
      (rows ?? []).map(async (row: any) => ({
        id: row.id,
        tool: row.tool,
        kind: row.kind,
        title: row.title,
        prompt: row.prompt,
        textResult: row.text_result,
        url: await signPath(ctx, row.storage_path),
        createdAt: row.created_at,
      })),
    ) as Promise<CreationRecord[]>;
  });

export const deleteCreation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const { data: row } = await ctx.supabase
      .from("creations")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (row?.storage_path) {
      await ctx.supabase.storage.from("creations").remove([row.storage_path]);
    }
    const { error } = await ctx.supabase.from("creations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- profile --------------------------------- */

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const { data } = await ctx.supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", ctx.userId)
      .maybeSingle();

    const [{ count: total }, { count: images }, { count: audio }, { count: videos }] =
      await Promise.all([
        ctx.supabase.from("creations").select("id", { count: "exact", head: true }),
        ctx.supabase
          .from("creations")
          .select("id", { count: "exact", head: true })
          .eq("kind", "image"),
        ctx.supabase
          .from("creations")
          .select("id", { count: "exact", head: true })
          .eq("kind", "audio"),
        ctx.supabase
          .from("creations")
          .select("id", { count: "exact", head: true })
          .eq("kind", "video"),
      ]);

    return {
      displayName: (data?.display_name as string | null) ?? null,
      avatarUrl: (data?.avatar_url as string | null) ?? null,
      stats: {
        total: total ?? 0,
        images: images ?? 0,
        audio: audio ?? 0,
        videos: videos ?? 0,
      },
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        displayName: z.string().min(1).max(60),
        avatarUrl: z.string().url().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const { error } = await ctx.supabase.from("profiles").upsert({
      id: ctx.userId,
      display_name: data.displayName,
      avatar_url: data.avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
