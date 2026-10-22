import { HeaderActionsProvider } from "@agent-native/toolkit/app-shell";

import { AppHeader } from "@/components/layout/AppHeader";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <HeaderActionsProvider>
      <div className="app-shell flex h-screen w-full flex-col overflow-hidden app-glow bg-background text-foreground">
        <AppHeader />
        <main className="agent-native-app-main min-w-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>
    </HeaderActionsProvider>
  );
}
