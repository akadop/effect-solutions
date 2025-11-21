"use client";

import {
  ArrowLeftIcon,
  BriefcaseIcon,
  GithubLogo,
  SpeakerSimpleHighIcon,
  SpeakerSimpleSlashIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FocusEvent, useCallback, useState } from "react";
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx";
import { normalizeDocSlug } from "@/lib/normalizeDocSlug";
import { useSoundSettings } from "@/lib/useSoundSettings";
import { NavTitleCycler } from "./NavTitleCycler";

interface DocHeaderProps {
  docTitles: Record<string, string>;
}

const iconAnimationConfig = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.5,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.5,
    filter: "blur(4px)",
  },
  transition: { type: "spring" as const, visualDuration: 0.2, bounce: 0 },
};

export function DocHeader({ docTitles }: DocHeaderProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverAnimationId, setHoverAnimationId] = useState(0);
  const {
    handleHover: playHoverSfx,
    handleClick: playClickSfx,
    handleFocusVisible,
  } = useLessonSfxHandlers();
  const { isMuted, toggleMute } = useSoundSettings();

  const updateHoverState = useCallback((nextHovered: boolean) => {
    setIsHovered((previous) => {
      if (previous === nextHovered) {
        return previous;
      }
      setHoverAnimationId((id) => id + 1);
      return nextHovered;
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    updateHoverState(true);
    playHoverSfx();
  }, [playHoverSfx, updateHoverState]);

  const handleMouseLeave = useCallback(() => {
    updateHoverState(false);
  }, [updateHoverState]);

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      updateHoverState(true);
      if (event.currentTarget.matches(":focus-visible")) {
        handleFocusVisible();
      }
    },
    [handleFocusVisible, updateHoverState],
  );

  const handleBlur = useCallback(() => {
    updateHoverState(false);
  }, [updateHoverState]);

  const handleClick = useCallback(() => {
    playClickSfx();
  }, [playClickSfx]);

  const handleMuteButtonHover = useCallback(() => {
    playHoverSfx();
  }, [playHoverSfx]);

  let displayTitle = "EFFECT SOLUTIONS";

  const isDocsListPage = pathname === "/";

  // Check if we're on a specific doc page
  if (pathname !== "/" && !pathname.startsWith("/_")) {
    const slug = pathname.slice(1);
    const docTitle = docTitles[normalizeDocSlug(slug)];
    if (docTitle) {
      displayTitle = docTitle;
    }
  }

  const iconKey = `${
    isHovered && !isDocsListPage ? "arrow" : "book"
  }-${hoverAnimationId}`;

  return (
    <header className="relative h-16 lg:sticky lg:top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur bottom-0 border-b border-neutral-800">
      {/* <div
        className="absolute bottom-0 border-b border-neutral-800"
        style={{
          left: "calc(-50vw + 50%)",
          right: "calc(-50vw + 50%)",
          width: "100vw",
        }}
      /> */}
      <div className="max-w-screen-md mx-auto border-x border-neutral-800 flex items-center justify-between h-full">
        <Link
          href="/"
          className="group flex-1 cursor-default"
          onBlur={handleBlur}
          onClick={handleClick}
          onFocus={handleFocus}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center px-6 py-6 hover:bg-neutral-900/50">
            <div className="flex items-center text-sm font-normal uppercase tracking-wider">
              <div className="relative w-5 h-5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {isHovered && !isDocsListPage ? (
                    <motion.div
                      key={iconKey}
                      className="absolute inset-0"
                      style={{ willChange: "transform, opacity, filter" }}
                      {...iconAnimationConfig}
                    >
                      <ArrowLeftIcon
                        aria-hidden="true"
                        className="h-5 w-5"
                        weight="bold"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={iconKey}
                      className="absolute inset-0"
                      style={{ willChange: "transform, opacity, filter" }}
                      {...iconAnimationConfig}
                    >
                      <BriefcaseIcon
                        aria-hidden="true"
                        className="h-5 w-5"
                        // weight="fill"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-1.5 flex-1 leading-tight">
                <NavTitleCycler title={displayTitle} />
              </div>
            </div>
          </div>
        </Link>
        <a
          href="https://github.com/kitlangton/effect-solutions"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={handleMuteButtonHover}
          className="flex items-center justify-center h-16 w-16 py-6 border-l border-neutral-800 hover:bg-neutral-900/50"
          aria-label="View on GitHub"
        >
          <GithubLogo className="h-4 w-4" weight="regular" />
        </a>
        <button
          type="button"
          onClick={toggleMute}
          onMouseEnter={handleMuteButtonHover}
          className="flex items-center justify-center h-16 w-16 py-6 border-l border-neutral-800 hover:bg-neutral-900/50"
          aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? (
            <SpeakerSimpleSlashIcon className="h-4 w-4" weight="regular" />
          ) : (
            <SpeakerSimpleHighIcon className="h-4 w-4" weight="regular" />
          )}
        </button>
      </div>
    </header>
  );
}
