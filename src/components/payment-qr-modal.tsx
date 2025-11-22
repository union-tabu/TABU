
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Download } from "lucide-react";

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  downloadButtonText: string;
  closeButtonText: string;
}

export function PaymentQRModal({ 
    isOpen, 
    onClose,
    title,
    description,
    downloadButtonText,
    closeButtonText
}: PaymentQRModalProps) {

  const qrImageSrc = "/upi-qr-code.jpg";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <Image
            src={qrImageSrc}
            alt="UPI Payment QR Code"
            width={300}
            height={300}
            className="rounded-lg border"
          />
        </div>
        <DialogFooter className="sm:justify-between gap-2">
           <Button variant="secondary" onClick={onClose}>{closeButtonText}</Button>
           <Button asChild>
            <a href={qrImageSrc} download="tabu-upi-qr-code.jpg">
              <Download className="mr-2 h-4 w-4" />
              {downloadButtonText}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

