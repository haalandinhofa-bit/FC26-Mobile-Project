import React from "react";
import { createRoot } from "react-dom/client";
import { GameApp } from "../src/components/ninety/game-app";
import "../src/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Mobile root element was not found.");

createRoot(root).render(
  <React.StrictMode>
    <GameApp />
  </React.StrictMode>,
);
