import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Building2, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const { organizations, activeOrg, setActiveOrg } = useOrg();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs font-medium text-foreground">{user?.email}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{activeOrg?.name}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Building2 className="h-3.5 w-3.5 mr-2" />
            Active Organization
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {organizations.map((org) => (
              <DropdownMenuItem key={org.id} onClick={() => setActiveOrg(org)}>
                <span className="flex-1">{org.name}</span>
                {activeOrg?.id === org.id && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="h-3.5 w-3.5 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
