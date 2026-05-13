"use client";

import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import Link from "next/link";
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";

import { cn } from "@/lib/utils";

interface GalleryCard {
  name: string;
  href: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

function GalleryItem({ card, index }: Readonly<{ card: GalleryCard; index: number }>) {
  const reduceMotion = useReducedMotion();
  const hasFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [isActive, setIsActive] = useState(false);
  const targetX = useRef(50);
  const targetY = useRef(30);
  const rafRef = useRef<number | null>(null);

  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(30);
  const glowOpacity = useMotionValue(0);

  const smoothX = useSpring(cursorX, { stiffness: 220, damping: 26, mass: 0.65 });
  const smoothY = useSpring(cursorY, { stiffness: 220, damping: 26, mass: 0.65 });
  const smoothOpacity = useSpring(glowOpacity, { stiffness: 200, damping: 24, mass: 0.7 });
  const spotlight = useMotionTemplate`radial-gradient(380px circle at ${smoothX}% ${smoothY}%, rgba(56,189,248,0.28), transparent 58%)`;

  const trackingEnabled = hasFinePointer && !reduceMotion;

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!trackingEnabled) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      targetX.current = ((event.clientX - rect.left) / rect.width) * 100;
      targetY.current = ((event.clientY - rect.top) / rect.height) * 100;
    },
    [trackingEnabled],
  );

  useEffect(() => {
    if (!trackingEnabled) {
      cursorX.set(50);
      cursorY.set(30);
      return;
    }

    const loop = () => {
      const nextX = cursorX.get() + (targetX.current - cursorX.get()) * 0.16;
      const nextY = cursorY.get() + (targetY.current - cursorY.get()) * 0.16;
      cursorX.set(nextX);
      cursorY.set(nextY);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [cursorX, cursorY, trackingEnabled]);

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: index * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4, rotateX: 0.6, scale: 1.01 }}
      onPointerMove={onPointerMove}
      onPointerEnter={() => {
        setIsActive(true);
        glowOpacity.set(trackingEnabled ? 1 : 0.5);
      }}
      onPointerLeave={() => {
        setIsActive(false);
        glowOpacity.set(0);
      }}
      onFocus={() => {
        setIsActive(true);
        glowOpacity.set(0.7);
      }}
      onBlur={() => {
        setIsActive(false);
        glowOpacity.set(0);
      }}
      tabIndex={0}
      className={cn(
        "group relative min-h-[220px] overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(165deg,rgba(9,11,20,0.92),rgba(14,23,42,0.9))] p-6 shadow-[0_10px_30px_rgba(2,6,23,0.28)] outline-none transition-shadow duration-300",
        "hover:shadow-[0_20px_45px_rgba(2,6,23,0.42)] focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: smoothOpacity,
          background: spotlight,
        }}
      />

      {!trackingEnabled && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(56,189,248,0.14),transparent_48%),radial-gradient(circle_at_85%_0%,rgba(99,102,241,0.16),transparent_40%)]"
        />
      )}

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          {card.icon}
        </div>
        <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative z-10 mt-4 space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-white">{card.name}</h3>
        <p className="text-sm leading-6 text-slate-300">{card.description}</p>
      </div>

      <div className="relative z-10 mt-5 aspect-4/3 overflow-hidden rounded-2xl border border-white/10 bg-black/35">
        <div className="flex h-full w-full items-center justify-center p-4">{card.children}</div>
      </div>

      <div className="relative z-10 mt-4">
        <Link
          href={card.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300 transition-colors hover:text-sky-200"
        >
          View component
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        animate={
          reduceMotion || !isActive
            ? { opacity: 0 }
            : { opacity: [0.05, 0.12, 0.05], scale: [1, 1.015, 1] }
        }
        transition={{ duration: 3.2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
        style={{
          background:
            "linear-gradient(130deg, rgba(56,189,248,0.12) 0%, rgba(99,102,241,0.05) 40%, rgba(56,189,248,0.1) 100%)",
        }}
      />
    </motion.article>
  );
}

const MemoGalleryItem = memo(GalleryItem);

export default function ComponentGallery({
  eyebrow,
  title,
  seeAllHref,
  cards,
  className,
}: Readonly<{
  eyebrow: string;
  title: string;
  seeAllHref: string;
  cards: GalleryCard[];
  className?: string;
}>) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.1),transparent_42%),radial-gradient(circle_at_88%_12%,rgba(129,140,248,0.08),transparent_36%)]"
      />
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              {eyebrow}
            </p>
            <h2 className="text-balance text-[clamp(30px,5vw,48px)] font-semibold tracking-[-0.03em] text-foreground">
              {title}
            </h2>
            <p className="max-w-xl text-[15px] leading-7 text-muted-foreground">
              Browse polished interaction patterns built for real products. Every block is tuned for
              accessibility, smooth motion, and practical implementation speed.
            </p>

            <div>
              <Link
                href={seeAllHref}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                See all components
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card, index) => (
              <MemoGalleryItem key={card.href} card={card} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
