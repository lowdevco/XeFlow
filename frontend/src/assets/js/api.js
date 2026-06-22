export const API_BASE_URL = import.meta.env.VITE_API_URL;


const API_ROOT = `${API_BASE_URL}/api`;

export const forceLogout = (reason = "session_expired") => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("xeflow_last_activity");
  // Dispatch event so AuthContext can react (e.g. show toast) before redirect
  window.dispatchEvent(new CustomEvent("xeflow:force-logout", { detail: { reason } }));
  window.location.href = "/login";
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  let token = localStorage.getItem("accessToken");
  if (token === "undefined" || token === "null") {
    token = null;
  }

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(`${API_ROOT}${endpoint}`, config);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_ROOT}/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();

          localStorage.setItem("accessToken", data.access);
          // If backend rotates refresh tokens, update it too
          if (data.refresh) {
            localStorage.setItem("refreshToken", data.refresh);
          }

          headers["Authorization"] = `Bearer ${data.access}`;

          response = await fetch(`${API_ROOT}${endpoint}`, {
            ...config,
            headers,
          });
        } else {
          forceLogout("token_expired");
        }
      } catch (error) {
        forceLogout("network_error");
      }
    } else {
      forceLogout("no_refresh_token");
    }
  }

  return response;
};
