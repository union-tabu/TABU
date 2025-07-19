
"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import type { UserData } from "@/app/te/dashboard/page";

interface EditProfileDialogProps {
    user: UserData;
    userId: string;
}

export function EditProfileDialogTe({ user, userId }: EditProfileDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSave = async () => {
        try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address,
            });
            toast({
                title: "ప్రొఫైల్ నవీకరించబడింది",
                description: "మీ సమాచారం విజయవంతంగా నవీకరించబడింది.",
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "లోపం",
                description: "మీ ప్రొఫైల్‌ను నవీకరించడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
                variant: "destructive",
            });
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>ప్రొఫైల్‌ను సవరించండి</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ప్రొఫైల్‌ను సవరించండి</DialogTitle>
          <DialogDescription>
            ఇక్కడ మీ ప్రొఫైల్‌లో మార్పులు చేయండి. పూర్తయిన తర్వాత సేవ్ క్లిక్ చేయండి.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              మొదటి పేరు
            </Label>
            <Input id="firstName" value={formData.firstName} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              ఇంటి పేరు
            </Label>
            <Input id="lastName" value={formData.lastName} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              ఫోన్
            </Label>
            <Input id="phone" value={formData.phone} onChange={handleChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              చిరునామా
            </Label>
            <Input id="address" value={formData.address} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>మార్పులను సేవ్ చేయండి</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
