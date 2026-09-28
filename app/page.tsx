"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/brand/logo";
import { BrandMark } from "@/components/brand/brand-mark";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Milk,
  Award,
  Receipt,
  LineChart,
  Users,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFCF8] text-[#17231D] flex flex-col selection:bg-[#3A8F3D]/20 selection:text-[#0B5D3B] overflow-x-hidden max-w-full">
      {/* 1. NAVBAR (Streamlined, No Hamburger) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#DDE8DF] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Logo size="sm" className="sm:hidden" href="/" />
          <Logo size="md" className="hidden sm:inline-flex" href="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-semibold text-[#17231D] hover:text-[#0B5D3B] transition-colors"
            >
              {t.nav.features}
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-semibold text-[#17231D] hover:text-[#0B5D3B] transition-colors"
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              href="#about"
              className="text-sm font-semibold text-[#17231D] hover:text-[#0B5D3B] transition-colors"
            >
              {t.nav.about}
            </Link>
          </nav>

          {/* Right Controls: Small Circular Language Selector & Direct Auth Buttons (No Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector variant="circle" />
            <Link
              href="/login"
              prefetch={true}
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              {t.nav.farmerLogin}
            </Link>
            <Link
              href="/admin/login"
              prefetch={true}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}
            >
              {t.nav.adminLogin}
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7CB342]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0B5D3B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline and Call-to-actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5D3B]/10 border border-[#0B5D3B]/20 text-[#0B5D3B] text-xs font-bold tracking-wide uppercase">
                <BrandMark size={20} priority />
                {t.home.heroBadge}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#17231D] tracking-tight leading-[1.12]">
                {t.home.heroTitlePart1}{" "}
                <span className="text-[#3A8F3D]">{t.home.heroTitlePart2}</span>{" "}
                {t.home.heroTitlePart3}
              </h1>

              <p className="text-lg sm:text-xl text-[#6B756E] leading-relaxed max-w-xl font-normal">
                {t.home.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/login"
                  prefetch={true}
                  className={buttonVariants({
                    variant: "primary",
                    size: "lg",
                    className: "w-full sm:w-auto shadow-md gap-2 justify-center",
                  })}
                >
                  <span>{t.home.farmerLoginBtn}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/admin/login"
                  prefetch={true}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto justify-center",
                  })}
                >
                  {t.home.adminConsoleBtn}
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "lg",
                    className: "w-full sm:w-auto text-[#0B5D3B] justify-center",
                  })}
                >
                  {t.home.registerFarmerBtn}
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#DDE8DF] max-w-lg">
                <div>
                  <div className="text-2xl font-black text-[#0B5D3B]">100%</div>
                  <div className="text-xs text-[#6B756E] font-medium">Digital Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0B5D3B]">Instant</div>
                  <div className="text-xs text-[#6B756E] font-medium">Fat/SNF Billing</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0B5D3B]">0%</div>
                  <div className="text-xs text-[#6B756E] font-medium">Manual Errors</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Image with Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              {/* Image Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/hero-farmer.jpg"
                  alt="Professional Indian dairy farmer with healthy cows in a green farm"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                  className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Card 1: Today's Milk */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-4 sm:-bottom-6 left-2 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-[#DDE8DF] flex items-center gap-2.5 sm:gap-3.5 z-10"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center shrink-0">
                  <Milk className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4C95D]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#6B756E] uppercase tracking-wider">{t.home.todayMilk}</p>
                  <p className="text-xl sm:text-2xl font-black text-[#17231D] tracking-tight">1,248 L</p>
                </div>
              </motion.div>

              {/* Floating Card 2: Active Farmers */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -top-3 sm:-top-4 right-2 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-[#DDE8DF] flex items-center gap-2.5 sm:gap-3 z-10"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#3A8F3D]/15 text-[#3A8F3D] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#6B756E] uppercase tracking-wider">{t.home.activeFarmers}</p>
                  <p className="text-lg sm:text-xl font-black text-[#0B5D3B]">48</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (6 CARDS) */}
      <section id="features" className="py-20 bg-white border-y border-[#DDE8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs font-bold uppercase tracking-wider mb-3">
              <BrandMark size={18} />
              {t.home.capabilitiesBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231D] tracking-tight">
              {t.home.capabilitiesTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#6B756E] mt-3">
              {t.home.capabilitiesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Milk Production */}
            <Card hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-5">
                  <Milk className="w-6 h-6 text-[#3A8F3D]" />
                </div>
                <h3 className="text-xl font-bold text-[#17231D] mb-2">{t.home.featureCollectionTitle}</h3>
                <p className="text-sm text-[#6B756E] leading-relaxed">
                  {t.home.featureCollectionDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDE8DF]/60 text-xs font-semibold text-[#0B5D3B] flex items-center gap-1">
                Morning & Evening Shifts <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Card 2: Quality Monitoring */}
            <Card hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-5">
                  <Award className="w-6 h-6 text-[#3A8F3D]" />
                </div>
                <h3 className="text-xl font-bold text-[#17231D] mb-2">{t.home.featureQualityTitle}</h3>
                <p className="text-sm text-[#6B756E] leading-relaxed">
                  {t.home.featureQualityDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDE8DF]/60 text-xs font-semibold text-[#0B5D3B] flex items-center gap-1">
                Automated Fat/SNF Tests <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Card 3: Payment Tracking */}
            <Card hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-5">
                  <Receipt className="w-6 h-6 text-[#3A8F3D]" />
                </div>
                <h3 className="text-xl font-bold text-[#17231D] mb-2">{t.home.featurePayoutsTitle}</h3>
                <p className="text-sm text-[#6B756E] leading-relaxed">
                  {t.home.featurePayoutsDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDE8DF]/60 text-xs font-semibold text-[#0B5D3B] flex items-center gap-1">
                Transparent Billing <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Card 4: Analytics */}
            <Card hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-5">
                  <LineChart className="w-6 h-6 text-[#3A8F3D]" />
                </div>
                <h3 className="text-xl font-bold text-[#17231D] mb-2">{t.home.featureAnalyticsTitle}</h3>
                <p className="text-sm text-[#6B756E] leading-relaxed">
                  {t.home.featureAnalyticsDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDE8DF]/60 text-xs font-semibold text-[#0B5D3B] flex items-center gap-1">
                Production Forecasting <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Card 5: Farmer Management */}
            <Card hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-5">
                  <Users className="w-6 h-6 text-[#3A8F3D]" />
                </div>
                <h3 className="text-xl font-bold text-[#17231D] mb-2">{t.home.featureFarmersTitle}</h3>
                <p className="text-sm text-[#6B756E] leading-relaxed">
                  {t.home.featureFarmersDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDE8DF]/60 text-xs font-semibold text-[#0B5D3B] flex items-center gap-1">
                Complete Member Directory <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Card 6: Reports */}
            <Card hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-5">
                  <FileSpreadsheet className="w-6 h-6 text-[#3A8F3D]" />
                </div>
                <h3 className="text-xl font-bold text-[#17231D] mb-2">{t.home.featureReportsTitle}</h3>
                <p className="text-sm text-[#6B756E] leading-relaxed">
                  {t.home.featureReportsDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDE8DF]/60 text-xs font-semibold text-[#0B5D3B] flex items-center gap-1">
                CSV Export & Printing <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 STEPS) */}
      <section id="how-it-works" className="py-20 bg-[#FAFCF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs font-bold uppercase tracking-wider mb-3">
              <BrandMark size={18} />
              {t.home.workflowBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231D] tracking-tight">
              {t.home.workflowTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#6B756E] mt-3">
              {t.home.workflowSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative bg-white p-8 rounded-3xl border border-[#DDE8DF] shadow-xs flex flex-col items-center text-center">
              <span className="text-5xl font-black text-[#0B5D3B]/20 mb-4 select-none">01</span>
              <div className="w-14 h-14 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center mb-5 shadow-sm">
                <Milk className="w-7 h-7 text-[#F4C95D]" />
              </div>
              <h4 className="text-xl font-bold text-[#17231D] mb-2">{t.home.step1Title}</h4>
              <p className="text-sm text-[#6B756E] leading-relaxed">
                {t.home.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-8 rounded-3xl border border-[#DDE8DF] shadow-xs flex flex-col items-center text-center">
              <span className="text-5xl font-black text-[#3A8F3D]/25 mb-4 select-none">02</span>
              <div className="w-14 h-14 rounded-2xl bg-[#3A8F3D] text-white flex items-center justify-center mb-5 shadow-sm">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-[#17231D] mb-2">{t.home.step2Title}</h4>
              <p className="text-sm text-[#6B756E] leading-relaxed">
                {t.home.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-8 rounded-3xl border border-[#DDE8DF] shadow-xs flex flex-col items-center text-center">
              <span className="text-5xl font-black text-[#7CB342]/30 mb-4 select-none">03</span>
              <div className="w-14 h-14 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center mb-5 shadow-sm">
                <LineChart className="w-7 h-7 text-[#F4C95D]" />
              </div>
              <h4 className="text-xl font-bold text-[#17231D] mb-2">{t.home.step3Title}</h4>
              <p className="text-sm text-[#6B756E] leading-relaxed">
                {t.home.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT SECTION */}
      <section id="about" className="py-20 bg-white border-t border-[#DDE8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative aspect-[16/10] rounded-3xl overflow-hidden shadow-xl border border-[#DDE8DF]">
              <Image
                src="/images/farm-banner.jpg"
                alt="Panoramic green pasture with grazing cows at dawn"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs font-bold uppercase tracking-wider">
                <BrandMark size={18} />
                {t.home.missionBadge}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231D] tracking-tight">
                {t.home.missionTitle}
              </h2>
              <p className="text-base text-[#6B756E] leading-relaxed">
                {t.home.missionDesc}
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#3A8F3D] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#17231D] font-medium">{t.home.missionPoint1}</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#3A8F3D] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#17231D] font-medium">{t.home.missionPoint2}</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#3A8F3D] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#17231D] font-medium">{t.home.missionPoint3}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto bg-[#07452C] text-white py-12 border-t border-[#0B5D3B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" lightText />
              <p className="text-sm text-white/70 max-w-sm">
                {t.home.footerTagline}
              </p>
              <div className="pt-2">
                <LanguageSelector variant="circle" dark />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4C95D] mb-4">{t.home.quickLinks}</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link href="#features" className="hover:text-white transition-colors">{t.nav.features}</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">{t.nav.howItWorks}</Link></li>
                <li><Link href="#about" className="hover:text-white transition-colors">{t.nav.about}</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">{t.home.registerFarmerBtn}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4C95D] mb-4">{t.home.portals}</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link href="/login" className="hover:text-white transition-colors">{t.nav.farmerLogin}</Link></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">{t.nav.adminLogin}</Link></li>
                <li className="pt-2 text-xs text-white/50">{t.home.support}</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
            <p>{t.home.copyright}</p>
            <p>{t.home.slogan}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
