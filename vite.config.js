import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Bypass function for proxy entries that overlap with SPA routes.
// When a browser navigates to e.g. /Programs/3 (Accept: text/html, GET),
// Vite serves index.html so React Router handles it client-side.
// Axios / fetch API calls carry Accept: application/json and are proxied normally.
const spaBypass = (req) => {
  const method = (req.method || "GET").toUpperCase();
  // POST/PUT/PATCH/DELETE are always real API calls — never bypass
  if (method !== "GET") return null;

  // Static asset requests (images, video, fonts, etc.) must be proxied to the
  // backend, not intercepted — an <img src="/Programs/3/img.jpg"> is a GET
  // but should never be served index.html.
  const urlPath = (req.url || "").split("?")[0];
  const staticExts =
    /\.(jpg|jpeg|png|gif|webp|avif|svg|ico|mp4|webm|mov|avi|mkv|pdf|woff2?|ttf|eot|otf)$/i;
  if (staticExts.test(urlPath)) return null;

  // Backend media-serving endpoints (path segment ends with /image, /thumbnail, etc.)
  // These are GET requests from <img> tags — must proxy to backend, never serve index.html.
  const isMediaEndpoint =
    /\/(image|thumbnail|photo|avatar|preview|download)(\/|$)/i.test(urlPath);
  if (isMediaEndpoint) return null;

  const accept = req.headers["accept"] || "";
  const contentType = req.headers["content-type"] || "";
  const isApiCall =
    accept.includes("application/json") ||
    contentType.includes("application/json") ||
    (req.headers["x-requested-with"] || "") === "XMLHttpRequest";

  // Browser GET navigation → serve SPA index.html
  if (!isApiCall) return "/index.html";
  return null; // API call → proxy normally
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Serve index.html for any path Vite doesn't recognise — the final safety net
    // for routes that are purely SPA-only (no backend overlap).
    historyApiFallback: true,

    // Dev proxy so cookies remain first-party (prevents SameSite issues on localhost).
    // Routes that are BOTH a React Router page AND a backend endpoint use spaBypass
    // so browser GET navigations always get index.html, not the backend JSON.
    proxy: {
      // Auth — POST to backend, GET renders SPA login/register pages
      "/Login": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/login": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/Register": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/register": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/forgot-password": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },

      // Pure API — no SPA route with these exact paths
      "/Logout": "https://backend.healthpathglobal.com",
      "/check_Auth": "https://backend.healthpathglobal.com",
      "/Users": "https://backend.healthpathglobal.com",
      "/enrollment": "https://backend.healthpathglobal.com",

      // Shared prefix: SPA page + backend API
      "/Courses": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/Programs": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/Favorites": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/favorites": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/notifications": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/payments": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/payment": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/faqs": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },

      // Pure API — no SPA route
      "/user-payments": "https://backend.healthpathglobal.com",
      "/comprehensive-payments": "https://backend.healthpathglobal.com",
      "/payment-status": "https://backend.healthpathglobal.com",
      "/coupons": "https://backend.healthpathglobal.com",
      "/media": "https://backend.healthpathglobal.com",
      "/public": "https://backend.healthpathglobal.com",
      "/home": "https://backend.healthpathglobal.com",
      "/contact": "https://backend.healthpathglobal.com",
      "/upload": "https://backend.healthpathglobal.com",
      "/visit": "https://backend.healthpathglobal.com",
      // Public certificate verification endpoint (also a SPA route — spaBypass handles navigation)
      "/verify": {
        target: "https://backend.healthpathglobal.com",
        changeOrigin: true,
        bypass: spaBypass,
      },
    },
  },
});
