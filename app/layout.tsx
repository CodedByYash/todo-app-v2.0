import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/lib/provider/provider";
import { ThemeProvider } from "@/components/ui/custom/ThemeProvider";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";

export const metadata: Metadata = {
  title: { default: "Taskito", template: "%s · Taskito" },
  description:
    "Taskito is a fast, calm task manager for you and your team: workspaces, due dates, tags and reminders in one place.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1512" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider>
            <WorkspaceProvider>
              <main className="flex-1">{children}</main>
            </WorkspaceProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
