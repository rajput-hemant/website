import * as React from "react";

import { excerpt } from "@/lib/ask/format";

import { ogColors, ogFonts } from "./theme";

/*
 * Layouts for next/og (Satori): flexbox only, inline styles, px units, and
 * every element with more than one child needs `display: flex`.
 */

const PADDING_X = 80;
const PADDING_Y = 72;

function Wordmark({ name, size }: { name: string; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: ogFonts.serif,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: size * -0.02,
        color: ogColors.ink,
      }}
    >
      {name}
      <span style={{ color: ogColors.accent }}>.</span>
    </div>
  );
}

const metaText: React.CSSProperties = {
  fontFamily: ogFonts.mono,
  fontSize: 20,
  letterSpacing: 1.6,
  textTransform: "uppercase",
  color: ogColors.subtle,
};

function Footer({ left, right }: { left: string; right?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 32,
        paddingTop: 28,
        borderTop: `1.5px solid ${ogColors.border}`,
        ...metaText,
      }}
    >
      <span>{left}</span>
      {right && <span>{right}</span>}
    </div>
  );
}

function Frame({
  header,
  children,
  footer,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: `${PADDING_Y}px ${PADDING_X}px`,
        backgroundColor: ogColors.paper,
        color: ogColors.ink,
        fontFamily: ogFonts.sans,
      }}
    >
      {header}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}

function Lede({ children, size = 40 }: { children: string; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        marginTop: 32,
        maxWidth: 900,
        fontSize: size,
        lineHeight: 1.3,
        color: ogColors.muted,
      }}
    >
      {children}
    </div>
  );
}

export type SiteCardProps = {
  name: string;
  headline: string;
  /** Host and path shown in the footer, e.g. `rajputhemant.dev`. */
  url: string;
  /** A data URL. With it the avatar leads and the name is set smaller. */
  avatar?: { src: string; alt: string } | null;
};

/** The site-wide image: the wordmark large, or avatar left with name and headline right. */
export function SiteCard({ name, headline, url, avatar }: SiteCardProps) {
  return (
    <Frame footer={<Footer left={url} />}>
      {avatar ? (
        <div style={{ display: "flex", alignItems: "center", gap: 64 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img
            src={avatar.src}
            alt={avatar.alt}
            width={272}
            height={272}
            style={{
              borderRadius: 9999,
              border: `1.5px solid ${ogColors.border}`,
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Wordmark name={name} size={104} />
            <Lede size={36}>{headline}</Lede>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Wordmark name={name} size={144} />
          <Lede>{headline}</Lede>
        </div>
      )}
    </Frame>
  );
}

export type PageCardProps = {
  siteName: string;
  title: string;
  description: string;
  url: string;
};

/** A section page: small wordmark, the page title large, its description beneath. */
export function PageCard({ siteName, title, description, url }: PageCardProps) {
  return (
    <Frame
      header={<Wordmark name={siteName} size={40} />}
      footer={<Footer left={url} />}
    >
      <div
        style={{
          display: "flex",
          fontFamily: ogFonts.serif,
          fontWeight: 500,
          fontSize: 136,
          lineHeight: 1,
          letterSpacing: -2.7,
        }}
      >
        {title}
      </div>
      <Lede>{description}</Lede>
    </Frame>
  );
}

export type QuestionCardProps = {
  siteName: string;
  question: string;
  /** e.g. `Asked by Sam · Sep 25, 2026`. */
  meta: string;
  url: string;
};

const QUESTION_MAX_LENGTH = 200;

/** A pull quote in a serif italic wants typographic apostrophes. */
const typographicApostrophes = (text: string) =>
  text.replace(/(\p{L})'(\p{L})/gu, "$1\u2019$2");

/** Reuses `excerpt`'s word-boundary trim, plus the pull quote's own apostrophes. */
export function clampQuestion(text: string): string {
  return excerpt(typographicApostrophes(text), QUESTION_MAX_LENGTH);
}

function questionSize(length: number): number {
  if (length <= 70) return 72;
  if (length <= 130) return 60;
  return 50;
}

/** An /ask permalink: the visitor's question as a pull quote. */
export function QuestionCard({
  siteName,
  question,
  meta,
  url,
}: QuestionCardProps) {
  const text = clampQuestion(question);

  return (
    <Frame
      header={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Wordmark name={siteName} size={40} />
          <span style={{ ...metaText, color: ogColors.accent }}>Ask</span>
        </div>
      }
      footer={<Footer left={meta} right={url} />}
    >
      <div
        style={{
          display: "flex",
          maxWidth: 1000,
          fontFamily: ogFonts.serifItalic,
          fontStyle: "italic",
          fontSize: questionSize(text.length),
          lineHeight: 1.15,
          letterSpacing: -0.5,
          color: ogColors.ink,
        }}
      >
        {`“${text}”`}
      </div>
    </Frame>
  );
}
