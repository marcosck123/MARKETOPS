"use client";
import { useEffect, useRef } from "react";

export type KeyboardHandlers = {
  onF1?: () => void;
  onF2?: () => void;
  onF3?: () => void;
  onF4?: () => void;
  onF12?: () => void;
  onEsc?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
};

export function useKeyboard(handlers: KeyboardHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const h = ref.current;
      if (h.enabled === false) return;

      switch (e.key) {
        case "F1":       e.preventDefault(); h.onF1?.();        break;
        case "F2":       e.preventDefault(); h.onF2?.();        break;
        case "F3":       e.preventDefault(); h.onF3?.();        break;
        case "F4":       e.preventDefault(); h.onF4?.();        break;
        case "F12":      e.preventDefault(); h.onF12?.();       break;
        case "Escape":                       h.onEsc?.();       break;
        case "ArrowUp":  e.preventDefault(); h.onArrowUp?.();   break;
        case "ArrowDown":e.preventDefault(); h.onArrowDown?.(); break;
        case "Enter":                        h.onEnter?.();     break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []); // handlers accessed via ref — dependency array intentionally empty
}
