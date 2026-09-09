import type { ToolIconKey } from "@/components/icons";

export type ToolMeta = {
  slug: string;
  path: string;
  name: string;
  tagline: string;
  icon: ToolIconKey;
  about: string;
  tips: string[];
  examples: string[];
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "image",
    path: "/tools/image",
    name: "Text to Image",
    tagline: "Turn a sentence into artwork",
    icon: "image",
    about:
      "Describe anything and Little AI paints it. Pick a look, choose the shape of the canvas and generate up to four versions at once. Every image lands in your library.",
    tips: [
      "Name the subject, the setting and the light: 'a fox on wet cobblestones at dusk, rim light'.",
      "Add a medium for a stronger look: oil painting, 35mm photo, risograph print, 3D render.",
      "Use the shape control instead of writing sizes into your description.",
    ],
    examples: [
      "A glass greenhouse floating above pink clouds, soft morning light, dreamy",
      "Bold retro travel poster of Dhaka at sunset, flat colours, grain",
      "Macro photo of a dew-covered violet orchid, shallow depth of field",
    ],
  },
  {
    slug: "video",
    path: "/tools/video",
    name: "Text to Video",
    tagline: "Short cinematic clips from words",
    icon: "video",
    about:
      "Describe a shot and get a short moving clip with sound design baked in. Clips run from three to ten seconds, and you can pick the picture quality.",
    tips: [
      "Write it like a camera direction: subject, motion, camera move, mood.",
      "One action per clip works best — save scene changes for a second clip.",
      "Longer clips and higher quality take a little more time to finish.",
    ],
    examples: [
      "Slow dolly through a neon rain-soaked alley, reflections on the ground",
      "A paper boat drifting down a sunlit stream, close-up, gentle current",
      "Time-lapse of violet clouds rolling over a quiet city skyline",
    ],
  },
  {
    slug: "speech",
    path: "/tools/speech",
    name: "Text to Speech",
    tagline: "Lifelike narration in any voice",
    icon: "voice",
    about:
      "Paste any amount of text and hear it read by a professional-sounding voice. Long text is split and stitched automatically so the delivery stays natural, and you get an MP3 to download.",
    tips: [
      "Punctuation shapes the delivery — commas pause briefly, '...' pauses longer.",
      "Lower stability sounds more expressive; higher stability sounds more even.",
      "Spell out abbreviations and numbers the way you want them spoken.",
    ],
    examples: [
      "Welcome to Little AI. Let's make something beautiful together.",
      "Chapter one. The lighthouse had not been lit for forty years...",
      "Your order is confirmed and will arrive on Thursday.",
    ],
  },
  {
    slug: "transcribe",
    path: "/tools/transcribe",
    name: "Speech to Text",
    tagline: "Accurate transcripts with speakers",
    icon: "transcript",
    about:
      "Upload a recording or record straight from your microphone. You get a clean transcript, timestamps and speaker labels, ready to copy or download.",
    tips: [
      "Clear audio gives the best results — reduce background noise where you can.",
      "Speaker labels work best when people take turns rather than talking over each other.",
      "Leave the language on automatic unless the recording mixes languages.",
    ],
    examples: [
      "A recorded interview or podcast episode",
      "A lecture or meeting recording",
      "A quick voice memo you want in writing",
    ],
  },
  {
    slug: "chat",
    path: "/tools/chat",
    name: "AI Chat",
    tagline: "A creative partner that remembers",
    icon: "chat",
    about:
      "Brainstorm, rewrite, plan and problem-solve. Every conversation is saved so you can pick it back up later.",
    tips: [
      "Say who it is for and what you want back: 'three taglines for a tea brand, under six words'.",
      "Paste your draft and ask for a specific change rather than a general rewrite.",
      "Start a new conversation when you switch topics — it keeps answers sharper.",
    ],
    examples: [
      "Help me name a calm productivity app for students",
      "Rewrite this paragraph to sound friendlier",
      "Plan a seven-day launch schedule for my new website",
    ],
  },
  {
    slug: "profile-photo",
    path: "/tools/profile-photo",
    name: "Profile Photo Generator",
    tagline: "Studio-grade headshots",
    icon: "portrait",
    about:
      "Describe yourself — or upload a photo as a reference — and get polished headshots in the style you choose. Great for CVs, team pages and social profiles.",
    tips: [
      "Mention hair, clothing and mood so the result feels like you.",
      "Uploading a clear, front-facing photo makes the likeness much closer.",
      "Generate four versions and keep the one that feels most natural.",
    ],
    examples: [
      "Woman in her thirties, curly dark hair, navy blazer, warm confident smile",
      "Man with short beard, grey knit sweater, soft window light, relaxed",
      "Cinematic headshot, moody side light, charcoal background",
    ],
  },
  {
    slug: "avatar",
    path: "/tools/avatar",
    name: "Avatar Generator",
    tagline: "Characters that pop at any size",
    icon: "avatar",
    about:
      "Make square avatars for profiles, games and communities — 3D, anime, illustrated or pixel art, all with clean readable silhouettes.",
    tips: [
      "Simple backgrounds keep the avatar readable when it is tiny.",
      "Name two or three signature details: hair, colour, accessory.",
      "Try the same description in different styles to compare.",
    ],
    examples: [
      "Friendly astronaut cat with a violet visor, 3D render",
      "Anime swordswoman with silver hair and a red scarf",
      "Pixel art wizard with a glowing lantern",
    ],
  },
  {
    slug: "translate",
    path: "/tools/translate",
    name: "Video Translator",
    tagline: "Dub any clip into a new language",
    icon: "translate",
    about:
      "Upload a video or audio file, and Little AI transcribes the speech, translates it and re-voices it in the language you choose. You get the transcript, the translation and a downloadable dubbed audio track.",
    tips: [
      "Files with one clear speaker dub the most naturally.",
      "Choose a voice that matches the original speaker's energy.",
      "Longer files take longer — a few minutes of speech is a good size.",
    ],
    examples: [
      "Translate a product demo into Spanish",
      "Dub a tutorial into Bengali",
      "Turn an English podcast clip into French",
    ],
  },
  {
    slug: "web-builder",
    path: "/tools/web-builder",
    name: "AI Web Builder",
    tagline: "A finished page from a brief",
    icon: "builder",
    about:
      "Describe a website and get a complete, responsive page you can preview instantly and download as a single file, ready to host anywhere.",
    tips: [
      "Say who the site is for and what the visitor should do.",
      "List the sections you want, in order.",
      "Name colours or a mood, and the page will follow it.",
    ],
    examples: [
      "Landing page for a neighbourhood coffee shop with menu and opening hours",
      "Portfolio for a wedding photographer, image-led, calm and elegant",
      "One-page site for a yoga studio with class times and a booking form",
    ],
  },
];

export function toolBySlug(slug: string): ToolMeta {
  const found = TOOLS.find((tool) => tool.slug === slug);
  if (!found) throw new Error(`Unknown tool: ${slug}`);
  return found;
}
