import { LayoutDashboard, Calendar, Building2, Users, KeyRound, Plus } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Schedules", url: "/schedules", icon: Calendar },
  { title: "Org", url: "/organization", icon: Building2 },
  { title: "Members", url: "/members", icon: Users },
  { title: "Keys", url: "/api-keys", icon: KeyRound },
];

export function MobileNav() {
  const navigate = useNavigate();

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => navigate("/schedules")}
        className="md:hidden fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* Bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className="flex flex-col items-center gap-0.5 text-muted-foreground transition-colors"
              activeClassName="text-primary"
            >
              <item.icon className="h-4.5 w-4.5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
