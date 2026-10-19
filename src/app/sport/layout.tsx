import type { ReactNode } from "react";
import { SportCloudProvider } from "@/sport/cloud/provider";
import { SportFrame } from "@/sport/sport-frame";
export default function SportLayout({ children }: { children: ReactNode }) {
  return (
    <SportFrame>
      <SportCloudProvider>{children}</SportCloudProvider>
    </SportFrame>
  );
}
