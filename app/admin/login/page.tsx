"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/toast";
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fillDemoCreds = () => {
    setEmail("admin@dairyflow.com");
    setPassword("Admin@123");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter administrator credentials.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, "ADMIN");
      if (result.success) {
        success("Administrator access granted. Welcome to DairyFlow!");
        router.push("/admin/dashboard");
      } else {
        const msg = result.error || "Invalid email or password.";
        setErrorMessage(msg);
        toastError(msg);
      }
    } catch {
      setErrorMessage("An unexpected error occurred during administrative authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCF8] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#0B5D3B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#3A8F3D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar with Home Link & Small Circular Language Selector */}
      <div className="w-full max-w-md flex items-center justify-between pb-3 px-1 mb-2 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B756E] hover:text-[#0B5D3B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.adminLogin.backHome}</span>
        </Link>
        <LanguageSelector variant="circle" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#DDE8DF] shadow-xl p-5 sm:p-8 md:p-10 space-y-6 relative z-10">
        {/* Top Logo & Portal Badge */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <Logo size="lg" className="sm:hidden" href="/" />
            <Logo size="xl" className="hidden sm:inline-flex" href="/" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B5D3B] text-white text-xs font-bold tracking-wider uppercase shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F4C95D]" />
            {t.adminLogin.portalBadge}
          </div>

          <p className="text-xs sm:text-sm text-[#6B756E] leading-relaxed">
            {t.adminLogin.subtitle}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D9534F] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D9534F] shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
              {t.adminLogin.emailLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.adminLogin.emailPlaceholder}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm text-[#17231D] placeholder:text-[#6B756E]/60 focus:outline-none focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/20 bg-[#FAFCF8] min-h-[48px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
              {t.adminLogin.passwordLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.adminLogin.passwordPlaceholder}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm text-[#17231D] placeholder:text-[#6B756E]/60 focus:outline-none focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/20 bg-[#FAFCF8] min-h-[48px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center min-w-[44px] text-[#6B756E] hover:text-[#17231D]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            loadingText={t.adminLogin.signingIn}
            className="w-full shadow-md bg-[#0B5D3B] hover:bg-[#07452C] min-h-[48px] text-sm sm:text-base font-bold rounded-xl"
          >
            {t.adminLogin.signInBtn}
          </Button>
        </form>

        {/* Demo Fill */}
        <div>
          <button
            type="button"
            onClick={fillDemoCreds}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#0B5D3B]/5 hover:bg-[#0B5D3B]/10 active:bg-[#0B5D3B]/15 border border-[#0B5D3B]/15 text-xs sm:text-sm font-semibold text-[#0B5D3B] transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3A8F3D]" />
            {t.adminLogin.demoFillBtn}
          </button>
        </div>

        {/* Note */}
        <div className="pt-4 border-t border-[#DDE8DF] text-center">
          <p className="text-xs text-[#6B756E]">
            Are you a milk producer?{" "}
            <Link href="/login" className="font-bold text-[#0B5D3B] hover:underline">
              {t.nav.farmerLogin}
            </Link>
          </p>
          <p className="text-[11px] text-[#6B756E]/70 mt-2">
            {t.adminLogin.cooperativeNotice}
          </p>
        </div>
      </div>
    </div>
  );
}
