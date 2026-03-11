import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  CreditCard,
  HeadphonesIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  special?: boolean;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "partners", label: "Partners", icon: Users },
  { id: "submissions", label: "Submissions", icon: ClipboardList },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "customerservice", label: "Customer Service", icon: HeadphonesIcon },
  { id: "perfstore", label: "Perf Store", icon: Store },
  { id: "superadmin", label: "Super Admin", icon: ShieldAlert, special: true },
];

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({
  currentPage,
  onNavigate,
  onLogout,
  children,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop close
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <span className="font-display text-sidebar-foreground font-bold text-lg">
            Menu
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent
          currentPage={currentPage}
          onNavigate={(p) => {
            onNavigate(p);
            setMobileOpen(false);
          }}
          onLogout={onLogout}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setMobileOpen(true)}
            data-ocid="nav.toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
            <span className="font-display font-bold text-sidebar-foreground text-base">
              Lema Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            data-ocid="nav.mobile.logout.button"
            className="text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive gap-1.5 text-xs"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xs:inline">Sign Out</span>
          </Button>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="animate-fade-in flex-1 min-h-0 flex flex-col">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-center bg-sidebar border-t border-sidebar-border overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-ocid={`nav.${item.id}.link`}
                className={cn(
                  "flex-1 min-w-[60px] flex flex-col items-center gap-1 py-2 px-1 text-xs transition-colors",
                  active
                    ? item.special
                      ? "text-amber-400"
                      : "text-sidebar-primary"
                    : item.special
                      ? "text-amber-500/60 hover:text-amber-400"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPage,
  onNavigate,
  onLogout,
}: {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
}) {
  const regularItems = navItems.filter((i) => !i.special);
  const specialItems = navItems.filter((i) => i.special);

  return (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-sm leading-tight">
              Lema Admin
            </p>
            <p className="text-sidebar-foreground/40 text-[10px] leading-tight">
              Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">
          Navigation
        </p>
        {regularItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                active
                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}

        {/* Separator before super admin */}
        <div className="my-2 border-t border-sidebar-border/50" />
        <p className="px-3 mb-1 text-[10px] uppercase tracking-widest text-amber-500/50 font-semibold">
          Admin Control
        </p>
        {specialItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                active
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-amber-500/60 hover:bg-amber-500/10 hover:text-amber-400",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <button
          type="button"
          onClick={onLogout}
          data-ocid="nav.logout.button"
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-semibold bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white transition-all duration-200 group"
        >
          <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </>
  );
}
