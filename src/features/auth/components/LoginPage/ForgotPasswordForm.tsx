import React, { useState } from "react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Mail, Key, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSubmitEmail: (email: string) => Promise<void>;
  onSubmitKey: (key: string, username: string) => Promise<void>;
}

type Step = "choice" | "email" | "key";

const accentColor = "from-[#e4a192] to-[#d89282]";

export function ForgotPasswordForm({ onBackToLogin, onSubmitEmail, onSubmitKey }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>("choice");
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");

  const handleReset = () => {
    setIdentifier("");
    setUsername("");
    setRecoveryKey("");
  };

  const goTo = (s: Step) => {
    handleReset();
    setStep(s);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmitEmail(identifier.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmitKey(recoveryKey.trim(), username.trim());
    } finally {
      setIsLoading(false);
    }
  };
  if (step === "choice") {
    return (
      <div className="animate-in fade-in slide-in-from-left-8 duration-500 mt-8 md:mt-0">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Récupération</h2>
          <p className="text-slate-500">Comment souhaitez-vous réinitialiser votre mot de passe ?</p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => goTo("email")}
            className="w-full group flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-[#223c56] hover:bg-white transition-all duration-200 text-left"
          >
            <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#223c56] to-[#2e527a] flex items-center justify-center shadow-md">
              <Mail className="size-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-[#223c56] transition-colors">
                Par email
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Recevez un lien de réinitialisation à votre adresse email.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => goTo("key")}
            className="w-full group flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-[#e4a192] hover:bg-white transition-all duration-200 text-left"
          >
            <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#e4a192] to-[#d89282] flex items-center justify-center shadow-md">
              <Key className="size-5 text-[#223c56]" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-[#e4a192] transition-colors">
                Clé manager
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Utilisez la clé unique fournie par votre manager.
              </p>
            </div>
          </button>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onBackToLogin}
          className="w-full mt-6 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors py-6 rounded-xl"
        >
          Retour à la connexion
        </Button>
      </div>
    );
  }
  if (step === "email") {
    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-500 mt-8 md:mt-0">
        <button
          type="button"
          onClick={() => goTo("choice")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Changer de méthode
        </button>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Réinitialisation par email</h2>
          <p className="text-slate-500">Entrez votre adresse email ou nom d'utilisateur.</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Email ou nom d'utilisateur</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
                <Mail className="size-5" />
              </div>
              <Input
                type="text"
                required
                autoFocus
                placeholder="ex: admin@sooatel.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isLoading || !identifier}
              className={`w-full py-6 rounded-xl text-base font-semibold shadow-lg shadow-[#e4a192]/30 transition-all duration-300 bg-gradient-to-r ${accentColor} hover:scale-[1.02] active:scale-[0.98] border-0 text-[#223c56] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
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
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 mt-8 md:mt-0">
      <button
        type="button"
        onClick={() => goTo("choice")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Changer de méthode
      </button>

      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Clé manager</h2>
        <p className="text-slate-500">Entrez votre nom d'utilisateur et la clé fournie par votre manager.</p>
      </div>

      <form onSubmit={handleKeySubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 ml-1">Nom d'utilisateur</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#223c56] transition-colors">
              <Mail className="size-5" />
            </div>
            <Input
              type="text"
              required
              autoFocus
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
              placeholder="ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={recoveryKey}
              onChange={(e) => setRecoveryKey(e.target.value)}
              className="pl-12 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#223c56]/30 focus-visible:border-[#223c56] rounded-xl text-base transition-all"
            />
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <Button
            type="submit"
            disabled={isLoading || !username || !recoveryKey}
            className={`w-full py-6 rounded-xl text-base font-semibold shadow-lg shadow-[#e4a192]/30 transition-all duration-300 bg-gradient-to-r ${accentColor} hover:scale-[1.02] active:scale-[0.98] border-0 text-[#223c56] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Validation en cours..." : "Valider la clé"}
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
