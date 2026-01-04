import { Inter } from "next/font/google";
import AppProviders from "./components/providers/AppProviders";
import AuthModal from "./components/AuthModal";
import EntryModal from "./components/EntryModal";
import "./globals.css";
import Navbar from "./components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased transition-colors duration-300`}>
        <Navbar />
        <AppProviders>
          <div className="min-h-screen bg-[#F8F9FA] ">
            {children}
          </div>
          <AuthModal />
          <EntryModal />
        </AppProviders>
      </body>
    </html>
  );
}
