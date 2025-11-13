import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Trip Planner",
  description: "Plan and manage your trips effortlessly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* <Navbar /> */}
        <div className="pt-4">{children}</div>
      </body>
    </html>
  );
}
