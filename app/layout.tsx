import "./globals.css";
import PWARegister from "./PWARegister";
// import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Trip Planner",
  description: "Plan and manage your trips effortlessly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Add PWA manifest + theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        {/* <Navbar /> */}
        <div className="pt-4">{children}</div>

        {/* ✅ Register the Service Worker */}
        <PWARegister />
      </body>
    </html>
  );
}
