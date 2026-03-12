import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatTime } from "@/lib/data";
import type { Device, DurationSuggestion } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onStartSession: (duration: number) => void;
  device: Device;
  defaultDuration?: number;
}

const SessionStartDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onStartSession,
  device,
  defaultDuration = 60
}) => {
  const [durationMode, setDurationMode] = useState<"preset"|"custom">("preset");
  const [presetDuration, setPresetDuration] = useState(defaultDuration);
  const [customHours, setCustomHours] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<DurationSuggestion[]>([]);
  
  const sessionDuration = durationMode === "preset" 
    ? presetDuration 
    : (customHours * 60 + customMinutes);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/duration-suggestions');
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSuggestions();
      setDurationMode("preset");
      setPresetDuration(defaultDuration);
      setCustomHours(0);
      setCustomMinutes(0);
    }
  }, [open, defaultDuration]);

  const handlePreset = (mins: number) => {
    setDurationMode("preset");
    setPresetDuration(mins);
  };

  const handleSelectCustom = () => {
    setDurationMode("custom");
  };

  const handleStart = () => {
    if (sessionDuration > 0) {
      onStartSession(sessionDuration);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {device.name}</DialogTitle>
          <DialogDescription>
            Select how long you want to use this device.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Session Duration</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(opt => (
                <Button
                  key={opt.id}
                  type="button"
                  variant={durationMode === 'preset' && presetDuration === opt.minutes ? "default" : "outline"}
                  onClick={() => handlePreset(opt.minutes)}
                  className="px-4 py-2"
                >
                  {opt.label}
                </Button>
              ))}
              <Button
                type="button"
                variant={durationMode === 'custom' ? "default" : "outline"}
                onClick={handleSelectCustom}
                className="px-4 py-2"
              >
                Custom
              </Button>
            </div>
            {durationMode === 'custom' && (
              <div className="flex items-center gap-3 mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Jam</Label>
                  <Input
                    type="number"
                    min={0}
                    value={customHours}
                    onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Menit</Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            <p className="text-sm font-medium text-primary">
              {formatTime(sessionDuration)}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Price</h4>
            <div className="flex justify-between items-baseline">
              <p className="text-lg font-bold">
                {formatCurrency((device.hourlyRate * sessionDuration / 60))}
              </p>
              <p className="text-sm text-muted-foreground">
                ({formatCurrency(device.hourlyRate)}/jam)
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={sessionDuration <= 0}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionStartDialog;
