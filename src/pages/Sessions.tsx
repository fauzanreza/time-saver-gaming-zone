
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  StopCircle, 
  Save, 
  Clock as ClockIcon, 
  AlertCircle 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { activeSessions, devices, stopSession, formatTime, formatCurrency, updateSessionTimes } from "@/lib/data";
import { Session } from "@/lib/types";

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isStopSessionOpen, setIsStopSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Update sessions data every second
  useEffect(() => {
    updateSessionTimes();
    setSessions([...activeSessions]);
    
    const interval = setInterval(() => {
      updateSessionTimes();
      setSessions([...activeSessions]);
      setRefreshKey(prev => prev + 1);
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);
  
  const handleStopClick = (session: Session) => {
    setSelectedSession(session);
    setIsStopSessionOpen(true);
  };
  
  const handleStopSession = (saveRemainingTime: boolean = false) => {
    if (!selectedSession) return;
    
    try {
      const deviceId = selectedSession.deviceId;
      const savedTime = stopSession(deviceId, saveRemainingTime);
      
      if (saveRemainingTime && savedTime) {
        toast.success(`Session stopped. ${formatTime(savedTime.minutes)} saved.`);
      } else {
        toast.success("Session stopped successfully");
      }
      
      setIsStopSessionOpen(false);
      setSessions([...activeSessions]);
    } catch (error) {
      toast.error(`Error stopping session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const calculateProgress = (session: Session) => {
    return ((session.duration - session.remainingTime) / session.duration) * 100;
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Active Sessions</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Sessions ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="whitespace-nowrap">Remaining</TableHead>
                      <TableHead className="whitespace-nowrap">Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: Session) => {
                      const device = devices.find(d => d.id === session.deviceId);
                      const progressValue = calculateProgress(session);
                      const isEndingSoon = session.remainingTime <= 5;
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium whitespace-nowrap">{device?.name || 'Unknown Device'}</TableCell>
                          <TableCell className="whitespace-nowrap">{new Date(session.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true
                          })}</TableCell>
                          <TableCell className="min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <Progress value={progressValue} className="h-2 w-full" />
                              <span className="text-xs min-w-[32px]">{Math.round(progressValue)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {isEndingSoon && <AlertCircle className="h-4 w-4 text-amber-500" />}
                              <span className={isEndingSoon ? "font-medium text-amber-500" : ""}>
                                {formatTime(session.remainingTime)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{formatTime(session.duration)}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatCurrency(session.amountCharged || 0)}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-1 whitespace-nowrap"
                              onClick={() => handleStopClick(session)}
                            >
                              <StopCircle className="h-3.5 w-3.5" />
                              <span>End</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <ClockIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">No active sessions</p>
                <p className="text-muted-foreground">Start a session from the Dashboard</p>
              </div>
            )}
            
            {/* Stop Session Dialog */}
            <Dialog open={isStopSessionOpen} onOpenChange={setIsStopSessionOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>End Active Session</DialogTitle>
                  <DialogDescription>
                    {selectedSession && (
                      <>The session for {devices.find(d => d.id === selectedSession.deviceId)?.name} will be stopped.</>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  {selectedSession && selectedSession.remainingTime > 0 && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">Remaining time:</p>
                      <p className="text-2xl font-semibold">{formatTime(selectedSession.remainingTime)}</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => handleStopSession(false)} className="w-full sm:w-auto">
                    End Session
                  </Button>
                  {selectedSession && selectedSession.remainingTime > 0 && (
                    <Button 
                      onClick={() => handleStopSession(true)}
                      className="w-full sm:w-auto"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Remaining Time
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SessionsPage;
