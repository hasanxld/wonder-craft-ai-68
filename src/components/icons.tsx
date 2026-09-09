import type { SVGProps } from "react";

/**
 * Little AI premium icon set — hand-drawn SVG glyphs with a shared
 * aurora gradient stroke. Semantic tokens only (currentColor + gradient stops).
 */

type IconProps = SVGProps<SVGSVGElement> & { gradientId?: string };

function Svg({ children, gradientId = "littleai-grad", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="55%" stopColor="var(--aurora-2)" />
          <stop offset="100%" stopColor="var(--aurora-3)" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`}>{children}</g>
    </svg>
  );
}

export function LogoMark(props: IconProps) {
  return (
    <Svg gradientId="ico-logo" {...props}>
      <path d="M16 3.5c2.6 4.1 5.3 6.1 9.4 7.1-4.1 1.4-6.9 4.1-9.4 9.2-2.5-5.1-5.3-7.8-9.4-9.2 4.1-1 6.8-3 9.4-7.1Z" />
      <path d="M22.8 20.4c1 1.6 2 2.3 3.7 2.7-1.7.6-2.7 1.6-3.7 3.6-1-2-2-3-3.7-3.6 1.7-.4 2.7-1.1 3.7-2.7Z" />
      <path d="M9.6 22.6c.7 1.1 1.4 1.6 2.6 1.9-1.2.4-1.9 1.1-2.6 2.5-.7-1.4-1.4-2.1-2.6-2.5 1.2-.3 1.9-.8 2.6-1.9Z" />
    </Svg>
  );
}

export function IconImage(props: IconProps) {
  return (
    <Svg gradientId="ico-image" {...props}>
      <rect x="4" y="6" width="24" height="20" rx="5" />
      <path d="M4.8 21.5 11 15.6a2.4 2.4 0 0 1 3.3 0l4.5 4.4" />
      <path d="M17.5 22.8l2.6-2.6a2.4 2.4 0 0 1 3.3 0l3.6 3.4" />
      <circle cx="21.4" cy="12.2" r="2.2" />
    </Svg>
  );
}

export function IconVideo(props: IconProps) {
  return (
    <Svg gradientId="ico-video" {...props}>
      <rect x="3.5" y="7" width="18" height="18" rx="5" />
      <path d="M21.5 14.6l5.2-3.4a1.2 1.2 0 0 1 1.8 1v7.6a1.2 1.2 0 0 1-1.8 1l-5.2-3.4z" />
      <path d="M10.4 13.6v4.8l4.2-2.4z" />
    </Svg>
  );
}

export function IconVoice(props: IconProps) {
  return (
    <Svg gradientId="ico-voice" {...props}>
      <path d="M16 4.5a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0v-6a4 4 0 0 1 4-4Z" />
      <path d="M7.5 14a8.5 8.5 0 0 0 17 0" />
      <path d="M16 22.5V27" />
      <path d="M12.2 27h7.6" />
    </Svg>
  );
}

export function IconTranscript(props: IconProps) {
  return (
    <Svg gradientId="ico-transcript" {...props}>
      <path d="M5 16v-4M9.5 19.5v-11M14 22V10M18.5 18.5v-5M23 20.5V11.5M27 16.5v-2" />
    </Svg>
  );
}

export function IconChat(props: IconProps) {
  return (
    <Svg gradientId="ico-chat" {...props}>
      <path d="M27 15.3c0 5.2-4.9 9.3-11 9.3-1.2 0-2.4-.2-3.5-.5L6 27l1.4-4.6C5.9 20.5 5 18 5 15.3 5 10.1 9.9 6 16 6s11 4.1 11 9.3Z" />
      <path d="M11.6 15.3h.01M16 15.3h.01M20.4 15.3h.01" strokeWidth={2.6} />
    </Svg>
  );
}

export function IconPortrait(props: IconProps) {
  return (
    <Svg gradientId="ico-portrait" {...props}>
      <rect x="5" y="4.5" width="22" height="23" rx="6" />
      <circle cx="16" cy="13.5" r="3.8" />
      <path d="M9.5 24.5c1.4-3.3 3.7-5 6.5-5s5.1 1.7 6.5 5" />
    </Svg>
  );
}

export function IconAvatar(props: IconProps) {
  return (
    <Svg gradientId="ico-avatar" {...props}>
      <path d="M16 4l10 5.6v12.8L16 28 6 22.4V9.6z" />
      <circle cx="16" cy="14" r="3.2" />
      <path d="M11 21.6c1.2-2.2 2.9-3.3 5-3.3s3.8 1.1 5 3.3" />
    </Svg>
  );
}

export function IconTranslate(props: IconProps) {
  return (
    <Svg gradientId="ico-translate" {...props}>
      <circle cx="16" cy="16" r="12" />
      <path d="M4.4 13h23.2M4.4 19h23.2" />
      <path d="M16 4c-3.4 3.4-5 7.4-5 12s1.6 8.6 5 12c3.4-3.4 5-7.4 5-12s-1.6-8.6-5-12Z" />
    </Svg>
  );
}

export function IconBuilder(props: IconProps) {
  return (
    <Svg gradientId="ico-builder" {...props}>
      <rect x="4" y="5.5" width="24" height="21" rx="5" />
      <path d="M4 11.5h24" />
      <path d="M11 16h-4v6h4zM25 16h-9M25 20h-9" />
      <path d="M7.5 8.5h.01M10.5 8.5h.01" strokeWidth={2.4} />
    </Svg>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <Svg gradientId="ico-sparkle" {...props}>
      <path d="M16 5c1.9 4.9 3.3 6.5 8.4 8.1-5.1 1.7-6.5 3.3-8.4 8.4-1.9-5.1-3.3-6.7-8.4-8.4C12.7 11.5 14.1 9.9 16 5Z" />
      <path d="M24 21.5c.7 1.6 1.1 2.1 2.8 2.8-1.7.6-2.1 1.1-2.8 2.7-.7-1.6-1.1-2.1-2.8-2.7 1.7-.7 2.1-1.2 2.8-2.8Z" />
    </Svg>
  );
}

export function IconLibrary(props: IconProps) {
  return (
    <Svg gradientId="ico-library" {...props}>
      <rect x="4.5" y="5" width="7" height="22" rx="2.5" />
      <rect x="13.5" y="5" width="7" height="22" rx="2.5" />
      <path d="M23.4 6.4l4.2 1.1-4.4 19-4.2-1.1z" />
    </Svg>
  );
}

export function IconGauge(props: IconProps) {
  return (
    <Svg gradientId="ico-gauge" {...props}>
      <path d="M5 22a11 11 0 1 1 22 0" />
      <path d="M16 22l5.5-6.5" />
      <circle cx="16" cy="22" r="1.8" strokeWidth={2} />
      <path d="M5 26h22" />
    </Svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Svg gradientId="ico-settings" {...props}>
      <circle cx="16" cy="16" r="4" />
      <path d="M16 3.5v3.2M16 25.3v3.2M28.5 16h-3.2M6.7 16H3.5M24.8 7.2l-2.3 2.3M9.5 22.5l-2.3 2.3M24.8 24.8l-2.3-2.3M9.5 9.5 7.2 7.2" />
    </Svg>
  );
}

export const TOOL_ICONS = {
  image: IconImage,
  video: IconVideo,
  voice: IconVoice,
  transcript: IconTranscript,
  chat: IconChat,
  portrait: IconPortrait,
  avatar: IconAvatar,
  translate: IconTranslate,
  builder: IconBuilder,
} as const;

export type ToolIconKey = keyof typeof TOOL_ICONS;
