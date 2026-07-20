import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Copy, Check } from "lucide-react";
import sooatelLogo from "@/assets/Sooatel.jpeg";
import { LoginForm } from "./LoginForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthService } from "../../services/auth.service";
import { useAppStore } from "@/store/app.store";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { Button } from "@/components/ui/Button/button";

interface ManualKeyBlockProps {
  token: string;
  expiresAt: string;
  onUseKey: (key: string) => void;
  onBack: () => void;
}

function ManualKeyBlock({ token, expiresAt, onUseKey, onBack }: ManualKeyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const expiry = new Date(expiresAt).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="animate-in fade-in slide-in-from-left-8 duration-500 mt-8 md:mt-0">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Clé de récupération</h2>
        <p className="text-slate-500">
          Aucun email associé. Transmettez cette clé à l'utilisateur concerné.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clé unique</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-[#223c56] hover:text-[#e4a192] transition-colors"
            >
              {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <p className="font-mono text-sm text-slate-800 break-all select-all bg-white border border-slate-100 rounded-lg px-3 py-2">
            {token}
          </p>
          <p className="text-xs text-slate-400">Expire le {expiry}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Instructions :</p>
          <ol className="list-decimal list-inside space-y-1 text-amber-700">
            <li>Copiez la clé ci-dessus.</li>
            <li>Transmettez-la à l'utilisateur via un canal sécurisé.</li>
            <li>L'utilisateur doit l'entrer dans l'onglet <strong>Clé Manager</strong>.</li>
          </ol>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            onClick={() => onUseKey(token)}
            className="w-full py-6 rounded-xl text-base font-semibold bg-gradient-to-r from-[#e4a192] to-[#d89282] border-0 text-[#223c56] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#e4a192]/30"
          >
            Utiliser cette clé maintenant
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors py-6 rounded-xl"
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    </div>
  );
}

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<"login" | "forgotPassword" | "resetPassword">("login");
  const [resetContext, setResetContext] = useState<{ key: string; username: string } | null>(null);
  const [manualKey, setManualKey] = useState<{ token: string; expiresAt: string } | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get("key");
    const urlUsername = params.get("username");

    if (urlKey && urlUsername) {
      setResetContext({ key: urlKey, username: urlUsername });
      setView("resetPassword");

      // Clean up the URL to prevent the state from sticking
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [snackbar, setSnackbar] = useState<{ message: string, type: SnackbarType, isOpen: boolean }>({
    message: "", type: "info", isOpen: false
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const setConnectedUser = useAppStore((s) => s.setConnectedUser);
  const setPermissions = useAppStore((s) => s.setPermissions);

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      AuthService.login({ username, password }),
    onSuccess: (payload) => {
      localStorage.setItem("authToken", payload.accessToken);
      localStorage.setItem("refreshToken", payload.refreshToken);
      setConnectedUser(payload.user);
      setPermissions(payload.permissions);
      onLogin();
    },
    onError: (err: Error) => {
      console.log(err);
      showSnackbar(err.message ?? "Identifiants incorrects.", "error");
    },
  });

  const handleLogin = (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      loginMutation.mutate(
        { username, password },
        { onSuccess: () => resolve(), onError: (e) => reject(e) },
      );
    });
  };

  const requestResetMutation = useMutation({
    mutationFn: (email: string) => AuthService.requestPasswordReset({ username: email }),
  });

  const validateKeyMutation = useMutation({
    mutationFn: ({ key, username }: { key: string; username: string }) => AuthService.validateResetKey({ key, username }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ key, username, newPassword }: { key: string; username: string; newPassword: string }) =>
      AuthService.changePassword({ key, username, newPassword }),
  });

  const handleForgotEmail = (email: string) => {
    return new Promise<void>((resolve, reject) => {
      requestResetMutation.mutate(email, {
        onSuccess: (data) => {
          if (data.method === "email") {
            showSnackbar("Un email de réinitialisation a été envoyé si ce compte existe.", "info");
            setView("login");
          } else {
            setManualKey({ token: data.token, expiresAt: data.expiresAt });
          }
          resolve();
        },
        onError: (err: Error) => {
          showSnackbar(err.message ?? "Erreur lors de la demande.", "error");
          reject(err);
        },
      });
    });
  };

  const handleForgotKey = (key: string, username: string) => {
    return new Promise<void>((resolve, reject) => {
      validateKeyMutation.mutate({ key, username }, {
        onSuccess: () => {
          setResetContext({ key, username });
          setView("resetPassword");
          resolve();
        },
        onError: (err: Error) => {
          showSnackbar(err.message ?? "Clé ou nom d'utilisateur incorrect.", "error");
          reject(err);
        },
      });
    });
  };

  const handleResetPassword = (newPassword: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!resetContext) {
        reject(new Error("Aucune clé valide trouvée."));
        return;
      }
      changePasswordMutation.mutate(
        { key: resetContext.key, username: resetContext.username, newPassword },
        {
          onSuccess: () => {
            showSnackbar("Votre mot de passe a été réinitialisé avec succès.", "success");
            setResetContext(null);
            setView("login");
            resolve();
          },
          onError: (err: Error) => {
            showSnackbar(err.message ?? "Erreur lors de la réinitialisation.", "error");
            reject(err);
          },
        }
      );
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        {/* Blob 1 */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] mix-blend-multiply opacity-20 animate-in fade-in duration-1000 bg-[#223c56]`} />
        {/* Blob 2 */}
        <div className={`absolute bottom-0 right-1/4 w-[30rem] h-[30rem] rounded-full blur-[140px] mix-blend-multiply opacity-25 animate-in fade-in duration-1000 delay-300 bg-[#e4a192]`} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] mx-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-slate-200 rounded-[2.5rem] p-4 md:p-6 shadow-2xl shadow-[#223c56]/10">

        {/* Left Side: Branding / Intro */}
        <div className="hidden md:flex flex-col justify-center items-start space-y-8 p-8 h-full rounded-[2rem] bg-[#223c56] relative overflow-hidden shadow-inner">
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] bg-white/10 rounded-full`} />

          <div className="space-y-4 relative z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Bienvenue sur <br />
              <span className="text-[#e4a192]">
                Sooatel Hôtel
              </span>
            </h1>
            <p className="text-white/70 text-lg max-w-sm leading-relaxed">
              Connectez-vous pour accéder à votre tableau de bord, gérer vos opérations et piloter vos activités avec précision.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/90 font-medium bg-black/20 px-4 py-2 rounded-full border border-white/10">
            <ShieldCheck className="size-4 text-[#e4a192]" />
            Système d'authentification sécurisé
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-center relative min-h-[400px]">
          {/* Top Right Logo */}
          <div className="absolute top-2 right-2 md:top-2 md:right-2 z-20 group opacity-90 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white p-1 shadow-sm border border-slate-100 transition-transform duration-300 hover:-translate-y-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#223c56]">
                <img src={sooatelLogo} alt="Sooatel Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {view === "login" ? (
            <LoginForm
              onSubmit={handleLogin}
              onForgotPasswordClick={() => setView("forgotPassword")}
            />
          ) : view === "forgotPassword" ? (
            manualKey ? (
              <ManualKeyBlock
                token={manualKey.token}
                expiresAt={manualKey.expiresAt}
                onUseKey={(key) => {
                  setManualKey(null);
                  setView("forgotPassword");
                  // Pre-fill handled by user switching to key tab
                  void key;
                }}
                onBack={() => {
                  setManualKey(null);
                  setView("login");
                }}
              />
            ) : (
              <ForgotPasswordForm
                onBackToLogin={() => setView("login")}
                onSubmitEmail={handleForgotEmail}
                onSubmitKey={handleForgotKey}
              />
            )
          ) : (
            <ResetPasswordForm
              onSubmit={handleResetPassword}
              onCancel={() => setView("login")}
            />
          )}
        </div>
      </div>

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}
    </div>
  );
}
