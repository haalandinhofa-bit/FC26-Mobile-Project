import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { GameApp } from "../src/components/ninety/game-app";
import "../src/styles.css";

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[NINETY Mobile] App render failed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, boxSizing: "border-box", background: "#07090e", color: "#e9eef6", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>O jogo encontrou um erro</h1>
            <p style={{ lineHeight: 1.6, color: "#aab4c5" }}>Tente abrir novamente. O jogo não precisa de internet para iniciar.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 12, padding: "12px 22px", border: 0, borderRadius: 999, background: "#d6ff3f", color: "#142000", fontWeight: 700 }}>Tentar novamente</button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Mobile root element was not found.");

createRoot(root).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <GameApp />
    </AppErrorBoundary>
  </React.StrictMode>,
);
