
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";
import DeviceCard from "@/components/dashboard/DeviceCard";
import { devices, activeSessions, revenueReports, formatCurrency, updateSessionTimes } from "@/lib/data";
import { deviceTypes } from "@/lib/deviceTypes";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { Clock, Users, DollarSign, Activity } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Update session times every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateSessionTimes();
      setRefreshKey(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Stats for summary cards
  const totalActiveSessions = activeSessions.length;
  const totalDevices = devices.length;
  const availableDevices = devices.filter(d => d.status === 'available').length;
  const todayRevenue = revenueReports[0]?.totalRevenue || 0;
  
  // Filter devices based on selected filters
  const filteredDevices = devices.filter(device => {
    const matchesType = deviceTypeFilter === "all" || device.type === deviceTypeFilter;
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesType && matchesStatus;
  });
  
  // Handler for when sessions change (start/stop)
  const handleSessionChange = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Stats Overview */}
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="gaming-card border-l-4 border-l-primary relative overflow-hidden group p-4 min-h-[160px] flex flex-col justify-center bg-slate-950/90 dark:bg-card/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <CardHeader className="pb-1 relative z-10">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/50">Active Sessions</CardDescription>
              <CardTitle className="text-3xl font-black tracking-tighter flex items-baseline text-white">
                {totalActiveSessions}
                <span className="text-white/20 text-sm ml-2 font-medium">/ {totalDevices}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pb-0">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-primary">
                  {Math.round((totalActiveSessions / totalDevices) * 100)}% <span className="text-white/40">Utilization</span>
                </div>
                <div className="p-2 rounded-xl bg-primary/20 neon-glow-primary border border-primary/30">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-l-4 border-l-primary relative overflow-hidden group p-4 min-h-[160px] flex flex-col justify-center bg-slate-950/90 dark:bg-card/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <CardHeader className="pb-1 relative z-10">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/50">Available Devices</CardDescription>
              <CardTitle className="text-3xl font-black tracking-tighter flex items-baseline text-white">
                {availableDevices}
                <span className="text-white/20 text-sm ml-2 font-medium">/ {totalDevices}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pb-0">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-primary">
                  {Math.round((availableDevices / totalDevices) * 100)}% <span className="text-white/40">Available</span>
                </div>
                <div className="p-2 rounded-xl bg-primary/20 neon-glow-primary border border-primary/30">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-l-4 border-l-primary relative overflow-hidden group p-4 min-h-[160px] flex flex-col justify-center bg-slate-950/90 dark:bg-card/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <CardHeader className="pb-1 relative z-10">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/50">Today's Revenue</CardDescription>
              <CardTitle className="text-3xl font-black tracking-tighter text-white">
                {formatCurrency(todayRevenue)}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pb-0">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-primary">
                  {activeSessions.length} <span className="text-white/40">Sessions</span>
                </div>
                <div className="p-2 rounded-xl bg-primary/20 neon-glow-primary border border-primary/30">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-l-4 border-l-primary relative overflow-hidden group p-4 min-h-[160px] flex flex-col justify-center bg-slate-950/90 dark:bg-card/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <CardHeader className="pb-1 relative z-10">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/50">Uptime Status</CardDescription>
              <CardTitle className="text-3xl font-black tracking-tighter flex items-baseline text-white">
                {devices.filter(d => d.status !== 'offline').length}
                <span className="text-white/20 text-sm ml-2 font-medium">/ {totalDevices}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pb-0">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-primary">
                  {Math.round((devices.filter(d => d.status !== 'offline').length / totalDevices) * 100)}% <span className="text-white/40">Online</span>
                </div>
                <div className="p-2 rounded-xl bg-primary/20 neon-glow-primary border border-primary/30">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Device Management */}
        <Tabs defaultValue="all-devices" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
              <TabsTrigger value="all-devices" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="active-sessions" className="text-xs sm:text-sm">Active</TabsTrigger>
              <TabsTrigger value="ending-soon" className="text-xs sm:text-sm">Ending</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <Select 
                value={deviceTypeFilter} 
                onValueChange={setDeviceTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Device Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {deviceTypes.map(type => (
                    <SelectItem key={type.id} value={type.value}>{type.name}s</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all-devices" className="space-y-4">
            <div className="dashboard-grid">
              {filteredDevices.map((device) => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  onSessionChange={handleSessionChange}
                  refreshKey={refreshKey}
                />
              ))}
            </div>
            
            {filteredDevices.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No devices match your filters</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filter criteria</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setDeviceTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active-sessions" className="space-y-4">
            <div className="dashboard-grid">
              {devices
                .filter(device => device.status === 'in-use' || device.status === 'ending-soon')
                .map((device) => (
                  <DeviceCard 
                    key={device.id} 
                    device={device}
                    onSessionChange={handleSessionChange}
                    refreshKey={refreshKey} 
                  />
                ))}
            </div>
            
            {devices.filter(device => device.status === 'in-use' || device.status === 'ending-soon').length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No active sessions</h3>
                <p className="text-muted-foreground mt-2">All devices are currently available or offline</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ending-soon" className="space-y-4">
            <div className="dashboard-grid">
              {devices
                .filter(device => device.status === 'ending-soon')
                .map((device) => (
                  <DeviceCard 
                    key={device.id} 
                    device={device}
                    onSessionChange={handleSessionChange}
                    refreshKey={refreshKey}
                  />
                ))}
            </div>
            
            {devices.filter(device => device.status === 'ending-soon').length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No sessions ending soon</h3>
                <p className="text-muted-foreground mt-2">No active sessions are about to end</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Revenue Insight Preview */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card className="gaming-card border-primary/10 bg-slate-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Performance Pulse
                </CardTitle>
                <CardDescription className="text-xs">Quick look at recent revenue trends</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="text-primary hover:text-primary/80">
                Full Analytics &rarr;
              </Button>
            </CardHeader>
            <CardContent className="h-[200px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueReports}>
                  <defs>
                    <linearGradient id="dashRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#dashRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
