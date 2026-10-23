"use client";

import { useEffect, useId, useRef, useState } from "react";

const spreads = [
  {
    src: "/assets/spread-night-flight-v2.webp",
    alt: "An open spread from Ella’s Night Flight: Ella flies through the treetops while Mo waves from the woodland floor",
  },
  {
    src: "/assets/spread-moonlit-hilltop.webp",
    alt: "An open spread from Ella’s Night Flight: Mo and Ella stand together on a hilltop overlooking the moonlit woodland and a trail of glowbugs",
  },
];

export function StorySpreads() {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<boolean[]>([false, false]);
  const ready = loaded.every(Boolean);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    if (root.current) observer.observe(root.current);

    return () => {
      media.removeEventListener("change", updateMotion);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inView || !ready || reducedMotion || hovered || paused) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setActive((current) => (current + 1) % spreads.length);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [inView, ready, reducedMotion, hovered, paused]);

  function selectSpread(index: number) {
    setPaused(true);
    setActive(index);
  }

  return (
    <div
      className="story-art story-carousel"
      ref={root}
      role="group"
      aria-roledescription="carousel"
      aria-label="Inside Ella’s Night Flight"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <div className="story-spreads" aria-live={paused ? "polite" : "off"}>
        {spreads.map((spread, index) => (
          <figure
            key={spread.src}
            id={`${id}-spread-${index}`}
            className={`story-slide${active === index ? " is-active" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${spreads.length}`}
            aria-hidden={active !== index}
          >
            <img
              src={spread.src}
              alt={spread.alt}
              width="1859"
              height="846"
              loading="lazy"
              onLoad={() => setLoaded((current) => current.map((value, i) => i === index || value))}
            />
          </figure>
        ))}
      </div>
      <div className="story-dots" role="group" aria-label="Choose a story spread">
        {spreads.map((spread, index) => (
          <button
            key={spread.src}
            type="button"
            className="story-dot"
            aria-label={`Show spread ${index + 1}`}
            aria-pressed={active === index}
            aria-controls={`${id}-spread-${index}`}
            onClick={() => selectSpread(index)}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
