import { createContext, useState, useEffect, useCallback, useContext, useRef } from "react";
import { fetchWithAuth, forceLogout } from "../assets/js/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

// 6 hours in milliseconds
const INACTIVITY_LIMIT_MS = 6 * 60 * 60 * 1000;
// Check every 60 seconds
const INACTIVITY_CHECK_INTERVAL_MS = 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef(null);

  const fetchUser = async () => {
    try {
      const response = await fetchWithAuth("/users/me/", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Update the activity timestamp on any user interaction
  const updateActivity = useCallback(() => {
    localStorage.setItem("xeflow_last_activity", Date.now().toString());
  }, []);

  // Start/restart the inactivity check interval
  const startInactivityWatcher = useCallback(() => {
    if (inactivityTimer.current) clearInterval(inactivityTimer.current);

    inactivityTimer.current = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem("xeflow_last_activity") || "0", 10);
      const now = Date.now();
      if (lastActivity && now - lastActivity > INACTIVITY_LIMIT_MS) {
        toast.error("Session expired due to inactivity. Please log in again.", {
          duration: 4000,
        });
        // Small delay so the toast is visible before redirect
        setTimeout(() => forceLogout("inactivity"), 500);
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);
  }, []);

  const stopInactivityWatcher = useCallback(() => {
    if (inactivityTimer.current) {
      clearInterval(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "undefined" && token !== "null") {
      const lastActivity = parseInt(localStorage.getItem("xeflow_last_activity") || "0", 10);
      const now = Date.now();
      
      if (lastActivity && now - lastActivity > INACTIVITY_LIMIT_MS) {
        toast.error("Session expired due to inactivity. Please log in again.");
        forceLogout("inactivity");
        setLoading(false);
      } else {
        fetchUser();
        updateActivity(); // Stamp activity on load
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Attach activity listeners and inactivity watcher when user is logged in
  useEffect(() => {
    if (!user) {
      stopInactivityWatcher();
      return;
    }

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    activityEvents.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));
    startInactivityWatcher();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, updateActivity));
      stopInactivityWatcher();
    };
  }, [user, updateActivity, startInactivityWatcher, stopInactivityWatcher]);

  // Listen for force-logout events dispatched by api.js
  useEffect(() => {
    const handleForceLogout = (e) => {
      setUser(null);
      stopInactivityWatcher();
      const reason = e?.detail?.reason;
      if (reason === "inactivity") return; // Toast already shown above
      if (reason === "token_expired" || reason === "no_refresh_token") {
        toast.error("Your session has expired. Please log in again.");
      }
    };
    window.addEventListener("xeflow:force-logout", handleForceLogout);
    return () => window.removeEventListener("xeflow:force-logout", handleForceLogout);
  }, [stopInactivityWatcher]);

  const logout = useCallback(() => {
    setUser(null);
    stopInactivityWatcher();
    forceLogout("manual_logout");
  }, [stopInactivityWatcher]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, refreshUser: fetchUser, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
