
import React, { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Device } from '@/lib/types';
import { deviceTypes } from '@/lib/deviceTypes';
import { startSession, getActiveSession } from '@/lib/data';
import CustomerDeviceCardLayout from "@/components/dashboard/CustomerDeviceCardLayout";
import SessionStartDialog from "@/components/dashboard/SessionStartDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomerDeviceCardProps {
  device: Device;
  onSessionChange: () => void;
  refreshKey: number;
}

const CustomerDeviceCard: React.FC<CustomerDeviceCardProps> = ({
  device,
  onSessionChange,
}) => {
  const [showSpecs, setShowSpecs] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const session = getActiveSession(device.id);

  // Gather device images (supports `images` and fallback to `image`)
  const deviceImages = Array.isArray(device.images) && device.images.length > 0
    ? device.images
    : device.image
      ? [device.image]
      : [];

  const handleStartSession = (duration: number, customerName: string) => {
    try {
      startSession(device.id, duration, customerName);
      toast({
        title: "Session Started",
        description: `Started session on ${device.name} for ${customerName}`,
      });
      onSessionChange();
      setShowStartDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start session",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <CustomerDeviceCardLayout
        device={device}
        session={session}
        deviceImages={deviceImages}
        showSpecs={showSpecs}
        onShowSpecs={setShowSpecs}
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        galleryIndex={galleryIndex}
        setGalleryIndex={setGalleryIndex}
        onOpenSessionDialog={() => setShowStartDialog(true)}
        disableBook={device.status !== "available"}
      />

      {/* Device Specs Modal */}
      <Dialog open={showSpecs} onOpenChange={setShowSpecs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{device.name} Specifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Type</h4>
              <p className="text-sm text-muted-foreground">
                {deviceTypes.find(t => t.value === device.type)?.name || device.type}
              </p>
            </div>
            {device.specs && (
              <div>
                <h4 className="text-sm font-medium">Hardware</h4>
                <p className="text-sm text-muted-foreground">{device.specs}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium">Pricing</h4>
              <p className="text-sm text-muted-foreground">{device.hourlyRate}/jam</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Start Dialog */}
      <SessionStartDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        onStartSession={handleStartSession}
        device={device}
      />
    </>
  );
};

export default CustomerDeviceCard;
