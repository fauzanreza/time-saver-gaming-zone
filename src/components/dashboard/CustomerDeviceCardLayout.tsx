
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Info, Image as ImageIcon, Clock } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ImageGalleryModal from "@/components/devices/ImageGalleryModal";
import { formatCurrency, formatTime } from "@/lib/data";
import type { Device } from "@/lib/types";

interface Props {
  device: Device;
  session: any;
  deviceImages: string[];
  showSpecs: boolean;
  onShowSpecs: (v: boolean) => void;
  showGallery: boolean;
  setShowGallery: (v: boolean) => void;
  galleryIndex: number;
  setGalleryIndex: (v: number) => void;
  onOpenSessionDialog: () => void;
  disableBook: boolean;
}

const CustomerDeviceCardLayout: React.FC<Props> = ({
  device,
  session,
  deviceImages,
  showSpecs,
  onShowSpecs,
  showGallery,
  setShowGallery,
  galleryIndex,
  setGalleryIndex,
  onOpenSessionDialog,
  disableBook
}) => {
  // util to map status to badge
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
    <>
      <Card className={cn(
        "gaming-card overflow-hidden group transition-all duration-300",
        device.status !== 'available' ? 'opacity-70' : 'hover:border-primary/50'
      )}>
        <div className="w-full h-40 bg-muted flex items-center justify-center border-b relative">
          {deviceImages.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full w-full">
                {deviceImages.map((img, i) => (
                  <CarouselItem key={i} className="flex justify-center items-center h-40 w-full">
                    <img
                      src={img}
                      alt={`${device.name} image ${i + 1}`}
                      className="object-contain h-36 w-full cursor-pointer transition-transform hover:scale-105"
                      onClick={() => { setGalleryIndex(i); setShowGallery(true); }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
              <ImageIcon className="h-10 w-10 mb-2" />
              <span className="text-xs">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-background/50 hover:bg-background"
              onClick={() => onShowSpecs(true)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="font-bold text-lg">
                {device.name}
              </CardTitle>
              <div className="text-sm font-medium text-primary">
                {formatCurrency(device.hourlyRate)}/jam
              </div>
            </div>
            <Badge variant={getStatusColor()} className={cn(
              "font-bold px-3 py-1 uppercase tracking-wider text-[10px]",
              device.status === 'available' && "bg-green-500/20 text-green-400 border-green-500/30 neon-glow-success",
              device.status === 'in-use' && "bg-secondary/20 text-secondary border-secondary/30",
              device.status === 'ending-soon' && "bg-destructive/20 text-destructive border-destructive/30 pulse"
            )}>
              {device.status === 'in-use' && session ? `${formatTime(session.remainingTime)} Left` :
                device.status === 'ending-soon' && session ? `Ending (${formatTime(session.remainingTime)})` :
                device.status.charAt(0).toUpperCase() + device.status.slice(1).replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {device.status === 'available' ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="text-sm font-medium text-green-500">Available</div>
              <div className="text-xs text-muted-foreground">Ready to use</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="text-sm font-medium text-muted-foreground uppercase">
                In Use
              </div>
              {(device.status === 'in-use' || device.status === 'ending-soon') && session && (
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(session.remainingTime)} left</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pb-4">
          <Button
            className={cn(
              "w-full font-bold transition-all duration-300",
              device.status === 'available' 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            onClick={onOpenSessionDialog}
            disabled={disableBook}
          >
            {device.status === 'available' ? 'Reserve Now' : 'Not Available'}
          </Button>
        </CardFooter>
      </Card>
      <ImageGalleryModal images={deviceImages} open={showGallery} onClose={() => setShowGallery(false)} initialIndex={galleryIndex} />
    </>
  );
};

export default CustomerDeviceCardLayout;
