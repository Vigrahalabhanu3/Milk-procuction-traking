"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { BrandMark } from "@/components/brand/brand-mark";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/toast";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Sparkles } from "lucide-react";

export default function FarmerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotNotice, setForgotNotice] = useState(false);

  // Quick fill demo credentials
  const fillDemoCreds = () => {
    setEmail("farmer@dairyflow.com");
    setPassword("Farmer@123");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setForgotNotice(false);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, "FARMER");
      if (result.success) {
        success("Login successful. Welcome back, Ramesh Kumar!");
        router.push("/farmer/dashboard");
      } else {
        const msg = result.error || "Invalid email or password.";
        setErrorMessage(msg);
        toastError(msg);
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCF8] flex flex-col justify-center">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Split-screen Dairy Farm Image (Desktop) */}
        <div className="hidden lg:block lg:col-span-6 relative overflow-hidden bg-[#07452C]">
          <Image
            src="/images/login-farm.jpg"
            alt="Scenic view of modern clean dairy farm at dawn"
            fill
            sizes="(max-width: 1024px) 0vw, 50vw"
            priority
            className="object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07452C]/90 via-[#07452C]/40 to-transparent" />

          {/* Top Left Home Link */}
          <div className="absolute top-8 left-8 z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.farmerLogin.backToHome}</span>
            </Link>
          </div>

          {/* Overlay Content */}
          <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#F4C95D]">
              <BrandMark size={20} priority />
              {t.farmerLogin.portalBadge}
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-snug">
              {t.farmerLogin.leftBannerTitle}
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-md">
              {t.farmerLogin.leftBannerDesc}
            </p>
          </div>
        </div>

        {/* Right Column: Farmer Login Form */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-center px-4 sm:px-10 md:px-16 lg:px-20 py-8 sm:py-12 bg-white min-h-screen lg:min-h-0">
          <div className="max-w-md w-full mx-auto space-y-6 sm:space-y-8">
            {/* Top Navigation Bar with Logo, Mobile Back Link, and Small Circular Language Selector */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE8DF]/60">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FAFCF8] border border-[#DDE8DF] text-[#17231D] hover:text-[#0B5D3B] hover:bg-[#0B5D3B]/5 transition-colors touch-manipulation"
                  aria-label={t.farmerLogin.backToHome}
                  title={t.farmerLogin.backToHome}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Logo size="sm" className="sm:hidden" href="/" />
                <Logo size="md" className="hidden sm:inline-flex" href="/" />
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector variant="circle" />
              </div>
            </div>

            {/* Form Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
                {t.farmerLogin.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#6B756E] mt-1.5 leading-relaxed">
                {t.farmerLogin.subtitle}
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-[#D9534F] font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                <span className="w-2 h-2 rounded-full bg-[#D9534F] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Forgot password feedback */}
            {forgotNotice && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#0B5D3B] font-medium">
                Password reset functionality will be available soon. Please contact your chilling station supervisor.
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  {t.farmerLogin.emailLabel}
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
                    placeholder={t.farmerLogin.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm text-[#17231D] placeholder:text-[#6B756E]/60 focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 transition-all bg-[#FAFCF8] min-h-[48px]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                    {t.farmerLogin.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotNotice(true)}
                    className="text-xs font-semibold text-[#0B5D3B] hover:underline"
                  >
                    {t.farmerLogin.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.farmerLogin.passwordPlaceholder}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm text-[#17231D] placeholder:text-[#6B756E]/60 focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 transition-all bg-[#FAFCF8] min-h-[48px]"
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

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-[#17231D]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DDE8DF] text-[#0B5D3B] focus:ring-[#3A8F3D]"
                  />
                  <span>{t.farmerLogin.rememberMe}</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                loadingText={t.farmerLogin.signingIn}
                className="w-full shadow-md min-h-[48px] text-sm sm:text-base font-bold rounded-xl"
              >
                {t.farmerLogin.signInBtn}
              </Button>
            </form>

            {/* Quick Demo Fill Helper */}
            <div className="pt-1">
              <button
                type="button"
                onClick={fillDemoCreds}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#0B5D3B]/5 hover:bg-[#0B5D3B]/10 active:bg-[#0B5D3B]/15 border border-[#0B5D3B]/15 text-xs sm:text-sm font-semibold text-[#0B5D3B] transition-colors flex items-center justify-center gap-2 touch-manipulation"
              >
                <Sparkles className="w-4 h-4 text-[#3A8F3D] shrink-0" />
                <span>{t.farmerLogin.demoFillBtn}</span>
              </button>
            </div>

            {/* Registration & Admin links */}
            <div className="pt-4 border-t border-[#DDE8DF] text-center space-y-2.5">
              <p className="text-xs sm:text-sm text-[#6B756E]">
                {t.farmerLogin.noAccount}{" "}
                <Link href="/register" className="font-bold text-[#0B5D3B] hover:underline inline-block py-1">
                  {t.farmerLogin.registerLink}
                </Link>
              </p>
              <p className="text-xs sm:text-sm text-[#6B756E]">
                Are you a dairy supervisor or administrator?{" "}
                <Link href="/admin/login" className="font-bold text-[#3A8F3D] hover:underline inline-block py-1">
                  Admin Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
