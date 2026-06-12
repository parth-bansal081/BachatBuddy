import { LayoutDashboard, Receipt, Settings, CreditCard, PieChart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useUserProfile } from "@/hooks/useUserProfile";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Accounts", url: "/accounts", icon: CreditCard },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Budget Planner", url: "/budget-planner", icon: PieChart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { profile } = useUserProfile();
  const location = useLocation();
  const [clickCount, setClickCount] = useState(0);

  const handleSystemReset = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast.success("System Reset: Clean Slate and Cache Purged.");
      window.location.assign("/auth");
    } catch (error) {
      console.error("Reset failed", error);
      window.location.reload();
    }
  };

  const onLogoClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount === 3) {
      handleSystemReset();
    }
    setTimeout(() => setClickCount(0), 3000);
  };

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar m-0 h-screen rounded-none overflow-hidden">
      <SidebarHeader className="p-5 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick} title="BachatBuddy v1.0">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent opacity-20 blur-xl rounded-full" />
            <div className="relative h-10 w-10 bg-sidebar-accent rounded-xl flex items-center justify-center border border-sidebar-border shadow-sm">
              <img src="/BachatBuddy.png" alt="BB" className="h-full w-full object-contain p-1 opacity-90" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">
              BachatBuddy
            </h1>
            <span className="px-1.5 py-0.5 rounded-md bg-accent text-[9px] font-bold text-accent-foreground w-fit border border-accent/50">
              PREMIUM
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        to={item.url}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm
                          ${isActive
                            ? "bg-primary text-primary-foreground shadow-elevation-2"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          }
                        `}
                      >
                        <item.icon className={`h-4.5 w-4.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary via-primary/50 to-accent p-[1.5px] shrink-0">
            <div className="h-full w-full rounded-full bg-sidebar flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-accent transition-colors" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate max-w-[110px]">
              {profile?.email || ""}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}