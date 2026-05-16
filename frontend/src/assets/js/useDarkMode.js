import { useState, useEffect } from "react";

const STORAGE_KEY = "xeflow-theme";
const DARK_CLASS = "dark";
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

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setIsDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
