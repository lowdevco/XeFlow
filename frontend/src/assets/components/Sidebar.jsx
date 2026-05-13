import  { useState, useEffect   } from "react";
import { Link, useLocation } from "react-router-dom";


const defaultIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="12" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="12" width="7" height="7" rx="1.5" /><rect x="12" y="12" width="7" height="7" rx="1.5" /></svg>`;

/* ── SVG Nav Icons ───────────────────────────────────────────────────────── */
const Icons = {
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
        </span>
      )}
    </button>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
export default function Sidebar({ isOpen }) {
  const [activeId, setActiveId] = useState("overview");
  const [modules, setModules] = useState([]);
  const [openDrawerId, setOpenDrawerId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/sidebar/")
      .then((res) => res.json())
      .then((data) => setModules(data))
      .catch((err) => console.error("Error fetching sidebar data:", err));
  }, []);

  const toggleDrawer = (moduleId) => {
    setOpenDrawerId(openDrawerId === moduleId ? null : moduleId);
  };

  return (
    <aside
      className={`
        flex flex-col bg-xeflow-surface
        transition-all duration-300 ease-in-out
        z-50 overflow-hidden flex-shrink-0
        ${isOpen ? "w-[310px] border-r border-xeflow-border" : "w-0 border-r-0"}
      `}
    >
      {/* Inner wrapper — fixed width so content never squishes */}
      <div className="w-[310px] flex flex-col h-full overflow-hidden">
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
            <h1 className="text-[1.8rem] font-black tracking-tight text-xeflow-text uppercase leading-none">
              Xe<span className="text-xeflow-brand">Flow</span>
            </h1>
            {/* <p className="text-[12px] text-xeflow-muted font-semibold tracking-wider mt-0.5">
              Finance Suite
            </p> */}
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto space-y-1 custom-scrollbar">
          {modules.map((module) => {
            const hasChildren = module.children && module.children.length > 0;
            const isDrawerOpen = openDrawerId === module.id;
            const isActive =
              location.pathname === module.url ||
              (hasChildren &&
                module.children.some(
                  (child) => location.pathname === child.url,
                ));

            // Use the database SVG, or the fallback if empty
            const svgContent = module.icon ? module.icon : defaultIconSvg;

            return (
              <div key={module.id} className="mb-1" className="mb-3">
                {hasChildren ? (
                  <button
                    onClick={() => toggleDrawer(module.id)}
                    className={`group w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-md font-semibold transition-all duration-200 cursor-pointer ${isActive ? "bg-xeflow-brand text-white shadow-md shadow-xeflow-brand/25" : "text-xeflow-muted hover:text-xeflow-text hover:bg-xeflow-brand/6"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-200 [&>svg]:w-[17px] [&>svg]:h-[17px] ${isActive ? "bg-white/15" : "bg-xeflow-bg group-hover:bg-xeflow-brand/10"}`}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                      />
                      {module.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${isDrawerOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                ) : (
                  <Link
                    to={module.url || "#"}
                    onClick={() => setOpenDrawerId(null)}
                    className={`group w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-md font-semibold transition-all duration-200 cursor-pointer ${isActive ? "bg-xeflow-brand text-white shadow-md shadow-xeflow-brand/25" : "text-xeflow-muted hover:text-xeflow-text hover:bg-xeflow-brand/6"}`}
                  >
                    <span className="flex items-center gap-3">
                      {/* MAGIC CSS HERE: [&>svg] forces whatever SVG you inject to be 17x17px */}
                      <span
                        className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-200 [&>svg]:w-[17px] [&>svg]:h-[17px] ${isActive ? "bg-white/15" : "bg-xeflow-bg group-hover:bg-xeflow-brand/10"}`}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                      />
                      {module.name}
                    </span>
                  </Link>
                )}

                {/* Sub-Tabs (Children Drawer) */}
                {hasChildren && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isDrawerOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                  >
                    <ul className="pl-[3.20rem] pr-3 space-y-0.5 flex flex-col relative before:absolute before:left-[1.8rem] before:top-2 before:bottom-2 before:w-[1px] before:bg-xeflow-border">
                      {module.children.map((child) => {
                        const isChildActive = location.pathname === child.url;
                        return (
                          <li key={child.id}>
                            <Link
                              to={child.url || "#"}
                              className={`relative block text-md py-2 font-semibold transition-colors hover:text-xeflow-brand ${isChildActive ? "text-xeflow-brand" : "text-xeflow-muted"}`}
                            >
                              {isChildActive && (
                                <span className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-xeflow-brand border-[3px] border-xeflow-surface box-content shadow-[0_0_0_1px_var(--color-xeflow-brand)]"></span>
                              )}
                              {child.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
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
