
import { ReactNode, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Monitor,
  Clock,
  History,
  Settings,
  BarChart,
  Bell,
  Menu,
  LogOut,
  ChevronRight,
  SaveIcon,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { alerts } from "@/lib/data";

interface MainLayoutProps {
  children: ReactNode;
}

interface SideNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

import { activeSessions, savedTimes } from "@/lib/data";

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const unreadAlerts = alerts.filter(alert => !alert.read).length;
  
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = activeSessions.length;
  const savedCount = savedTimes.filter(t => t.isActive).length;

  const mainNavItems: SideNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Devices",
      href: "/devices",
      icon: Monitor,
    },
    {
      title: "Active Sessions",
      href: "/sessions",
      icon: Clock,
      badge: activeCount
    },
    {
      title: "Saved Time",
      href: "/saved-time",
      icon: SaveIcon,
      badge: savedCount
    },
    {
      title: "History",
      href: "/history",
      icon: History,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const handleSwitchToCustomer = () => {
    // Remove admin authentication
    localStorage.removeItem("isAuthenticated");
    // Set customer mode
    localStorage.setItem("userMode", "customer");
    localStorage.setItem("isCustomer", "true");
    // Navigate to customer dashboard
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-16"
        )}
      >
        <div className="h-full flex flex-col bg-sidebar py-4 border-r border-border overflow-y-auto">
          {/* Sidebar Header */}
          <div className="px-4 flex items-center justify-between mb-6">
            {isSidebarOpen && (
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center neon-glow-primary">
                  <span className="text-primary-foreground font-bold italic">TM</span>
                </div>
                <span className="font-bold text-lg tracking-tight text-sidebar-foreground">TIME MACHINES</span>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="text-sidebar-foreground md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 px-2 flex-1 overflow-x-hidden">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center py-3 px-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent group transition-all duration-300 relative",
                  window.location.pathname === item.href && "bg-primary/10 text-primary border-r-2 border-primary"
                )}
                onClick={() => {
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
              >
                <item.icon className={cn(
                  "h-5 w-5 mr-3 shrink-0",
                  !isSidebarOpen && "mr-0 mx-auto"
                )} />
                {isSidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
                {!isSidebarOpen && item.badge && (
                  <Badge variant="secondary" className="absolute right-1 top-1 text-xs h-4 w-4 flex items-center justify-center p-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Sidebar Footer */}
          <Separator className="bg-sidebar-border opacity-50 my-2" />
          <div className="px-3 pt-2 space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSwitchToCustomer}
            >
              <Users className="h-4 w-4 mr-2" />
              Switch to Customer
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                    !isSidebarOpen && "justify-center"
                  )}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                      <Users className="h-4 w-4" />
                    </div>
                    {isSidebarOpen && <span>Admin User</span>}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className={cn(
          "flex-1 flex flex-col w-full transition-all duration-300 min-h-screen",
          isSidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        {/* Header */}
        <header className="bg-background sticky top-0 z-20 flex h-16 items-center border-b border-border px-4 md:px-6 shrink-0">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="md:hidden shrink-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg md:text-xl font-semibold truncate">
                {mainNavItems.find(item => item.href === window.location.pathname)?.title || "Dashboard"}
              </h1>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadAlerts > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {alerts.length > 0 ? (
                    <>
                      {alerts.slice(0, 5).map((alert) => (
                        <DropdownMenuItem key={alert.id} className={!alert.read ? "font-medium" : ""}>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm", !alert.read && "text-primary")}>{alert.deviceName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <span className="text-sm">{alert.message}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/notifications" className="flex items-center justify-center text-sm">
                          View all notifications
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No new notifications
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

