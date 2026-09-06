import type { ReactNode } from "react";
import { SportCloudProvider } from "@/sport/cloud/provider";
export default function SportLayout({ children }: { children: ReactNode }) {
  return <SportCloudProvider>{children}</SportCloudProvider>;
}
