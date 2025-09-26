"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "@/components/providers/websocket-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <WebSocketProvider>
        {children}
        <Toaster />
      </WebSocketProvider>
    </ThemeProvider>
  );
}
