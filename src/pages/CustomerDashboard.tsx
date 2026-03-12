
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomerLayout from "@/components/layout/CustomerLayout";
import CustomerDeviceCard from "@/components/dashboard/CustomerDeviceCard";
import { devices, formatCurrency, updateSessionTimes } from "@/lib/data";
import { deviceTypes } from "@/lib/deviceTypes";
import { Clock } from "lucide-react";

const CustomerDashboard = () => {
  // Remove the navigation and access check since customer mode is now default
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Set customer mode in localStorage to ensure proper state
  useEffect(() => {
    localStorage.setItem("userMode", "customer");
    localStorage.setItem("isCustomer", "true");
  }, []);
  
  // Update session times every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateSessionTimes();
      setRefreshKey(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter devices based on selected filters - only show available devices for customers
  const filteredDevices = devices.filter(device => {
    const matchesType = deviceTypeFilter === "all" || device.type === deviceTypeFilter;
    return matchesType;
  });
  
  // Count available devices
  const availableDevices = filteredDevices.filter(d => d.status === 'available').length;
  const totalDevices = filteredDevices.length;
  
  // Handler for when sessions change (start)
  const handleSessionChange = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="gaming-card p-4">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Available Devices</CardDescription>
              <CardTitle className="text-3xl font-bold flex items-baseline">
                {availableDevices}
                <span className="text-muted-foreground text-sm ml-2">/ {totalDevices} Units</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium text-primary">
                  {Math.round((availableDevices / totalDevices) * 100)}% Available
                </div>
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card p-4">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Device Types</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {deviceTypes.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium text-primary">
                  {deviceTypes.map(t => t.name).join(", ")}
                </div>
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Device Selection */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Select Station</h2>
            
            <Select 
              value={deviceTypeFilter} 
              onValueChange={setDeviceTypeFilter}
            >
              <SelectTrigger className="w-full md:w-[200px] h-10">
                <SelectValue placeholder="All Devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {deviceTypes.map(type => (
                  <SelectItem key={type.id} value={type.value}>
                    {type.name} ({formatCurrency(type.hourlyRate)}/jam)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="dashboard-grid">
            {filteredDevices.map((device) => (
              <CustomerDeviceCard 
                key={device.id} 
                device={device} 
                onSessionChange={handleSessionChange}
                refreshKey={refreshKey}
              />
            ))}
          </div>
          
          {filteredDevices.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No devices match your filter</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filter criteria</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setDeviceTypeFilter("all");
                }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
