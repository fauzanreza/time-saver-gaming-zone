import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Play as PlayIcon, 
  Square as StopIcon, 
  Clock as ClockIcon, 
  Save as SaveIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  Image as ImageIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Device, DurationSuggestion } from "@/lib/types";
import { 
  formatTime, 
  formatCurrency, 
  getActiveSession, 
  startSession, 
  stopSession 
} from "@/lib/data";
import { deviceTypes } from "@/lib/deviceTypes";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ImageGalleryModal from "@/components/devices/ImageGalleryModal";

const DeviceCard = ({ device, onSessionChange, refreshKey }: { device: Device, onSessionChange?: () => void, refreshKey?: number }) => {
  const [isStartSessionOpen, setIsStartSessionOpen] = useState(false);
  const [isStopSessionOpen, setIsStopSessionOpen] = useState(false);
  const [durationMode, setDurationMode] = useState<"preset"|"custom">("preset");
  const [presetDuration, setPresetDuration] = useState(60);
  const [customHours, setCustomHours] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<DurationSuggestion[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  
  const [activeSession, setActiveSession] = useState(getActiveSession(device.id));
  const [remainingTime, setRemainingTime] = useState(activeSession?.remainingTime || 0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const sessionDuration = durationMode === "preset" 
    ? presetDuration 
    : (customHours * 60 + customMinutes);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/duration-suggestions');
      const data = await res.json();
      setSuggestions(data);
      if (data.length > 0 && !presetDuration) {
        setPresetDuration(data[0].minutes);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  useEffect(() => {
    if (isStartSessionOpen) {
      fetchSuggestions();
      setDurationMode("preset");
      setCustomHours(0);
      setCustomMinutes(0);
      setCustomerName("");
    }
  }, [isStartSessionOpen]);

  useEffect(() => {
    const session = getActiveSession(device.id);
    setActiveSession(session);
    setRemainingTime(session?.remainingTime || 0);
  }, [refreshKey, device.id]);

  const deviceImages = device.images && device.images.length > 0 
    ? device.images 
    : device.image 
      ? [device.image] 
      : [];

  const statusClasses = {
    'available': 'bg-green-500/15 text-green-500 border-green-500/30',
    'in-use': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    'ending-soon': 'bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse',
    'offline': 'bg-gray-500/15 text-gray-500 border-gray-500/30',
  };

  const statusIcon = {
    'available': null,
    'in-use': <ClockIcon className="h-3 w-3 mr-1" />,
    'ending-soon': <AlertCircleIcon className="h-3 w-3 mr-1" />,
    'offline': null,
  };

  const handleStartSession = () => {
    try {
      if (!customerName.trim()) {
        toast.error("Please enter customer name");
        return;
      }
      startSession(device.id, sessionDuration, customerName);
      toast.success(`Session started for ${device.name}`);
      setIsStartSessionOpen(false);
      if (onSessionChange) onSessionChange();
    } catch (error) {
      toast.error(`Failed to start session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStopSession = (saveRemainingTime: boolean = false) => {
    try {
      const savedTime = stopSession(device.id, saveRemainingTime);
      if (saveRemainingTime && savedTime) {
        toast.success(`Session stopped. ${formatTime(savedTime.minutes)} saved.`);
      } else {
        toast.success(`Session stopped for ${device.name}`);
      }
      setIsStopSessionOpen(false);
      if (onSessionChange) onSessionChange();
    } catch (error) {
      toast.error(`Failed to stop session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getDeviceTypeLabel = (type: string) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType?.name || type;
  };

  const getStatusColor = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (device.status) {
      case 'available': return 'default';
      case 'in-use': return 'secondary';
      case 'ending-soon': return 'destructive';
      case 'offline': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className={cn(
      "gaming-card border-primary/10",
      device.status === 'offline' && "opacity-70"
    )}>
      <div className="w-full h-36 bg-gray-950 flex items-center justify-center border-b border-white/5 relative group">
        {deviceImages.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full w-full">
              {deviceImages.map((img, i) => (
                <CarouselItem key={i} className="flex justify-center items-center h-36 w-full">
                  <img
                    src={img}
                    alt={`${device.name} image ${i + 1}`}
                    className="object-contain h-32 w-full cursor-pointer transition-transform duration-500 hover:scale-105"
                    onClick={() => { setGalleryIndex(i); setShowGallery(true); }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-700">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">No Image</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-[10px] font-bold border-white/10 text-muted-foreground uppercase tracking-widest px-2 py-0">
            {getDeviceTypeLabel(device.type)}
          </Badge>
          <Badge variant={getStatusColor()} className={cn(
            "text-[10px] font-bold px-2 py-0 uppercase tracking-wider",
            device.status === 'available' && "bg-primary/20 text-primary border-primary/20 neon-glow-primary",
            device.status === 'in-use' && "bg-primary/40 text-white border-primary/40",
            device.status === 'ending-soon' && "bg-primary text-white animate-pulse"
          )}>
            <span className="flex items-center">
              {device.status.replace('-', ' ')}
            </span>
          </Badge>
        </div>
        <CardTitle className="text-lg font-bold tracking-tight">{device.name}</CardTitle>
        <CardDescription className="line-clamp-1 text-xs">{device.specs}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {device.status === 'in-use' || device.status === 'ending-soon' ? (
          <div className="space-y-2">
            {activeSession && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium text-primary">{activeSession.customerName || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Started:</span>
                  <span>
                    {new Date(activeSession.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{formatTime(activeSession.duration)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className={`font-medium ${remainingTime <= 5 ? 'text-amber-500' : ''}`}>
                    {formatTime(Math.ceil(remainingTime))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>{formatCurrency(activeSession.amountCharged || 0)}</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm py-2">
            <span className="text-muted-foreground">Hourly Rate:</span>
            <span>{formatCurrency(device.hourlyRate)}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex gap-2">
        {device.status === 'available' ? (
          <Dialog open={isStartSessionOpen} onOpenChange={setIsStartSessionOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlayIcon className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Session</DialogTitle>
                <DialogDescription>
                  Start a new gaming session for {device.name}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Customer Name</Label>
                  <Input 
                    id="customer-name"
                    placeholder="Enter customer name..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Select Duration</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <Button
                        key={s.id}
                        type="button"
                        variant={durationMode === 'preset' && presetDuration === s.minutes ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setDurationMode("preset");
                          setPresetDuration(s.minutes);
                        }}
                      >
                        {s.label}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={durationMode === 'custom' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDurationMode("custom")}
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
                          className="w-20"
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
                          className="w-20"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-end border-t pt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Rate: {formatCurrency(device.hourlyRate)} per jam</p>
                    <p className="text-sm font-medium text-primary">{formatTime(sessionDuration)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total to pay</p>
                    <p className="text-xl font-bold">{formatCurrency(device.hourlyRate * (sessionDuration / 60))}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStartSessionOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStartSession} disabled={sessionDuration <= 0 || !customerName.trim()}>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : device.status === 'in-use' || device.status === 'ending-soon' ? (
          <>
            <Dialog open={isStopSessionOpen} onOpenChange={setIsStopSessionOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>End Active Session</DialogTitle>
                  <DialogDescription>
                    Stop the session for {device.name}. Option to save remaining time for customers.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {remainingTime > 0 && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">Remaining time:</p>
                      <p className="text-2xl font-semibold">{formatTime(Math.ceil(remainingTime))}</p>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => handleStopSession(false)} className="w-full sm:w-auto">
                    End Session
                  </Button>
                  {remainingTime > 0 && (
                    <Button onClick={() => handleStopSession(true)} className="w-full sm:w-auto">
                      <SaveIcon className="h-4 w-4 mr-2" />
                      Save Time
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Session info</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <Button variant="outline" className="w-full" disabled>Offline</Button>
        )}
      </CardFooter>
      <ImageGalleryModal images={deviceImages} open={showGallery} onClose={() => setShowGallery(false)} initialIndex={galleryIndex} />
    </Card>
  );
};

export default DeviceCard;
