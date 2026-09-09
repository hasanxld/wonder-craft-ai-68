# Little AI — AI creation studio

An aurora-light "liquid glass" web app where signed-in users generate images, videos, speech, avatars, transcripts and more. Everything they make is saved to a personal library.

## Look and feel

- Aurora light glass: soft off-white background (#F6F5FB), floating frosted panels, violet (#8B7BFF) and rose (#FF9EC4) aurora blooms behind blurred glass cards.
- Josefin Sans for headings and UI, loaded from Google Fonts.
- Premium line-and-gradient icon set (Lucide, styled with gradient strokes) — no default flat icons.
- Fully responsive: single-column mobile, two-column tablet, sidebar workspace on desktop. Large tap targets, sticky mobile action bar.
- Subtle motion: glass panels lift on hover, results fade and scale in, generating states use a shimmering aurora pulse.

## Pages

1. Landing — hero, live tool showcase, feature grid, how it works, pricing/limits note, FAQ, footer.
2. Sign in / Sign up — email + password, glass card.
3. Dashboard — greeting, recent creations, tool launcher grid.
4. Tool pages (one per tool, shared studio layout: prompt panel left, live result right, history below).
5. Library — all saved creations, filter by type, play/preview, download, delete.
6. Profile / Settings — display name, avatar, usage stats, sign out.
7. About and Contact.

## Tools (first version)

- Text to Image — prompt, style presets, aspect ratio, quality; result gallery.
- Text to Video — prompt, duration, aspect ratio; video player result.
- Text to Speech (ElevenLabs) — text input, voice picker with previews, stability/similarity/style/speed controls, streaming playback plus MP3 download, long text auto-split.
- Speech to Text (ElevenLabs Scribe) — upload audio or record from mic, speaker labels, timestamps, copy/download transcript.
- AI Chat — streaming assistant with saved conversations.
- Profile Photo Generator — upload or describe, style presets (studio, corporate, cinematic), 4 variations.
- Avatar Generator — prompt plus style (3D, anime, illustration, pixel), square outputs.
- Video Translator — upload/record audio or video, transcribe, translate, re-voice with ElevenLabs in the chosen language, downloadable dubbed audio track.
- AI Web Builder — describe a site, get a generated single-page HTML/CSS layout with live preview and code download.

Each tool page includes full guidance: what it does, tips for good prompts, the available options explained, and example prompts.

## Accounts and data

- Lovable Cloud handles sign-up, sign-in, sessions and storage. Sign-in is required for every tool; visitors see the landing page and are redirected to sign in.
- Profiles table for display name/avatar, creations table for every generation (type, prompt, settings, result URL, timestamp), chat threads and messages for AI Chat.
- Generated files (images, video, audio) stored in Cloud file storage, listed in the Library.
- No usage caps — every signed-in user can create without limits.

## Technical notes

- TanStack Start routes: `/`, `/auth`, and an authenticated subtree for `/dashboard`, `/tools/*`, `/library`, `/settings`.
- ElevenLabs via the ElevenLabs connector (`ELEVENLABS_API_KEY`), called server-side only: TTS (streaming `/v1/text-to-speech/{voice}/stream`, `eleven_multilingual_v2`), voices list, Scribe `scribe_v2` for transcription, single-use tokens for live mic capture.
- Image, video, chat, translation and web-builder generation via Lovable AI Gateway from server functions; API keys never reach the browser.
- Row-level security so each user only reads their own creations; explicit table grants in the migration.
- Per-route page titles and descriptions for search engines.

## Build order

1. Enable Lovable Cloud, connect ElevenLabs, set up design system and fonts.
2. Auth pages, protected layout, database tables and storage.
3. Shared studio shell, then tools in order: image, TTS, speech to text, chat, video, avatar/profile photo, translator, web builder.
4. Library, settings, landing page, then responsive and polish pass.
