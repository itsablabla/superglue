"use client";

import { cn } from "@/src/lib/general-utils";
import {
  Blocks,
  Book,
  ExternalLink,
  Hammer,
  Menu,
  MessagesSquare,
  Moon,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../hooks/use-theme";
import { Button } from "../ui/button";

const baseNavItems: {
  icon: typeof MessagesSquare;
  label: string;
  href: string;
  target?: string;
}[] = [
  { icon: MessagesSquare, label: "Agent", href: "/" },
  { icon: Hammer, label: "Tools", href: "/tools" },
  { icon: Blocks, label: "Systems", href: "/systems" },
  { icon: Settings2, label: "Setup", href: "/setup" },
];

const docsNavItem = {
  icon: Book,
  label: "Docs",
  href: "https://docs.superglue.cloud",
  target: "_blank",
};

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
      {baseNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            target={item.target || "_self"}
            className={cn(
              "flex items-center px-3 py-2.5 mb-1 text-sm rounded-xl transition-all duration-200",
              isActive
                ? "bg-gradient-to-br from-muted/70 to-muted/50 dark:from-muted/70 dark:to-muted/50 backdrop-blur-sm border border-border/50 dark:border-border/70 shadow-sm text-foreground font-medium"
                : "text-muted-foreground hover:bg-gradient-to-br hover:from-muted/40 hover:to-muted/20 dark:hover:from-muted/40 dark:hover:to-muted/20 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 mr-3" />
            {item.label}
            {item.target === "_blank" && <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />}
          </Link>
        );
      })}

      {/* Docs Link */}
      <Link
        href={docsNavItem.href}
        target={docsNavItem.target}
        className="flex items-center px-3 py-2.5 mb-1 text-sm rounded-xl text-muted-foreground hover:bg-gradient-to-br hover:from-muted/40 hover:to-muted/20 dark:hover:from-muted/40 dark:hover:to-muted/20 hover:text-foreground transition-all duration-200"
      >
        <docsNavItem.icon className="h-4 w-4 mr-3" />
        {docsNavItem.label}
        <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
      </Link>
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
                  <img src="/logo.svg" alt="superglue Logo" className="h-8 w-auto cursor-pointer" />
                </Link>
                {themeToggle}
              </div>
              <nav className="space-y-0.5">{navContent}</nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: static sidebar (unchanged) */}
      <div className="hidden lg:flex w-48 flex-shrink-0 bg-background border-r border-border flex-col">
        <div className="p-5">
          <div className="relative mx-auto flex flex-col items-center">
            <Link href="/">
              <img
                src="/logo.svg"
                alt="superglue Logo"
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
