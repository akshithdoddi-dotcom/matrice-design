import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import posthog from "posthog-js";
import App from "./app/App.tsx";
import "./styles/index.css";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  defaults: "2026-05-30",
  person_profiles: "identified_only",
  capture_pageview: false,
  capture_pageleave: true,
});

function PostHogPageView() {
  const location = useLocation();
  useEffect(() => {
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [location]);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <PostHogPageView />
    <App />
  </BrowserRouter>
);
