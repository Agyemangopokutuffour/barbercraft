export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://barbercraft.onrender.com";

export const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_API_URL ||
  "https://barbercraft-agent.onrender.com";

export const formatPrice = (cents) => `₵${(cents / 100).toFixed(2)}`;
