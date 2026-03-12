import { useState, useEffect } from "react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatIDRInput, parseIDRInput } from "@/lib/data";
import { DeviceTypeConfig } from "@/lib/types";
import { deviceTypes, addDeviceType, updateDeviceType, deleteDeviceType } from "@/lib/deviceTypes";

interface TypeFormData {
  name: string;
  hourlyRate: number;
}

const TypeManagement = () => {
  const [types, setTypes] = useState<DeviceTypeConfig[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<DeviceTypeConfig | null>(null);
  const { toast } = useToast();
  const form = useForm<TypeFormData>();

  const fetchTypes = async () => {
    try {
      const res = await fetch('/api/device-types');
      const data = await res.json();
      setTypes(data);
    } catch (error) {
      console.error('Failed to fetch types:', error);
    }
  };

  useEffect(() => {
    // If we have device types locally synced, use them immediately
    if (deviceTypes.length > 0) {
      setTypes([...deviceTypes]);
    } else {
      fetchTypes();
    }
    
    const interval = setInterval(() => {
      if (deviceTypes.length > 0) {
        setTypes([...deviceTypes]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddType = async (data: TypeFormData) => {
    try {
      await addDeviceType({
        name: data.name,
        value: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        hourlyRate: Number(data.hourlyRate)
      });
      toast({ title: "Success", description: "Device type added successfully" });
      setShowDialog(false);
      form.reset();
      await fetchTypes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add device type", variant: "destructive" });
    }
  };

  const handleEditType = async (data: TypeFormData) => {
    if (!selectedType) return;
    try {
      await updateDeviceType(selectedType.id, {
        name: data.name,
        value: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        hourlyRate: Number(data.hourlyRate)
      });
      toast({ title: "Success", description: "Device type updated successfully" });
      setShowDialog(false);
      setSelectedType(null);
      form.reset();
      await fetchTypes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update device type", variant: "destructive" });
    }
  };

  const handleDeleteType = async (type: DeviceTypeConfig) => {
    try {
      const success = await deleteDeviceType(type.id);
      if (success) {
        toast({ title: "Success", description: "Device type deleted successfully" });
        await fetchTypes();
      } else {
        toast({ title: "Error", description: "Cannot delete system types", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete device type", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Device Types</h2>
        <Button onClick={() => {
          setSelectedType(null);
          form.reset();
          setShowDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      <div className="grid gap-4">
        {types.map((type) => (
          <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{type.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(type.hourlyRate)}/jam
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedType(type);
                  form.reset({
                    name: type.name,
                    hourlyRate: type.hourlyRate
                  });
                  setShowDialog(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDeleteType(type)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedType ? 'Edit' : 'Add'} Device Type</DialogTitle>
            <DialogDescription>
              {selectedType ? 'Edit existing device type details' : 'Add a new type of device to the system'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(selectedType ? handleEditType : handleAddType)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Gaming Console" />
                    </FormControl>
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (Rp)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        value={field.value ? formatIDRInput(field.value) : ''}
                        onChange={(e) => field.onChange(parseIDRInput(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {selectedType ? 'Update' : 'Add'} Type
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TypeManagement;
