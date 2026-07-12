import React, { useState } from "react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { User, Lock, ArrowRight } from "lucide-react";

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  onForgotPasswordClick: () => void;
}

const accentColor = "from-[#e4a192] to-[#d89282]";

export function LoginForm({ onSubmit, onForgotPasswordClick }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(username, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 mt-8 md:mt-0">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Se connecter</h2>
        <p className="text-slate-500">Entrez vos identifiants pour continuer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 ml-1">Nom d'utilisateur ou Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
              <User className="size-5" />
            </div>
            <Input 
              type="text" 
              required
              placeholder="ex: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <button type="button" onClick={onForgotPasswordClick} className="text-xs text-[#223c56] hover:text-[#1a2d41] font-medium transition-colors">Mot de passe oublié ?</button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
              <Lock className="size-5" />
            </div>
            <Input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !username || !password}
          className={`w-full py-6 rounded-xl text-base font-semibold shadow-lg shadow-[#e4a192]/30 transition-all duration-300 group
            bg-gradient-to-r ${accentColor} hover:scale-[1.02] active:scale-[0.98] border-0 text-[#223c56]
            disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#223c56]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Accéder à mon espace
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>

      </form>
    </div>
  );
}
