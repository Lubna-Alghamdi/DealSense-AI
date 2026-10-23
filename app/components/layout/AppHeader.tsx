import { IconLogout, IconMenu2, IconMoon, IconSun, IconX } from "@tabler/icons-react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const initial = (session?.name ?? session?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="no-print relative z-10 shrink-0 px-4 pt-4 md:px-8 md:pt-5">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileNavOpen(false)}
          >
            <img src={LOGO_URL} alt="" aria-hidden="true" className="brand-logo size-9 shrink-0 object-contain" />
            <span className="truncate text-base font-semibold tracking-tight text-foreground">DealSense AI</span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <nav aria-label="Main" className="hidden md:block">
              <ul className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur-xl">
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
                className="hidden shrink-0 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:block"
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

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full md:hidden"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <IconX size={19} aria-hidden="true" /> : <IconMenu2 size={20} aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {mobileNavOpen ? (
          <nav aria-label="Mobile main" className="mt-3 md:hidden">
            <ul className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur-xl">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-center text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {!session ? (
                <li className="col-span-2 sm:hidden">
                  <Link
                    to="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="block rounded-xl border border-border px-3 py-2 text-center text-sm font-medium text-foreground"
                  >
                    Login
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
