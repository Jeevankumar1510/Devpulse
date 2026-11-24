import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import { DatasetProvider } from "@/components/DatasetContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "DevPulse - Engineering Productivity & Software Quality Intelligence",
  description: "Industry-level Engineering Productivity, DORA Metrics, and Flexible Data Analytics Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex h-screen w-screen overflow-hidden bg-background antialiased">
        <ThemeProvider>
          <DatasetProvider>
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
                {children}
              </main>
            </div>
          </DatasetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
