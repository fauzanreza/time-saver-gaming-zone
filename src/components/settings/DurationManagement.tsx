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
import { Label } from "@/components/ui/label";
import { useForm, useWatch } from "react-hook-form";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { DurationSuggestion } from "@/lib/types";

interface DurationFormData {
  label: string;
  hours: number;
  minutes: number;
}

const DurationManagement = () => {
  const [suggestions, setSuggestions] = useState<DurationSuggestion[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<DurationSuggestion | null>(null);
  
  const form = useForm<DurationFormData>({
    defaultValues: {
      label: "",
      hours: 0,
      minutes: 30
    }
  });

  const { control, setValue } = form;
  const watchedHours = useWatch({ control, name: "hours" });
  const watchedMinutes = useWatch({ control, name: "minutes" });

  // Auto-generate label
  useEffect(() => {
    const parts = [];
    if (watchedHours > 0) parts.push(`${watchedHours} jam`);
    if (watchedMinutes > 0) parts.push(`${watchedMinutes} menit`);
    const newLabel = parts.length > 0 ? parts.join(" ") : "0 menit";
    setValue("label", newLabel);
  }, [watchedHours, watchedMinutes, setValue]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/duration-suggestions');
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleAddSuggestion = async (data: DurationFormData) => {
    try {
      const minutesValue = parseInt(String(data.minutes)) || 0;
      const hoursValue = parseInt(String(data.hours)) || 0;
      const totalMinutes = (hoursValue * 60) + minutesValue;
      
      const payload = {
        label: data.label,
        minutes: totalMinutes
      };

      console.log('Sending payload:', payload);

      const response = await fetch('/api/duration-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to add');
      }

      toast.success("Duration suggestion added successfully");
      setShowDialog(false);
      form.reset();
      fetchSuggestions();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? `Error: ${error.message}` : "Failed to add suggestion");
    }
  };

  const handleEditSuggestion = async (data: DurationFormData) => {
    if (!selectedSuggestion) return;
    try {
      const minutesValue = parseInt(String(data.minutes)) || 0;
      const hoursValue = parseInt(String(data.hours)) || 0;
      const totalMinutes = (hoursValue * 60) + minutesValue;

      const response = await fetch(`/api/duration-suggestions/${selectedSuggestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: data.label,
          minutes: totalMinutes
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update');
      }

      toast.success("Duration suggestion updated successfully");
      setShowDialog(false);
      setSelectedSuggestion(null);
      form.reset();
      fetchSuggestions();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? `Error: ${error.message}` : "Failed to update suggestion");
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    try {
      const response = await fetch(`/api/duration-suggestions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete');
      }
      toast.success("Duration suggestion deleted successfully");
      fetchSuggestions();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? `Error: ${error.message}` : "Failed to delete suggestion");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Duration Suggestions</h2>
        <Button onClick={() => {
          setSelectedSuggestion(null);
          form.reset({ label: '30 menit', hours: 0, minutes: 30 });
          setShowDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Suggestion
        </Button>
      </div>

      <div className="grid gap-4">
        {suggestions.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{s.label}</h3>
                <p className="text-sm text-muted-foreground">{s.minutes} menit</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedSuggestion(s);
                  form.reset({
                    label: s.label,
                    hours: Math.floor(s.minutes / 60),
                    minutes: s.minutes % 60
                  });
                  setShowDialog(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDeleteSuggestion(s.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {suggestions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            No suggestions found
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSuggestion ? 'Edit' : 'Add'} Duration Suggestion</DialogTitle>
            <DialogDescription>
              Set the duration in hours and minutes to create a quick preset
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(selectedSuggestion ? handleEditSuggestion : handleAddSuggestion)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          max={59}
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Preview</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-muted" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {selectedSuggestion ? 'Update' : 'Add'} Suggestion
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DurationManagement;
