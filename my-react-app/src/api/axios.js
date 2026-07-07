import axios from "axios";

// 1. Establish the base URL dynamically based on the current execution environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// 2. Create a custom configured Axios instance
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for handling auth sessions/cookies smoothly
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;