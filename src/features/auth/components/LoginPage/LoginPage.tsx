import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import sooatelLogo from "@/assets/Sooatel.jpeg";
import { LoginForm } from "./LoginForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<"login" | "forgotPassword" | "resetPassword">("login");

  const handleLogin = async (username: string, password: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Here you would typically call your real backend API
        console.log("Login attempt:", { username, password });
        onLogin();
        resolve();
      }, 1200);
    });
  };

  const handleForgotEmail = async (email: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Password recovery email requested for:", email);
        alert("Si l'adresse email existe, un nouveau mot de passe y a été envoyé.");
        setView("login");
        resolve();
      }, 1200);
    });
  };

  const handleForgotKey = async (key: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Recovery key validated:", key);
        setView("resetPassword");
        resolve();
      }, 1200);
    });
  };

  const handleResetPassword = async (newPassword: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Password reset successfully");
        alert("Votre mot de passe a été réinitialisé avec succès.");
        setView("login");
        resolve();
      }, 1200);
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
              Bienvenue sur <br/>
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
            <ForgotPasswordForm 
              onBackToLogin={() => setView("login")}
              onSubmitEmail={handleForgotEmail}
              onSubmitKey={handleForgotKey}
            />
          ) : (
            <ResetPasswordForm 
              onSubmit={handleResetPassword}
              onCancel={() => setView("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
