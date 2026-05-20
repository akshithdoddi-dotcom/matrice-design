import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/index.css";
import { StatusPage } from "./StatusPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StatusPage />
  </StrictMode>
);
