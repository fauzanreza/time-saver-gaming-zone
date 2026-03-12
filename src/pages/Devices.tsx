
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeviceDialog } from "@/components/devices/DeviceDialog";
import { useToast } from "@/hooks/use-toast";
import { devices, updateSessionTimes, formatCurrency } from "@/lib/data";
import { deviceTypes } from "@/lib/deviceTypes";
import type { Device } from "@/lib/types";

const Devices = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      updateSessionTimes();
      setRefreshKey(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredDevices = selectedType === "all" 
    ? devices 
    : devices.filter(device => device.type === selectedType);

  const handleAddDevice = async (newDevice: Partial<Device>) => {
    try {
      await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      toast({ title: "Success", description: "Device added successfully" });
      updateSessionTimes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add device", variant: "destructive" });
    }
  };

  const handleEditDevice = async (updatedDevice: Partial<Device>) => {
    try {
      if (!selectedDevice) return;
      await fetch(`/api/devices/${selectedDevice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDevice)
      });
      toast({ title: "Success", description: "Device updated successfully" });
      setShowAddDialog(false);
      setSelectedDevice(null);
      updateSessionTimes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update device", variant: "destructive" });
    }
  };

  const handleDeleteDevice = async () => {
    if (selectedDevice) {
      try {
        await fetch(`/api/devices/${selectedDevice.id}`, { method: 'DELETE' });
        toast({ title: "Success", description: "Device deleted successfully" });
        setShowDeleteDialog(false);
        setSelectedDevice(null);
        updateSessionTimes();
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete device", variant: "destructive" });
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Device Management</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              className="whitespace-nowrap"
            >
              All
            </Button>
            {deviceTypes.map(type => (
              <Button
                key={type.id}
                variant={selectedType === type.value ? "default" : "outline"}
                onClick={() => setSelectedType(type.value)}
                className="whitespace-nowrap"
              >
                {type.name}s
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Device List</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="whitespace-nowrap">Hourly Rate</TableHead>
                    <TableHead>Specifications</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredDevices.map((device: Device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded border bg-gray-50 overflow-hidden flex items-center justify-center">
                        {(device.images && device.images.length > 0) || device.image ? (
                          <img 
                            src={device.images?.[0] || device.image} 
                            alt={device.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-[10px] text-gray-400">No img</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{device.name}</TableCell>
                    <TableCell className="capitalize">{device.type}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${device.status === 'available' ? 'bg-green-100 text-green-800' :
                          device.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                          device.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {device.status}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(device.hourlyRate)}/jam</TableCell>
                    <TableCell>{device.specs || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedDevice(device);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        <DeviceDialog
          open={showAddDialog || !!selectedDevice}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setSelectedDevice(null);
          }}
          onSave={selectedDevice ? handleEditDevice : handleAddDevice}
          device={selectedDevice || undefined}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the device
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDevice}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Devices;
