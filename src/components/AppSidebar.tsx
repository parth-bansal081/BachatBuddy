import { LayoutDashboard, Receipt, Settings, CreditCard, PieChart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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

  return (
    <Sidebar className="border-none bg-card/50 backdrop-blur-xl m-4 h-[calc(100vh-2rem)] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <SidebarHeader className="p-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent opacity-20 blur-lg rounded-full group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-md backdrop-blur-sm">
              {/* Replaced Image with Icon for consistency if image fails, or use image if preferred. Keeping image logic but adding fallback style */}
              <img src="/BachatBuddy.png" alt="BB" className="h-full w-full object-contain p-1 opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tight">
              BachatBuddy
            </h1>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-md bg-accent text-[9px] font-bold text-slate-900 border border-yellow-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                PREMIUM
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-12 group my-1" isActive={isActive}>
                      <Link
                        to={item.url}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 relative overflow-hidden font-medium
                          ${isActive
                            ? "bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] translate-x-1"
                            : "text-muted-foreground hover:text-white hover:bg-white/5 hover:translate-x-1"
                          }
                        `}
                      >
                        <item.icon className={`h-5 w-5 z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="z-10">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary via-teal-100 to-accent p-[1.5px] shadow-sm">
            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
              <User className="h-5 w-5 text-white group-hover:text-accent transition-colors" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {profile?.email || ""}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
