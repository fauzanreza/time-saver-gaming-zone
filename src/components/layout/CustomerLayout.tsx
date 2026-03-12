
import { ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Users,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { devices } from "@/lib/data";

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  const navigate = useNavigate();

  // Count available devices for badge
  const availableDevicesCount = devices.filter(d => d.status === 'available').length;

  const handleSwitchToAdmin = () => {
    // Set admin mode in localStorage
    localStorage.setItem("userMode", "admin");
    localStorage.removeItem("isCustomer");
    // Navigate to login page which will handle the admin authentication
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background sticky top-0 z-40 h-16 items-center border-b border-border px-4 md:px-8 flex justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center neon-glow-primary">
            <span className="text-primary-foreground font-bold italic">TM</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2">
            <span className="hidden sm:inline">TIME MACHINES</span>
            <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">CUSTOMER</Badge>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary transition-colors px-2 sm:px-3"
            onClick={handleSwitchToAdmin}
          >
            <Users size={16} />
            <span className="text-xs ml-1 sm:ml-2 hidden sm:inline">Switch to Admin</span>
            <span className="text-xs ml-1 sm:hidden">Admin</span>
          </Button>
        </div>
      </header>

      {/* Customer Navigation Bar */}
      <div className="bg-muted/30 py-4 px-4 border-b border-border flex items-center justify-center">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              (window.location.pathname === "/" || window.location.pathname === "/customer-dashboard") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Available Devices
            <Badge variant="secondary" className="ml-1 font-medium">
              {availableDevicesCount}
            </Badge>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-8 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2025 Time Machines GamingSpace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Clock className="h-4 w-4" />
            <span>Need help? Ask our staff</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
