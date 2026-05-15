import  { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiCommand,
  FiArrowRight,
} from "react-icons/fi";

// ─── IMPORT YOUR API WRAPPER ───
import { fetchWithAuth } from "../js/api";

/* ── Dark-mode toggle pill ──────────────────────────────────────────────── */
function DarkModeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="
        relative shrink-0 flex items-center
        w-[3.25rem] h-7 rounded-full border cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xeflow-brand/50
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
      <span
        className="
          absolute top-0.5 w-6 h-6 rounded-full
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
        {isDark ? <FiSun size={12} /> : <FiMoon size={12} />}
      </span>
    </button>
  );
}

export default function Navbar({ toggleSidebar, isDark, toggleDarkMode }) {
  const navigate = useNavigate();

  // Command Palette States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modules, setModules] = useState([]);
  const searchInputRef = useRef(null);

  // 1. Fetch modules for the search palette
  useEffect(() => {
    const fetchNavModules = async () => {
      try {
        const res = await fetchWithAuth("/sidebar/", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setModules(data);
        else if (data && Array.isArray(data.modules)) setModules(data.modules);
      } catch (err) {
        console.error("Error fetching modules for search:", err);
      }
    };
    fetchNavModules();
  }, []);

  // 2. Flatten modules so parent AND children are all individually searchable
  const searchableItems = useMemo(() => {
    let items = [];
    modules.forEach((m) => {
      if (!m.children || m.children.length === 0) {
        items.push({ name: m.name, url: m.url, type: "Module" });
      } else {
        // If it has children, add the children to the search list
        m.children.forEach((c) => {
          items.push({
            name: `${m.name} > ${c.name}`,
            url: c.url,
            type: "Page",
          });
        });
      }
    });
    return items;
  }, [modules]);

  // 3. Filter items based on user input
  const filteredItems = searchableItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 4. Listen for Ctrl+K / Cmd+K to open the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 50);
    } else {
      setSearchQuery(""); // Clear search when closed
    }
  }, [isSearchOpen]);

  const handleNavigate = (url) => {
    if (url && url !== "#") {
      navigate(url);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className="
          sticky top-4 z-40 mx-4 md:mx-8
          flex items-center justify-between
          px-5 py-3.5 gap-4
          rounded-2xl
          bg-xeflow-surface/70 backdrop-blur-xl
          border border-xeflow-border/50
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          transition-all duration-300
        "
      >
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="
              shrink-0 w-10 h-10
              flex items-center justify-center rounded-xl
              bg-xeflow-bg border border-xeflow-border
              text-xeflow-muted
              hover:text-xeflow-brand hover:border-xeflow-brand/40 hover:bg-xeflow-brand/5
              active:scale-95 transition-all duration-200 cursor-pointer shadow-sm
            "
          >
            <FiMenu size={18} />
          </button>

          <div className="hidden sm:block min-w-0">
            <h2 className="text-xl font-black text-xeflow-text tracking-tight truncate">
              XE<span className="text-xeflow-brand">FLOW</span>
            </h2>
          </div>
        </div>

        {/* ── RIGHT: Controls ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Fake Search Input (Triggers Modal) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="
              flex items-center justify-between gap-3
              bg-xeflow-bg border border-xeflow-border
              rounded-xl px-3 py-2 w-40 md:w-64
              text-xeflow-muted hover:border-xeflow-brand/50 hover:bg-xeflow-surface
              transition-all duration-200 group shadow-inner cursor-text
            "
          >
            <div className="flex items-center gap-2">
              <FiSearch
                size={16}
                className="opacity-60 group-hover:text-xeflow-brand transition-colors"
              />
              <span className="text-sm placeholder:text-xeflow-muted/70 whitespace-nowrap">
                Search...
              </span>
            </div>
            <kbd className="hidden md:flex items-center gap-1 text-[10px] font-bold text-xeflow-muted/60 border border-xeflow-border rounded-md px-1.5 py-1 bg-xeflow-surface leading-none select-none">
              <FiCommand size={10} /> K
            </kbd>
          </button>

          <div className="w-px h-6 bg-xeflow-border mx-1 shrink-0 hidden md:block" />

          {/* Notification bell */}
          <button
            aria-label="Notifications"
            className="
              relative shrink-0 w-10 h-10
              flex items-center justify-center rounded-xl
              text-xeflow-muted bg-xeflow-bg border border-transparent
              hover:text-xeflow-text hover:border-xeflow-border hover:shadow-sm
              active:scale-95 transition-all duration-200
            "
          >
            <FiBell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-xeflow-bg" />
          </button>

          {/* Dark mode toggle */}
          <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />

          <div className="w-px h-6 bg-xeflow-border mx-1 shrink-0 hidden sm:block" />

          {/* Profile */}
          <button
            className="
              flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl
              hover:bg-xeflow-bg border border-transparent hover:border-xeflow-border
              active:scale-95 transition-all duration-200 cursor-pointer
            "
          >
            <div className="w-9 h-9 rounded-full shrink-0 bg-gradient-to-br from-xeflow-brand to-xeflow-electric flex items-center justify-center text-white text-xs font-extrabold ring-2 ring-xeflow-brand/20 shadow-md">
              IR
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-sm font-bold text-xeflow-text">Irfan</p>
              <p className="text-[10px] text-xeflow-brand font-bold uppercase tracking-wider">
                Admin
              </p>
            </div>
            <FiChevronDown
              size={16}
              className="hidden lg:block text-xeflow-muted opacity-60"
            />
          </button>
        </div>
      </header>

      {/* ── COMMAND PALETTE MODAL ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
          {/* Blurred Backdrop */}
          <div
            className="absolute inset-0 bg-xeflow-bg/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-xeflow-surface rounded-2xl shadow-2xl border border-xeflow-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input Area */}
            <div className="flex items-center px-4 py-4 border-b border-xeflow-border bg-xeflow-bg/50">
              <FiSearch size={22} className="text-xeflow-brand mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Where do you want to go?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-lg text-xeflow-text placeholder:text-xeflow-muted"
              />
              <kbd className="hidden md:flex items-center text-[10px] font-bold text-xeflow-muted/60 border border-xeflow-border rounded-md px-2 py-1 bg-xeflow-surface uppercase">
                ESC
              </kbd>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigate(item.url)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-xeflow-brand/10 hover:text-xeflow-brand text-left transition-colors group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xeflow-text group-hover:text-xeflow-brand transition-colors">
                        {item.name}
                      </span>
                      <span className="text-xs text-xeflow-muted mt-0.5">
                        {item.type}
                      </span>
                    </div>
                    <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-xeflow-brand" />
                  </button>
                ))
              ) : (
                <div className="py-14 text-center text-xeflow-muted">
                  <FiSearch size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">
                    No modules found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-xeflow-border bg-xeflow-bg/50 text-xs text-xeflow-muted flex items-center justify-between">
              <span>Search modules, pages, and settings.</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <FiArrowRight size={10} /> to select
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
