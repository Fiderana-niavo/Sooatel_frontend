import React, { useState } from "react";
import { Lock, X } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { PasswordInput } from "@/components/ui/Inputs/password-input";

interface ChangePasswordModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (current: string, next: string) => Promise<void>;
}

export function ChangePasswordModal({ isOpen, isLoading, onClose, onSubmit }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = next.length > 0 && confirm.length > 0 && next !== confirm;
  const disabled = isLoading || !current || !next || !confirm || next !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    await onSubmit(current, next);
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const handleClose = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border/60 rounded-[2rem] shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">Changer le mot de passe</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sécurisez votre accès avec un nouveau mot de passe.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mot de passe actuel */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Mot de passe actuel</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                <Lock className="size-4" />
              </div>
              <PasswordInput
                required
                placeholder="••••••••"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="pl-11 py-5 bg-muted/30 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary rounded-xl text-sm transition-all"
              />
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Nouveau mot de passe</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                <Lock className="size-4" />
              </div>
              <PasswordInput
                required
                placeholder="••••••••"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="pl-11 py-5 bg-muted/30 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary rounded-xl text-sm transition-all"
              />
            </div>
          </div>

          {/* Confirmer le nouveau mot de passe */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Confirmer le nouveau mot de passe</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                <Lock className="size-4" />
              </div>
              <PasswordInput
                required
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`pl-11 py-5 bg-muted/30 border-border/60 focus-visible:ring-1 rounded-xl text-sm transition-all ${
                  mismatch
                    ? "border-red-400 focus-visible:ring-red-300 focus-visible:border-red-400"
                    : "focus-visible:ring-primary/30 focus-visible:border-primary"
                }`}
              />
            </div>
            {mismatch && (
              <p className="text-xs text-red-500 ml-1 animate-in fade-in duration-200">
                Les mots de passe ne correspondent pas.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1 py-5 rounded-xl text-muted-foreground hover:text-foreground"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={disabled}
              className="flex-1 py-5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isLoading ? "Modification..." : "Modifier le mot de passe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
