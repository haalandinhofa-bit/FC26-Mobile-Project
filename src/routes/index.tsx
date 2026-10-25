import { createFileRoute } from "@tanstack/react-router";
import { GameApp } from "@/components/ninety/game-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <GameApp />;
}
