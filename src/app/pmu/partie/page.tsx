import type { Metadata } from "next";
import { GameClient } from "@/games/pmu/features/game/game-client";

export const metadata: Metadata = { title: "Course" };
export default function GamePage() { return <GameClient />; }
