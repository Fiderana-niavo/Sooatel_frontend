import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { useAppStore } from "@/store/app.store";
import axios from "axios";
import type { ApiResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { connectedUser, setConnectedUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    phoneNumber: "",
    emailContact: "",
  });

  useEffect(() => {
    if (isOpen && connectedUser?.idEmployee) {
      loadProfile();
    }
  }, [isOpen, connectedUser]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axios.get<ApiResponse<any>>(`${BASE}/employees/me/profile`);
      if (!res.data.ok) throw new Error(res.data.error);
      const employee = res.data.payload;
      
      setFormData({
        name: employee.name || "",
        lastname: employee.lastname || "",
        phoneNumber: employee.phoneNumber || "",
        emailContact: employee.emailContact || "",
      });
    } catch (err: any) {
      setError("Erreur lors du chargement de votre profil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedUser?.idEmployee) return;

    try {
      setIsSaving(true);
      setError("");
      
      const res = await axios.put<ApiResponse<any>>(`${BASE}/employees/me/profile`, {
        name: formData.name,
        lastname: formData.lastname,
        phoneNumber: formData.phoneNumber,
        emailContact: formData.emailContact,
      });
      if (!res.data.ok) throw new Error(res.data.error);

      setConnectedUser({
        ...connectedUser,
        name: formData.name,
        lastname: formData.lastname,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification du profil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!connectedUser?.idEmployee) {
    return null; 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Nom</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Prénom</label>
                <Input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Téléphone</label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Numéro de téléphone"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Email de contact</label>
              <Input
                name="emailContact"
                type="email"
                value={formData.emailContact}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
