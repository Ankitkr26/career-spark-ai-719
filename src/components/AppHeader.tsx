import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Brain, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { isAuthenticated, isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [open, setOpen] = useState(false);

  const navItems = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/resumes", label: "Resumes" },
        { to: "/jobs", label: "Jobs" },
        { to: "/interview", label: "Mock Interview" },
        ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/login", label: "Sign in" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg shadow-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Place<span className="text-primary">IQ</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          )}
          {!isAuthenticated && (
            <Button asChild size="sm" className="ml-2">
              <Link to="/login">Get started</Link>
            </Button>
          )}
        </nav>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted"
              >
                Sign out ({user?.email})
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}