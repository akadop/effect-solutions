"use client";

import Link from "next/link";
import { type FocusEvent, useCallback } from "react";
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx";
import { EffectOrFooter } from "./EffectOrFooter";

interface DocListProps {
  docs: Array<{
    slug: string;
    title: string;
    description?: string;
    draft?: boolean;
  }>;
}

type DocGroup = "Setup" | "Core Patterns" | "Drafts";

const GROUP_DISPLAY_ORDER: DocGroup[] = ["Setup", "Core Patterns", "Drafts"];

const SETUP_SLUGS = new Set(["overview", "project-setup", "tsconfig"]);

function assignGroup(doc: { slug: string; draft?: boolean }): DocGroup {
  if (doc.draft) return "Drafts";
  if (SETUP_SLUGS.has(doc.slug)) return "Setup";
  return "Core Patterns";
}

export function DocList({ docs }: DocListProps) {
  const {
    handleHover: playHoverSfx,
    handleClick: playClickSfx,
    handleFocusVisible,
  } = useLessonSfxHandlers();

  const handleMouseEnter = useCallback(() => {
    playHoverSfx();
  }, [playHoverSfx]);

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      if (event.currentTarget.matches(":focus-visible")) {
        handleFocusVisible();
      }
    },
    [handleFocusVisible],
  );

  const handleClick = useCallback(() => {
    playClickSfx();
  }, [playClickSfx]);

  const grouped = docs.reduce<Record<DocGroup, typeof docs>>(
    (acc, doc) => {
      const group = assignGroup(doc);
      acc[group] = acc[group] ? [...acc[group], doc] : [doc];
      return acc;
    },
    {} as Record<DocGroup, typeof docs>,
  );

  return (
    <section>
      {GROUP_DISPLAY_ORDER.filter((group) => grouped[group]?.length).map(
        (group) => (
          <div key={group}>
            <div
              className="w-full h-6 border-b border-neutral-800 block"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgb(38, 38, 38) 8px, rgb(38, 38, 38) 9px)",
              }}
            />
            <div className="px-6 pb-2 pt-2 text-xs font-semibold tracking-[0.16em] uppercase text-neutral-500">
              {group}
            </div>
            <div className="border-t border-neutral-800" />

            {grouped[group]!.map((doc, index, arr) => (
              <div key={doc.slug}>
                <Link
                  href={`/${doc.slug}`}
                  className="block px-6 py-8 hover:bg-neutral-900/50 cursor-default"
                  onClick={handleClick}
                  onFocus={handleFocus}
                  onMouseEnter={handleMouseEnter}
                >
                  <article>
                    <div className="flex items-center gap-3">
                      <h2 className="text-[1.05rem] font-semibold uppercase leading-snug text-neutral-100">
                        {doc.title}
                      </h2>
                      {doc.draft && (
                        <span className="px-2 py-0.5 text-xs font-medium uppercase tracking-wide bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          Draft
                        </span>
                      )}
                    </div>

                    {doc.description && (
                      <p className="mt-3 text-[1.05rem] leading-relaxed text-neutral-300">
                        {doc.description}
                      </p>
                    )}
                  </article>
                </Link>
                {index < arr.length - 1 && (
                  <hr className="border-t border-neutral-800" />
                )}
              </div>
            ))}

            <div className="border-t border-neutral-800" />
          </div>
        ),
      )}
      <EffectOrFooter />
    </section>
  );
}
