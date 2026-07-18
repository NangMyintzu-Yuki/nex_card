"use client";

import { useEffect, useRef, useCallback } from "react";

type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

/**
 * Observes a single element and adds `sr-visible` when it enters the viewport.
 * Use this on individual elements that should reveal themselves.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -40px 0px", once = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      el.classList.add("sr-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("sr-visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * Observes a container and reveals ALL `.sr-item` descendants when the
 * container enters the viewport. Each `.sr-item` gets `sr-visible` added
 * with staggered delays based on its position among siblings.
 *
 * IMPORTANT: The ref must be on a PARENT element that contains all the
 * `.sr-item` elements you want to animate.
 */
export function useScrollRevealChildren<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const { threshold = 0.05, rootMargin = "0px 0px -20px 0px", once = true } = options;
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (!("IntersectionObserver" in window)) {
      container.querySelectorAll(".sr-item").forEach((el) => {
        el.classList.add("sr-visible");
      });
      return;
    }

    let revealed = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !revealed) {
            revealed = true;
            container.querySelectorAll(".sr-item").forEach((el) => {
              el.classList.add("sr-visible");
            });
            if (once) observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref as React.RefObject<T>;
}
