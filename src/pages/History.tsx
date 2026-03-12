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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatTime } from "@/lib/data";
import { Session } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search, Clock, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(session => 
    session.device?.name?.toLowerCase().includes(search.toLowerCase()) ||
    session.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    session.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-primary">Session Archive</h1>
            <p className="text-muted-foreground">Historical ledger of all cafe activity</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by device, customer, or ID..." 
              className="pl-10 gaming-card border-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Card className="gaming-card border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Completion Log</CardTitle>
              <CardDescription>Records of the most recent 100 sessions</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest text-[10px]">
              {filteredHistory.length} Entries Found
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/5 overflow-x-auto">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Device</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Session Time</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Duration</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Revenue</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                        Loading transaction history...
                      </TableCell>
                    </TableRow>
                  ) : filteredHistory.length > 0 ? (
                    filteredHistory.map((session) => (
                      <TableRow key={session.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell className="min-w-[120px]">
                          <div className="font-bold text-sm tracking-tight whitespace-nowrap">{session.device?.name || 'Unknown Device'}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{session.device?.type}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{session.customerName || "-"}</div>
                        </TableCell>
                        <TableCell className="min-w-[150px]">
                          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <CalendarIcon className="h-3 w-3 text-primary/60" />
                            {format(new Date(session.startTime), 'dd MMM yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {format(new Date(session.startTime), 'HH:mm')} - {session.endTime ? format(new Date(session.endTime), 'HH:mm') : '??:??'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{formatTime(session.duration)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-black text-primary">{formatCurrency(session.amountCharged || 0)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] uppercase font-bold">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                        No sessions found for this query.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

        </Card>
      </div>
    </MainLayout>
  );
};

export default History;
