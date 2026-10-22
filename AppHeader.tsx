import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { useSession } from "@agent-native/core/client/hooks";
import { signOut } from "@agent-native/core/client";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Link, NavLink } from "react-router";

import { Button } from "@/components/ui/button";

const LOGO_URL =
  "https://cdn.builder.io/api/v1/image/assets%2Fa9b10afc88c54a1485913eb386474032%2F603f781baa244e5381e72d059c3c9ace?format=webp&width=800&height=1200";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/create", label: "Create" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/simulator", label: "Simulator" },
  { to: "/report", label: "Report" },
];

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (session?.name ?? session?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="no-print relative z-10 shrink-0 px-4 pt-5 md:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <img src={LOGO_URL} alt="" aria-hidden="true" className="brand-logo size-9 object-contain" />
          <span className="text-base font-semibold tracking-tight text-foreground">DealSense AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="-mx-1 min-w-0 overflow-x-auto">
            <ul className="flex min-w-max items-center gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur-xl">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `block rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {session ? (
            <div className="relative shrink-0">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card/70 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                {initial}
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-lg"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-foreground">{session.name ?? "DealSense account"}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.email}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => signOut({ redirectTo: "/login" })}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <IconLogout size={16} aria-hidden="true" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="shrink-0 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              Login
            </Link>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <IconSun size={18} aria-hidden="true" /> : <IconMoon size={18} aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
