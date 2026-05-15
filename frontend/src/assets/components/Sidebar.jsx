import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../js/api";
import {
  FiHelpCircle,
  FiLogOut,
  FiLayout,
  FiChevronDown,
} from "react-icons/fi";

export default function Sidebar({ isOpen }) {
  const [modules, setModules] = useState([]);
  const [openDrawerId, setOpenDrawerId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ─── 1. SECURE FETCH WITH JWT & SAFE ARRAY CHECK ───
useEffect(() => {
  const fetchSidebar = async () => {
    try {
      const res = await fetchWithAuth("/sidebar/", { method: "GET" });

      if (!res.ok) throw new Error("Failed to fetch sidebar");

      const data = await res.json();

      if (Array.isArray(data)) {
        setModules(data);
      } else if (data && Array.isArray(data.modules)) {
        setModules(data.modules);
      } else {
        setModules([]);
      }
    } catch (err) {
      console.error("Error fetching sidebar data:", err);
      setModules([]);
    }
  };

  fetchSidebar();
}, []);

  // ─── 2. FIXED TOGGLE LOGIC ───
  const toggleDrawer = (e, moduleName) => {
    e.preventDefault(); // Stops the button from acting weird
    e.stopPropagation(); // Stops clicks from bleeding through
    setOpenDrawerId(openDrawerId === moduleName ? null : moduleName);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <aside
      className={`
        flex flex-col bg-xeflow-surface
        transition-all duration-300 ease-in-out
        relative z-[9999] 
        overflow-hidden flex-shrink-0
        ${isOpen ? "w-[310px] border-r border-xeflow-border" : "w-0 border-r-0"}
      `}
    >
      <div className="w-[310px] flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 h-[72px] px-6 border-b border-xeflow-border shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-xeflow-brand to-xeflow-electric shadow-md shadow-xeflow-brand/30">
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
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto space-y-1 custom-scrollbar">
          {modules.map((module) => {
            const hasChildren = module.children && module.children.length > 0;
            const isDrawerOpen = openDrawerId === module.name; // Using name instead of ID
            const isActive =
              location.pathname === module.url ||
              (hasChildren &&
                module.children.some(
                  (child) => location.pathname === child.url,
                ));

            return (
              <div key={module.name || Math.random()} className="mb-3">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={(e) => toggleDrawer(e, module.name)}
                    className={`group w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${isActive ? "bg-xeflow-brand text-white shadow-md shadow-xeflow-brand/25" : "text-xeflow-muted hover:text-xeflow-text hover:bg-xeflow-brand/6"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-200 ${isActive ? "bg-white/15" : "bg-xeflow-bg group-hover:bg-xeflow-brand/10"}`}
                      >
                        {module.icon && module.icon.startsWith("<svg") ? (
                          <span
                            dangerouslySetInnerHTML={{ __html: module.icon }}
                            className="flex items-center justify-center [&>svg]:w-[18px] [&>svg]:h-[18px]"
                          />
                        ) : (
                          <FiLayout size={18} />
                        )}
                      </span>
                      {module.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <FiChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${isDrawerOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                ) : (
                  <Link
                    to={module.url || "#"}
                    onClick={() => setOpenDrawerId(null)}
                    className={`group w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${isActive ? "bg-xeflow-brand text-white shadow-md shadow-xeflow-brand/25" : "text-xeflow-muted hover:text-xeflow-text hover:bg-xeflow-brand/6"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-200 ${isActive ? "bg-white/15" : "bg-xeflow-bg group-hover:bg-xeflow-brand/10"}`}
                      >
                        {module.icon && module.icon.startsWith("<svg") ? (
                          <span
                            dangerouslySetInnerHTML={{ __html: module.icon }}
                            className="flex items-center justify-center [&>svg]:w-[18px] [&>svg]:h-[18px]"
                          />
                        ) : (
                          <FiLayout size={18} />
                        )}
                      </span>
                      {module.name}
                    </span>
                  </Link>
                )}

                {/* Sub-Tabs (Children Drawer) */}
                {hasChildren && (
                  <div
                    /* ─── 4. INCREASED MAX-HEIGHT ─── */
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isDrawerOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                  >
                    <ul className="pl-[3.20rem] pr-3 space-y-0.5 flex flex-col relative before:absolute before:left-[1.8rem] before:top-2 before:bottom-2 before:w-[1px] before:bg-xeflow-border">
                      {module.children.map((child) => {
                        const isChildActive = location.pathname === child.url;
                        return (
                          <li key={child.id || child.name}>
                            <Link
                              to={child.url || "#"}
                              className={`relative block text-sm py-2 font-semibold transition-colors hover:text-xeflow-brand ${isChildActive ? "text-xeflow-brand" : "text-xeflow-muted"}`}
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

        {/* Bottom section */}
        <div className="px-3 pb-5 shrink-0 space-y-2 border-t border-xeflow-border pt-3">
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
              <FiHelpCircle size={16} />
              Help
            </button>
            <button
              onClick={handleLogout}
              className="
                flex-1 flex items-center justify-center gap-2
                py-2.5 rounded-xl text-xs font-semibold
                text-xeflow-muted hover:text-red-500
                bg-xeflow-bg hover:bg-red-500/6
                border border-xeflow-border
                transition-all duration-200
              "
            >
              <FiLogOut size={16} />
              Sign out
            </button>
          </div>

          <Link to="/profile">
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
              <span className="w-2 h-2 rounded-full bg-xeflow-success shrink-0 ring-2 ring-xeflow-bg" />
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
