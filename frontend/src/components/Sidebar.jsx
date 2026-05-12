import React, { useState } from "react";

/* ── SVG Nav Icons ───────────────────────────────────────────────────────── */
const Icons = {
  Overview: () => (
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
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="12" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="12" width="7" height="7" rx="1.5" />
      <rect x="12" y="12" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Invoices: () => (
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z" />
      <line x1="8" y1="9" x2="15" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  ),
  Customers: () => (
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Products: () => (
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 1 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Reports: () => (
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Settings: () => (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Help: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Logout: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

/* ── Nav data ─────────────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "Main Menu",
    items: [
      { id: "overview", label: "Overview", Icon: Icons.Overview },
      { id: "invoices", label: "Invoices", Icon: Icons.Invoices, badge: 14 },
      { id: "customers", label: "Customers", Icon: Icons.Customers },
      { id: "products", label: "Products", Icon: Icons.Products },
    ],
  },
  {
    label: "Analytics",
    items: [{ id: "reports", label: "Reports", Icon: Icons.Reports }],
  },
  {
    label: "System",
    items: [{ id: "settings", label: "Settings", Icon: Icons.Settings }],
  },
];

/* ── Single nav item ──────────────────────────────────────────────────────── */
function NavItem({ id, label, Icon, badge, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`
        group w-full flex items-center justify-between
        gap-3 px-3.5 py-2.5 rounded-xl
        text-sm font-semibold
        transition-all duration-200
        cursor-pointer
        ${
          isActive
            ? "bg-xeflow-brand text-white shadow-md shadow-xeflow-brand/25"
            : "text-xeflow-muted hover:text-xeflow-text hover:bg-xeflow-brand/6"
        }
      `}
    >
      <span className="flex items-center gap-3">
        {/* Icon container */}
        <span
          className={`
            w-8 h-8 flex items-center justify-center rounded-lg shrink-0
            transition-colors duration-200
            ${
              isActive
                ? "bg-white/15"
                : "bg-xeflow-bg group-hover:bg-xeflow-brand/10"
            }
          `}
        >
          <Icon />
        </span>
        {label}
      </span>

      {/* Badge */}
      {badge != null && (
        <span
          className={`
            text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[1.25rem] text-center
            ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-xeflow-brand/12 text-xeflow-brand"
            }
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
export default function Sidebar({ isOpen }) {
  const [activeId, setActiveId] = useState("overview");

  return (
    <aside
      className={`
        flex flex-col bg-xeflow-surface
        transition-all duration-300 ease-in-out
        z-50 overflow-hidden flex-shrink-0
        ${isOpen ? "w-[272px] border-r border-xeflow-border" : "w-0 border-r-0"}
      `}
    >
      {/* Inner wrapper — fixed width so content never squishes */}
      <div className="w-[272px] flex flex-col h-full overflow-hidden">
        {/* ── Logo ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 h-[72px] px-6 border-b border-xeflow-border shrink-0">
          {/* Logo mark */}
          <div
            className="
              w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              bg-gradient-to-br from-xeflow-brand to-xeflow-electric
              shadow-md shadow-xeflow-brand/30
            "
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
              <path
                d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-[1.1rem] font-black tracking-tight text-xeflow-text uppercase leading-none">
              Xe<span className="text-xeflow-brand">Flow</span>
            </h1>
            <p className="text-[10px] text-xeflow-muted font-semibold tracking-wider mt-0.5">
              Finance Suite
            </p>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3.5 text-[10px] font-bold text-xeflow-muted uppercase tracking-[0.1em] mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ id, label, Icon, badge }) => (
                  <NavItem
                    key={id}
                    id={id}
                    label={label}
                    Icon={Icon}
                    badge={badge}
                    isActive={activeId === id}
                    onClick={setActiveId}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom section ────────────────────────────────────── */}
        <div className="px-3 pb-5 shrink-0 space-y-2 border-t border-xeflow-border pt-3">
          {/* Help + Logout quick-links */}
          <div className="flex gap-1.5">
            <button
              className="
                flex-1 flex items-center justify-center gap-2
                py-2.5 rounded-xl text-xs font-semibold
                text-xeflow-muted hover:text-xeflow-text
                bg-xeflow-bg hover:bg-xeflow-brand/6
                border border-xeflow-border
                transition-all duration-200
              "
            >
              <Icons.Help />
              Help
            </button>
            <button
              className="
                flex-1 flex items-center justify-center gap-2
                py-2.5 rounded-xl text-xs font-semibold
                text-xeflow-muted hover:text-red-500
                bg-xeflow-bg hover:bg-red-500/6
                border border-xeflow-border
                transition-all duration-200
              "
            >
              <Icons.Logout />
              Sign out
            </button>
          </div>

          {/* User card */}
          <div
            className="
              flex items-center gap-3 p-3 rounded-xl
              bg-xeflow-bg border border-xeflow-border
              cursor-pointer
              hover:border-xeflow-brand/30
              transition-all duration-200 group
            "
          >
            <div
              className="
                w-9 h-9 rounded-full shrink-0
                bg-gradient-to-br from-xeflow-brand to-xeflow-electric
                flex items-center justify-center
                text-white text-xs font-extrabold
                ring-2 ring-xeflow-brand/20
                shadow-sm
              "
            >
              IR
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <p className="text-sm font-bold text-xeflow-text truncate">
                Irfan
              </p>
              <p className="text-[10px] text-xeflow-muted font-medium truncate">
                irfan@xeflow.com
              </p>
            </div>
            {/* Online dot */}
            <span className="w-2 h-2 rounded-full bg-xeflow-success shrink-0 ring-2 ring-xeflow-bg" />
          </div>
        </div>
      </div>
    </aside>
  );
}
