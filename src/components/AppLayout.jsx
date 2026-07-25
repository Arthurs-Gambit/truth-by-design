import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ScanSearch,
  Cpu,
  ClipboardCheck,
  History as HistoryIcon,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Disclaimer from "@/components/Disclaimer";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Analyze", icon: ScanSearch, end: true },
  { to: "/processing", label: "Processing", icon: Cpu },
  { to: "/results", label: "Results", icon: ClipboardCheck },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
          Truth by Design
        </span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Three-Agent MoE
        </span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand />
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
          <NavLinks />
          <div className="mt-auto">
            <Disclaimer />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile nav panel */}
      {open && (
        <div className="border-b border-border bg-background px-4 py-4 lg:hidden">
          <NavLinks onNavigate={() => setOpen(false)} />
          <div className="mt-4">
            <Disclaimer />
          </div>
        </div>
      )}

      {/* Desktop top bar */}
      <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur lg:flex lg:pl-64">
        <p className="text-sm text-muted-foreground">
          A Three-Agent Mixture-of-Experts Fact-Checking System
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {location.pathname === "/" ? "Analyze a claim" : "Decision-support tool"}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}