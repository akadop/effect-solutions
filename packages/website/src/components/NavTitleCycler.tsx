"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface NavTitleCyclerProps {
  title: string;
  className?: string;
}

const TITLE_VARIANTS = {
  initial: {
    y: -24,
    opacity: 0.9,
    filter: "blur(6px)",
  },
  animate: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: {
    y: 24,
    opacity: 0.9,
    filter: "blur(6px)",
  },
} as const;

export function NavTitleCycler({ title, className }: NavTitleCyclerProps) {
  const [renderedTitle, setRenderedTitle] = useState(title);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (title === renderedTitle) {
      return;
    }

    setRenderedTitle(title);
    setAnimationKey((key) => key + 1);
  }, [title, renderedTitle]);

  return (
    <div className={cn("relative flex-1 min-w-0", className)}>
      <div
        className="relative px-1.5 py-1"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)",
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={animationKey}
            layout="position"
            variants={TITLE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              visualDuration: 0.4,
              bounce: 0.3,
            }}
            className="block leading-tight will-change-transform"
          >
            {renderedTitle}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
