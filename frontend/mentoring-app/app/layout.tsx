import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PostsProvider } from "@/contexts/posts-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ProfileSettingsProvider } from "@/contexts/profile-settings-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentoring App",
  description: "Connect, learn, and grow with mentors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ProfileSettingsProvider>
            <PostsProvider>
              <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                  <SidebarTrigger className="m-4" />
                  {children}
                </main>
              </SidebarProvider>
            </PostsProvider>
          </ProfileSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
