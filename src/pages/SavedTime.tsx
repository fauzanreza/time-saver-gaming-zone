
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { savedTimes, devices, resumeSavedTime, formatTime, formatCurrency } from "@/lib/data";
import { SavedTime } from "@/lib/types";

const SavedTimePage = () => {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [selectedSavedTime, setSelectedSavedTime] = useState<SavedTime | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const availableDevices = devices.filter(device => device.status === 'available');
  
  const handleResumeClick = (savedTime: SavedTime) => {
    setSelectedSavedTime(savedTime);
    setSelectedDeviceId(availableDevices.length > 0 ? availableDevices[0].id : "");
    setIsResumeDialogOpen(true);
  };
  
  const handleResumeSession = () => {
    if (!selectedSavedTime || !selectedDeviceId) {
      toast.error("Please select a device to resume the session");
      return;
    }
    
    try {
      const session = resumeSavedTime(selectedSavedTime.id, selectedDeviceId);
      
      if (session) {
        toast.success(`Session resumed for ${formatTime(selectedSavedTime.minutes)}`);
        setIsResumeDialogOpen(false);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to resume session");
      }
    } catch (error) {
      toast.error(`Error resuming session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Filter active saved times
  const activeSavedTimes = savedTimes.filter(entry => entry.isActive);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Saved Time Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Saved Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Time Saved</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSavedTimes.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.customerIdentifier}</TableCell>
                    <TableCell>{formatTime(entry.minutes)}</TableCell>
                    <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{entry.expiresAt ? new Date(entry.expiresAt).toLocaleDateString() : 'Never'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResumeClick(entry)}
                        disabled={availableDevices.length === 0}
                      >
                        Resume Session
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {activeSavedTimes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No active saved time entries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Resume Session Dialog */}
            <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resume Saved Session</DialogTitle>
                  <DialogDescription>
                    Select a device to resume the saved time session.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  {selectedSavedTime && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Saved time:</p>
                      <p className="text-lg font-medium">{formatTime(selectedSavedTime.minutes)}</p>
                      <p className="text-sm text-muted-foreground mt-2">Customer:</p>
                      <p className="text-base">{selectedSavedTime.customerIdentifier}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-medium">Select Device</p>
                    <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDevices.map(device => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name} ({formatCurrency(device.hourlyRate)} per jam)
                          </SelectItem>
                        ))}
                        
                        {availableDevices.length === 0 && (
                          <SelectItem value="none" disabled>
                            No available devices
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsResumeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleResumeSession} 
                    disabled={!selectedDeviceId || availableDevices.length === 0}
                  >
                    Resume Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SavedTimePage;
