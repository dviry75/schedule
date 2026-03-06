import { LayoutDashboard, Calendar, Building2, Users, KeyRound } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Schedules", url: "/schedules", icon: Calendar },
  { title: "Organization", url: "/organization", icon: Building2 },
  { title: "Members", url: "/members", icon: Users },
  { title: "API Keys", url: "/api-keys", icon: KeyRound },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-background z-30">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">Chronos</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              activeClassName="bg-accent text-foreground"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3">
          <UserProfileDropdown />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-foreground truncate">{user?.email ?? "User"}</span>
            <span className="text-[10px] text-muted-foreground">Owner</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
