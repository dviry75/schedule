import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      <main className="md:pl-56 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
