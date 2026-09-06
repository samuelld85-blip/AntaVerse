import type { Metadata } from "next";
import { SportApp } from "@/sport/sport-app";
export const metadata: Metadata = {
  title: "Sport",
  description: "Votre carnet d’entraînement : séances, repos et favoris.",
};
export default function SportPage() {
  return <SportApp />;
}
