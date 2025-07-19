
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
import type { UserData } from "@/app/dashboard/page";

interface EditProfileDialogProps {
    user: UserData;
    userId: string;
}

export function EditProfileDialog({ user, userId }: EditProfileDialogProps) {
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
                title: "Profile Updated",
                description: "Your information has been successfully updated.",
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "Error",
                description: "Could not update your profile. Please try again.",
                variant: "destructive",
            });
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              First Name
            </Label>
            <Input id="firstName" value={formData.firstName} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Last Name
            </Label>
            <Input id="lastName" value={formData.lastName} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={formData.phone} onChange={handleChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input id="address" value={formData.address} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
