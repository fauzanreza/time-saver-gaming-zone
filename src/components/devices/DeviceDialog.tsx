
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ImagePlus, ImageMinus } from "lucide-react";
import type { Device, DeviceType } from "@/lib/types";
import { deviceTypes } from "@/lib/deviceTypes";
import { formatIDRInput, parseIDRInput } from "@/lib/data";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import ImageGalleryModal from "./ImageGalleryModal";

// Utility: convert uploaded file(s) to Data URL for preview/storage
const toDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface DeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (device: Partial<Device>) => void;
  device?: Device;
}

export function DeviceDialog({ open, onOpenChange, onSave, device }: DeviceDialogProps) {
  const [formData, setFormData] = useState<Partial<Device>>({
    name: '',
    type: 'gaming-pc',
    specs: '',
    hourlyRate: 0,
    status: 'available',
  });
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData(device);
      // Handle both legacy single image and new multiple images
      if (device.images && device.images.length > 0) {
        setImages(device.images);
      } else if (device.image) {
        setImages([device.image]);
      } else {
        setImages([]);
      }
    } else {
      setFormData({
        name: '',
        type: 'gaming-pc',
        specs: '',
        hourlyRate: 0,
        status: 'available',
      });
      setImages([]);
    }
    setGalleryIndex(0);
  }, [device, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save images to the device
    onSave({ ...formData, images: images });
    onOpenChange(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const datas = await Promise.all(files.map(toDataUrl));
    setImages(prev => [...prev, ...datas]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (idx: number) => {
    const newImgs = images.filter((_, i) => i !== idx);
    setImages(newImgs);
    if (galleryIndex >= newImgs.length) setGalleryIndex(Math.max(0, newImgs.length - 1));
  };

  const handleImageClick = (i: number) => {
    setGalleryIndex(i);
    setShowModal(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{device ? 'Edit Device' : 'Add New Device'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images carousel & upload */}
          <div>
            <Label>Device Photos</Label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="relative w-32 h-32 rounded border bg-gray-100 overflow-hidden flex items-center justify-center">
                {images.length > 0 ? (
                  <div className="w-full h-full">
                    <Carousel opts={{ loop: images.length > 1 }} className="h-full w-full">
                      <CarouselContent className="h-full w-full">
                        {images.map((img, i) => (
                          <CarouselItem key={i} className="relative flex justify-center items-center h-32 w-32" onClick={() => handleImageClick(i)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={`Device photo ${i+1}`} className="object-contain w-full h-full cursor-pointer transition-transform hover:scale-105" />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              title="Remove photo"
                              className="absolute top-1.5 right-1.5 opacity-70"
                              onClick={e => { e.stopPropagation(); handleRemoveImage(i); }}
                            >
                              <ImageMinus className="w-4 h-4" />
                            </Button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {images.length > 1 && (
                        <>
                          <CarouselPrevious />
                          <CarouselNext />
                        </>
                      )}
                    </Carousel>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                    <ImagePlus className="h-10 w-10" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="device-photo-upload"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
                  {images.length === 0 ? "Upload" : "Add More"}
                </Button>
                <span className="text-xs text-muted-foreground">You can add, remove, or change photos</span>
                <span className="text-xs text-muted-foreground">Photo shown on device cards</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as DeviceType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map(type => (
                  <SelectItem key={type.id} value={type.value}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specs">Specifications</Label>
            <Input
              id="specs"
              value={formData.specs}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (Rp)</Label>
            <Input
              id="hourlyRate"
              type="text"
              value={formData.hourlyRate ? formatIDRInput(formData.hourlyRate) : ''}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseIDRInput(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">{device ? 'Update' : 'Add'} Device</Button>
          </DialogFooter>
        </form>
        <ImageGalleryModal images={images} open={showModal} onClose={() => setShowModal(false)} initialIndex={galleryIndex} />
      </DialogContent>
    </Dialog>
  );
}
