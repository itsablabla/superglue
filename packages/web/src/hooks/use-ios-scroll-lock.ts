"use client";

import { useEffect } from "react";

function isScrollableElement(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const isScrollable = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
  return isScrollable && el.scrollHeight > el.clientHeight;
}

function findScrollableParent(target: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = target;
  while (el && el !== document.body && el !== document.documentElement) {
    if (isScrollableElement(el)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export function useIOSScrollLock(): void {
  useEffect(() => {
    let startY = 0;

    function handleTouchStart(e: TouchEvent): void {
      startY = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent): void {
      const target = e.target as HTMLElement;
      if (!target) return;

      const scrollable = findScrollableParent(target);

      if (!scrollable) {
        e.preventDefault();
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const atTop = scrollable.scrollTop <= 0;
      const atBottom =
        scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

      if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
        e.preventDefault();
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);
}
