"use client";

import { cn } from "@/src/lib/general-utils";
import {
  Activity,
  Bell,
  Blocks,
  Book,
  ChevronUp,
  ExternalLink,
  Hammer,
  Key,
  Map,
  Menu,
  MessagesSquare,
  Moon,
  Settings2,
  Sun,
  Timer,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../hooks/use-theme";
import { Button } from "../ui/button";

interface NavItem {
  icon: typeof MessagesSquare;
  label: string;
  href: string;
  target?: string;
}

interface NavGroup {
  icon: typeof MessagesSquare;
  label: string;
  basePath: string;
  children: NavItem[];
}

const topNavItems: NavItem[] = [
  { icon: MessagesSquare, label: "Agent", href: "/" },
  { icon: Map, label: "Landscape", href: "/landscape" },
  { icon: Hammer, label: "Tools", href: "/tools" },
  { icon: Blocks, label: "Systems", href: "/systems" },
  { icon: Activity, label: "Runs", href: "/runs" },
];

const controlPanelGroup: NavGroup = {
  icon: Settings2,
  label: "Control Panel",
  basePath: "/control-panel",
  children: [
    { icon: Settings2, label: "Overview", href: "/control-panel/overview" },
    { icon: Timer, label: "Schedules", href: "/control-panel/schedules" },
    { icon: Key, label: "API Keys", href: "/control-panel/api-keys" },
  ],
};

const bottomNavItems: NavItem[] = [{ icon: Bell, label: "Notifications", href: "/notifications" }];

const docsNavItem: NavItem = {
  icon: Book,
  label: "Docs",
  href: "https://docs.garzaglue.com",
  target: "_blank",
};

const linkClass = (isActive: boolean): string =>
  cn(
    "flex items-center px-3 py-2.5 mb-1 text-sm rounded-xl transition-all duration-200",
    isActive
      ? "bg-gradient-to-br from-muted/70 to-muted/50 dark:from-muted/70 dark:to-muted/50 backdrop-blur-sm border border-border/50 dark:border-border/70 shadow-sm text-foreground font-medium"
      : "text-muted-foreground hover:bg-gradient-to-br hover:from-muted/40 hover:to-muted/20 dark:hover:from-muted/40 dark:hover:to-muted/20 hover:text-foreground",
  );

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = pathname === item.href;
  return (
    <Link href={item.href} target={item.target || "_self"} className={linkClass(isActive)}>
      <Icon className="h-4 w-4 mr-3" />
      {item.label}
      {item.target === "_blank" && <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />}
    </Link>
  );
}

function CollapsibleGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isGroupActive = pathname.startsWith(group.basePath);
  const [isExpanded, setIsExpanded] = useState(isGroupActive);
  const Icon = group.icon;

  useEffect(() => {
    if (isGroupActive) setIsExpanded(true);
  }, [isGroupActive]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200",
          isGroupActive
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4 mr-3" />
        {group.label}
        <ChevronUp
          className={cn(
            "h-3.5 w-3.5 ml-auto transition-transform duration-200",
            !isExpanded && "rotate-180",
          )}
        />
      </button>
      {isExpanded && (
        <div className="ml-4 pl-3 border-l border-border/50">
          {group.children.map((child) => {
            const ChildIcon = child.icon;
            const isActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center px-3 py-2 mb-0.5 text-sm rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-muted/50 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                )}
              >
                <ChildIcon className="h-3.5 w-3.5 mr-2.5" />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LeftSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navContent = (
    <>
      {topNavItems.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
      <CollapsibleGroup group={controlPanelGroup} pathname={pathname} />
      {bottomNavItems.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
      <NavLink item={docsNavItem} pathname={pathname} />
    </>
  );

  const themeToggle = mounted ? (
    <div className="flex gap-2">
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="icon"
        aria-label="Light mode"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-5 w-5" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="icon"
        aria-label="Dark mode"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-5 w-5" />
      </Button>
    </div>
  ) : null;

  return (
    <>
      {/* Mobile: hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-sm"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile: floating panel overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]">
          <div
            ref={panelRef}
            className="absolute top-16 left-4 right-4 max-w-sm bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <img
                    src="/logo.svg"
                    alt="Garza Glue Logo"
                    className="h-8 w-auto cursor-pointer"
                  />
                </Link>
                {themeToggle}
              </div>
              <nav className="space-y-0.5">{navContent}</nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: static sidebar */}
      <div className="hidden lg:flex w-48 flex-shrink-0 bg-background border-r border-border flex-col">
        <div className="p-5">
          <div className="relative mx-auto flex flex-col items-center">
            <Link href="/">
              <img
                src="/logo.svg"
                alt="Garza Glue Logo"
                className="max-w-full h-[50px] w-auto ml-auto mr-auto cursor-pointer"
              />
            </Link>
          </div>
        </div>
        <nav className="flex-1 px-2 pt-2 overflow-y-auto min-h-0">{navContent}</nav>
        <div className="pt-0 px-6 pb-6 mt-auto flex flex-col items-center w-full">
          {themeToggle}
        </div>
      </div>
    </>
  );
}
