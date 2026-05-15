const API_BASE_URL = "http://127.0.0.1:8000/api";

export const fetchWithAuth = async (endpoint, options = {}) => {
  let token = localStorage.getItem("accessToken");

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

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();

          localStorage.setItem("accessToken", data.access);

          headers["Authorization"] = `Bearer ${data.access}`;

          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...config,
            headers,
          });
        } else {
          forceLogout();
        }
      } catch (error) {
        forceLogout();
      }
    } else {
      forceLogout();
    }
  }

  return response;
};

const forceLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};
