import { useAuth } from "@/contexts/AuthContext";
import { NavLink, useLocation } from "react-router-dom";
import { Search, Vote, BarChart3, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { to: "/search", label: "Search", icon: Search, visible: user.roles.includes("registrator") },
    { to: "/vote", label: "Vote", icon: Vote, visible: user.roles.includes("voting_agent") },
    { to: "/reporting", label: "Reporting", icon: BarChart3, visible: user.roles.includes("reporter") },
  ].filter((item) => item.visible);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Sidebar - desktop only */}
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border p-5">
          <img src={logo} alt="Logo" className="h-9 w-9 rounded-lg" />
          <span className="text-base font-semibold text-sidebar-foreground">Agent Portal</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 text-xs text-sidebar-foreground/50">
            Signed in as <span className="font-medium text-sidebar-foreground/80">{user.username}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg" />
          <span className="font-semibold text-foreground">Agent Portal</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">{user.username}</span>
          <Button variant="ghost" size="icon" onClick={logout} className="h-9 w-9">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content — padded at bottom on mobile for bottom nav */}
      <main className="flex-1 p-4 pb-24 lg:p-6 lg:pb-6">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t bg-card safe-bottom lg:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-accent" : ""}`} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default PortalLayout;
