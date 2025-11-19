"use client";

import { useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useTonePlayer } from "@/lib/useTonePlayer";

interface CodeCopyButtonProps {
  value: string;
  className?: string;
}

export function CodeCopyButton({ value, className }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { playTone } = useTonePlayer();

  async function handleCopy(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();

    const text = value.trim();

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      playTone({ frequency: 780, duration: 0.1, volume: 0.05 });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "pointer-events-auto absolute top-3 right-3 flex items-center border border-neutral-700/80 bg-neutral-950/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-neutral-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 hover:text-white hover:border-neutral-500",
        copied && "text-emerald-300 border-emerald-400/70",
        className,
      )}
      aria-label="Copy code snippet"
      onClick={handleCopy}
      onMouseEnter={() => {
        if (!hovered) {
          playTone({ frequency: 520, duration: 0.06, volume: 0.035 });
          setHovered(true);
        }
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "copied" : "copy"}
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="flex items-center gap-1.5"
        >
          {copied ? (
            <Check size={14} weight="bold" />
          ) : (
            <Copy size={14} weight="bold" />
          )}
          <span aria-live="polite">{copied ? "COPIED" : "COPY"}</span>
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
