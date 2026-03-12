
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ImageGalleryModalProps {
  images: string[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ images, open, onClose, initialIndex = 0 }) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  if (!images || images.length === 0) return null;

  const handlePrev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col items-center justify-center max-w-xl">
        <div className="relative w-full flex justify-center items-center mb-2">
          <button
            aria-label="Previous"
            onClick={handlePrev}
            disabled={images.length <= 1}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current]}
            alt={`Device image ${current + 1}`}
            className="object-contain max-h-[60vh] max-w-full rounded border shadow hover-scale transition-transform"
            style={{ margin: "0 auto" }}
          />
          <button
            aria-label="Next"
            onClick={handleNext}
            disabled={images.length <= 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        <div className="text-xs text-muted-foreground mb-1">{current + 1} / {images.length}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryModal;
