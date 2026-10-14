import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 25000,
});

// Add the login token to protected API requests.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (error.response?.status === 401 || message === "Invalid or expired token") {
      // A failed login must not show the session-expired message.
      if (error.config?.url !== "/auth/login") {
        window.dispatchEvent(new Event("session-expired"));
      }
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ECONNABORTED") return "The request took too long. Please try again.";
  return "Unable to connect to the server. Please check that the backend is running.";
};

export default api;

// Share an in-progress request so React development mode does not call AI twice.
const draftRequests = new Map();
export const loadAiDraft = async (ticketId) => {
  if (draftRequests.has(ticketId)) return draftRequests.get(ticketId);
  const request = api.post(`/admin/tickets/${ticketId}/ai-draft`);
  draftRequests.set(ticketId, request);
  try {
    return await request;
  } finally {
    draftRequests.delete(ticketId);
  }
};
