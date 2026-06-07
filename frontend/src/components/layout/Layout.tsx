import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border flex items-center px-6 bg-white sticky top-0 z-10">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-primary transition-colors" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 p-6 overflow-auto bg-transparent relative">
            {/* Optional: Add a subtle inner glow or pattern here if needed, but body gradient is primary */}
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
