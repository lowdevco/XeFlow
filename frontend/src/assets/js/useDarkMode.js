/**
 * useDarkMode.js
 *
 * Drop-in React hook that:
 *  1. Reads the saved preference from localStorage on first load
 *  2. Falls back to the OS/system colour-scheme if nothing is saved
 *  3. Applies / removes the `dark` class on <html>
 *  4. Persists every change back to localStorage
 *
 * Usage
 * ─────
 *   import { useDarkMode } from "./useDarkMode";
 *
 *   function App() {
 *     const { isDark, toggle } = useDarkMode();
 *     return <Navbar isDark={isDark} toggleDarkMode={toggle} />;
 *   }
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "xeflow-theme"; // key stored in localStorage
const DARK_CLASS = "dark"; // class toggled on <html>
function getInitialDark() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === "dark";
  } catch {
    /* localStorage unavailable (SSR / private mode) */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialDark);

  /* Apply / remove the class on <html> whenever isDark changes */
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      /* ignore write errors */
    }
  }, [isDark]);

  /* Keep the hook in sync if the user changes OS theme while the tab is open */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      /* Only follow OS changes if the user has NOT manually set a preference */
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setIsDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
