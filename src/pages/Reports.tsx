import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { 
  fetchData, 
  formatCurrency, 
  deviceTypes 
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart as PieChartIcon,
  RefreshCcw
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const start = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
      const end = date?.to ? format(date.to, 'yyyy-MM-dd') : '';
      
      const res = await fetch(`/api/reports?startDate=${start}&endDate=${end}`);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [date]);

  const setRange = (range: 'today' | 'month' | 'lastMonth') => {
    const today = new Date();
    if (range === 'today') {
      setDate({ from: today, to: today });
    } else if (range === 'month') {
      setDate({ from: startOfMonth(today), to: endOfMonth(today) });
    } else if (range === 'lastMonth') {
      const lastMonth = subDays(startOfMonth(today), 1);
      setDate({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
    }
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = reportData.map(day => ({
      'Date': day.date,
      'Total Revenue': day.totalRevenue,
      'Session Count': day.sessionCount,
      ...Object.fromEntries(
        deviceTypes.map(type => [
          `${type.name} Revenue`, 
          day.deviceRevenue[type.value] || 0
        ])
      )
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue Report");
    
    const fileName = `time-machines-report-${format(date?.from || new Date(), 'MMM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Report exported successfully!");
  };

  const totals = reportData.reduce((acc, day) => ({
    revenue: acc.revenue + day.totalRevenue,
    sessions: acc.sessions + day.sessionCount,
  }), { revenue: 0, sessions: 0 });

  const avgPerSession = totals.sessions > 0 ? totals.revenue / totals.sessions : 0;

  // Pie chart data
  const deviceDistribution = deviceTypes.map(type => ({
    name: type.name,
    value: reportData.reduce((acc, day) => acc + (day.deviceRevenue[type.value] || 0), 0)
  })).filter(d => d.value > 0);

  const PURPLE_SHADES = ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-primary">Analytics Engine</h1>
            <p className="text-muted-foreground">Deep insights into your netcafe business performance</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-muted p-1 rounded-lg">
              <Button variant="ghost" size="sm" onClick={() => setRange('today')} className="text-xs px-3">Today</Button>
              <Button variant="ghost" size="sm" onClick={() => setRange('month')} className="text-xs px-3">This Month</Button>
              <Button variant="ghost" size="sm" onClick={() => setRange('lastMonth')} className="text-xs px-3">Last Month</Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[300px] justify-start text-left font-normal gaming-card border-primary/20",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleExportExcel} className="neon-glow-primary">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            
            <Button variant="ghost" size="icon" onClick={fetchReports} className={isLoading ? "animate-spin" : ""}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="gaming-card border-l-4 border-l-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70">Period Revenue</CardDescription>
              <CardTitle className="text-4xl font-black tracking-tighter">{formatCurrency(totals.revenue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-primary">
                <DollarSign className="h-4 w-4 mr-1" />
                Gross Earnings
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-l-4 border-l-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70">Total Sessions</CardDescription>
              <CardTitle className="text-4xl font-black tracking-tighter">{totals.sessions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-primary">
                <Users className="h-4 w-4 mr-1" />
                Unique Visitors
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-l-4 border-l-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70">Avg. Per Session</CardDescription>
              <CardTitle className="text-4xl font-black tracking-tighter">{formatCurrency(avgPerSession)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                Efficiency Rate
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Main Chart */}
          <Card className="gaming-card md:col-span-2 lg:col-span-3 min-h-[350px] md:min-h-[450px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue Growth Timeline
              </CardTitle>
              <CardDescription>Daily revenue breakdown across selected period</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[350px] pr-2 md:pr-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => format(new Date(val), 'dd MMM')}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `Rp ${val/1000}k`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    name="Daily Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribution */}
          <Card className="gaming-card min-h-[350px] md:min-h-[450px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Revenue Mix
              </CardTitle>
              <CardDescription>Earnings by device type</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PURPLE_SHADES[index % PURPLE_SHADES.length]} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {deviceDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PURPLE_SHADES[i % PURPLE_SHADES.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Sessions Count Bar Chart */}
          <Card className="gaming-card md:col-span-3 lg:col-span-4 min-h-[350px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Utilization History
              </CardTitle>
              <CardDescription>Number of active sessions per day</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => format(new Date(val), 'dd MMM')}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  />
                  <Bar 
                    dataKey="sessionCount" 
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]} 
                    name="Total Sessions"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
