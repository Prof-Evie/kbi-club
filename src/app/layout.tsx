import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "KBI | نادي الملاكمة — لوحة الإدارة",
  description:
    "نظام إدارة مشتركي نادي KBI للملاكمة — الاشتراكات، التمديد، والتواصل مع المشتركين.",
  keywords: ["KBI", "boxing", "نادي ملاكمة", "إدارة", "اشتراكات"],
  applicationName: "KBI Admin",
};

export const viewport: Viewport = {
  themeColor: "#070709",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-dvh">
        {children}
        <Toaster theme="dark" position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
