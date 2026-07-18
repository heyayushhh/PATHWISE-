import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  collapsed?: boolean;
}

export default function SidebarItem({ icon, label, href, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link href={href} className="relative block">
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary rounded-r" />
      )}
      <motion.div
        className={clsx(
          "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
          isActive
            ? "bg-primary/10 text-foreground font-semibold"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
        )}
        whileHover={{ x: 4 }}
      >
        <div className={clsx("flex-shrink-0 transition-colors", isActive ? "text-primary" : "")}>
          {icon}
        </div>
        {!collapsed && <span className="text-sm">{label}</span>}
      </motion.div>
    </Link>
  );
}
