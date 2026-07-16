import React, { useState } from "react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Mail, Key } from "lucide-react";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSubmitEmail: (email: string) => Promise<void>;
  onSubmitKey: (key: string, username: string) => Promise<void>;
}

const accentColor = "from-[#e4a192] to-[#d89282]";

export function ForgotPasswordForm({ onBackToLogin, onSubmitEmail, onSubmitKey }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<"email" | "key">("email");
  const [username, setUsername] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (recoveryMethod === "email") {
        await onSubmitEmail(username.trim());
      } else {
        await onSubmitKey(recoveryKey.trim(), username.trim());
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left-8 duration-500 mt-8 md:mt-0">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Récupération</h2>
        <p className="text-slate-500 min-h-[40px]">
          {recoveryMethod === "email" 
            ? "Recevez un nouveau mot de passe par email." 
            : "Entrez la clé unique fournie par le manager."}
        </p>
      </div>

      {/* Recovery Method Toggle */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
        <button 
          type="button"
          onClick={() => setRecoveryMethod("email")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${recoveryMethod === "email" ? "bg-white text-[#223c56] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Par Email
        </button>
        <button 
          type="button"
          onClick={() => setRecoveryMethod("key")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${recoveryMethod === "key" ? "bg-white text-[#223c56] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Clé Manager
        </button>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-6">
        {recoveryMethod === "email" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Adresse Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
                <Mail className="size-5" />
              </div>
              <Input 
                type="email" 
                required
                placeholder="ex: admin@sooatel.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Nom d'utilisateur</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
                  <Mail className="size-5" />
                </div>
                <Input 
                  type="text" 
                  required
                  placeholder="ex: admin_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Clé de récupération</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
                  <Key className="size-5" />
                </div>
                <Input 
                  type="text" 
                  required
                  placeholder="ex: X7B9-K2M4-P5L1"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all uppercase"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button 
            type="submit" 
            disabled={isLoading || !username || (recoveryMethod === "key" && !recoveryKey)}
            className={`w-full py-6 rounded-xl text-base font-semibold shadow-lg shadow-[#e4a192]/30 transition-all duration-300 group
              bg-gradient-to-r ${accentColor} hover:scale-[1.02] active:scale-[0.98] border-0 text-[#223c56]
              disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? "Traitement en cours..." : (recoveryMethod === "email" ? "Envoyer le mot de passe" : "Valider la clé")}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost"
            onClick={onBackToLogin}
            className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors py-6 rounded-xl"
          >
            Retour à la connexion
          </Button>
        </div>
      </form>
    </div>
  );
}
