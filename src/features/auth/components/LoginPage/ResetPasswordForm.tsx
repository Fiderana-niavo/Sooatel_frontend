import React, { useState } from "react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Lock } from "lucide-react";

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => Promise<void>;
  onCancel: () => void;
}

const accentColor = "from-[#e4a192] to-[#d89282]";

export function ResetPasswordForm({ onSubmit, onCancel }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit(newPassword);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left-8 duration-500 mt-8 md:mt-0">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Nouveau mot de passe</h2>
        <p className="text-slate-500 min-h-[40px]">
          Veuillez configurer un nouveau mot de passe pour votre compte.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Nouveau mot de passe</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
                <Lock className="size-5" />
              </div>
              <Input 
                type="password" 
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Confirmer le mot de passe</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
                <Lock className="size-5" />
              </div>
              <Input 
                type="password" 
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className={`w-full py-6 rounded-xl text-base font-semibold shadow-lg shadow-[#e4a192]/30 transition-all duration-300 group
              bg-gradient-to-r ${accentColor} hover:scale-[1.02] active:scale-[0.98] border-0 text-[#223c56]
              disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer et se connecter"}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost"
            onClick={onCancel}
            className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors py-6 rounded-xl"
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
