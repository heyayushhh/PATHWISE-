import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <motion.main
        initial={false}
        animate={{
          marginLeft: isDesktop ? 280 : 0,
        }}
        className="min-h-screen bg-background transition-all duration-300"
      >
        <TopNavbar />
        <div className="min-h-[calc(100vh-72px)] overflow-y-auto p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
