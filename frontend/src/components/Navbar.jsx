import React from "react";

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
const MenuIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="2" y1="4.5" x2="16" y2="4.5" />
    <line x1="2" y1="9" x2="10" y2="9" />
    <line x1="2" y1="13.5" x2="16" y2="13.5" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="6.5" cy="6.5" r="4.5" />
    <line x1="10.5" y1="10.5" x2="14" y2="14" />
  </svg>
);

const BellIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 22 22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A7 7 0 0 0 4 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="2 4 6 8 10 4" />
  </svg>
);

const SunIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/* ── Dark-mode toggle pill ────────────────────────────────────────────────
   Self-contained — receives isDark + onToggle from parent (via useDarkMode).
   ─────────────────────────────────────────────────────────────────────── */
function DarkModeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="
        relative shrink-0
        flex items-center
        w-[3.25rem] h-7
        rounded-full
        border
        cursor-pointer
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-xeflow-brand/50
        transition-colors duration-300
      "
      style={{
        backgroundColor: isDark
          ? "color-mix(in srgb, var(--color-xeflow-brand) 18%, var(--color-xeflow-bg))"
          : "var(--color-xeflow-bg)",
        borderColor: isDark
          ? "color-mix(in srgb, var(--color-xeflow-brand) 40%, transparent)"
          : "var(--color-xeflow-border)",
      }}
    >
      {/* Sliding knob */}
      <span
        className="
          absolute top-0.5
          w-6 h-6 rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        "
        style={{
          left: isDark ? "calc(100% - 1.625rem)" : "2px",
          background: isDark
            ? "var(--color-xeflow-brand)"
            : "var(--color-xeflow-surface)",
          color: isDark ? "#ffffff" : "var(--color-xeflow-muted)",
          boxShadow: isDark
            ? "0 2px 8px color-mix(in srgb, var(--color-xeflow-brand) 45%, transparent)"
            : "0 1px 4px rgba(0,0,0,0.14)",
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}

/* ── Navbar ──────────────────────────────────────────────────────────────
 *
 * Props
 * ─────
 *   toggleSidebar  — () => void
 *   isDark         — boolean        ← from useDarkMode()
 *   toggleDarkMode — () => void     ← from useDarkMode()
 *
 * Wiring in your App / layout root:
 * ──────────────────────────────────
 *   import { useDarkMode }  from "./useDarkMode";
 *   import Navbar           from "./Navbar";
 *
 *   function App() {
 *     const { isDark, toggle } = useDarkMode();
 *     return (
 *       <Navbar
 *         toggleSidebar={handleSidebar}
 *         isDark={isDark}
 *         toggleDarkMode={toggle}
 *       />
 *     );
 *   }
 * ─────────────────────────────────────────────────────────────────────── */
export default function Navbar({ toggleSidebar, isDark, toggleDarkMode }) {
  return (
    <header
      className="
        sticky top-3 z-40 mx-3 md:mx-6
        flex items-center justify-between
        px-4 py-3 gap-3
        rounded-2xl
        bg-xeflow-surface/80 backdrop-blur-2xl
        border border-xeflow-border
        shadow-sm
        transition-colors duration-300
      "
    >
      {/* ── LEFT: Hamburger + Breadcrumb ─────────────────────────── */}

      
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="
            shrink-0 w-9 h-9
            flex items-center justify-center rounded-xl
            bg-xeflow-bg border border-xeflow-border
            text-xeflow-muted
            hover:text-xeflow-brand hover:border-xeflow-brand/40
            hover:bg-xeflow-brand/8
            active:scale-95
            transition-all duration-200 cursor-pointer
          "
        >
          <MenuIcon />

        </button>

        <div className="hidden sm:block min-w-0">
          <h2 className="text-xl font-bold text-xeflow-text tracking-tight truncate">
            Main Dashboard
          </h2>
        </div>
      </div>

      {/* ── RIGHT: Controls pill ─────────────────────────────────── */}
      <div
        className="
          flex items-center gap-1
          bg-xeflow-bg border border-xeflow-border
          rounded-2xl px-2 py-1.5
          shadow-inner transition-colors duration-300
        "
      >
        {/* Search */}
        <div
          className="
            flex items-center gap-2
            bg-xeflow-surface border border-xeflow-border/60
            rounded-xl px-3 py-2 mr-1
            text-xeflow-muted
            focus-within:border-xeflow-brand/50
            focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-xeflow-brand)_10%,transparent)]
            transition-all duration-200
          "
        >
          <span className="shrink-0 opacity-60">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search…"
            className="
              bg-transparent border-none outline-none
              text-sm text-xeflow-text w-24 md:w-36
              placeholder:text-xeflow-muted/70
            "
          />
          <kbd className="hidden md:inline-flex items-center text-[10px] font-semibold text-xeflow-muted/50 border border-xeflow-border rounded-md px-1.5 py-0.5 bg-xeflow-bg leading-none select-none shrink-0">
            ⌘K
          </kbd>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-xeflow-border mx-1 shrink-0" />

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="
            relative shrink-0 w-9 h-9
            flex items-center justify-center rounded-xl
            text-xeflow-muted
            hover:text-xeflow-brand hover:bg-xeflow-brand/8
            active:scale-95 transition-all duration-200
          "
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-xeflow-bg" />
        </button>

        {/* ── Dark mode toggle ──────────────────────────────────── */}
        <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />

        {/* Divider */}
        <div className="w-px h-6 bg-xeflow-border mx-1 shrink-0" />

        {/* Profile */}
        <button
          aria-label="User menu"
          className="
            flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl
            hover:bg-xeflow-brand/8
            active:scale-95 transition-all duration-200 cursor-pointer
          "
        >
          <div
            className="
              w-8 h-8 rounded-full shrink-0
              bg-gradient-to-br from-xeflow-brand to-xeflow-electric
              flex items-center justify-center
              text-white text-xs font-extrabold
              ring-2 ring-xeflow-brand/20
              shadow-md shadow-xeflow-brand/20
            "
          >
            IR
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-sm font-semibold text-xeflow-text">Irfan</p>
            <p className="text-[10px] text-xeflow-muted font-medium">Admin</p>
          </div>
          <span className="hidden lg:block text-xeflow-muted opacity-60">
            <ChevronIcon />
          </span>
        </button>
      </div>
    </header>
  );
}
