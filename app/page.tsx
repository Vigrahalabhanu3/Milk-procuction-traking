"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bell, CalendarDays, ClipboardList, Milk, UserPlus, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LanguageSelector } from "@/components/ui/language-selector";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

const copy = {
  en: {
    login: "Login", features: "Features", how: "How it works", badge: "Dairy management, made simple",
    title: "Every collection.", accent: "A clearer picture.", description: "Bring farmers, milk records, and collection earnings together in one easy-to-use place.",
    cta: "Sign in to DairyFlow", secondary: "Explore the features", photo: "Connected to your dairy", photoText: "One platform for farmers and administrators.",
    featureTitle: "Everything your dairy uses, in one place", featureText: "Simple tools for the work you do every day.",
    collection: "Milk collections", collectionText: "Record morning and evening deliveries with quantity, rate, and available quality readings.",
    earnings: "Monthly earnings", earningsText: "See collection value, litres supplied, and daily or farmer-wise monthly breakdowns.",
    notifications: "Farmer notifications", notificationsText: "Send updates to all farmers or a selected farmer, and view them in the farmer portal.",
    reports: "Reports & exports", reportsText: "Preview filtered reports and download complete CSV exports for your records.",
    processTitle: "A simple flow, from account to collection", admin: "Admin creates farmer accounts", adminText: "Farmers receive their ID and password from the administrator.",
    sign: "Choose your login", signText: "Use Farmer or Admin on the same login page to access your portal.",
    work: "Keep your records together", workText: "Record collections, review earnings, and follow dairy updates.",
    footer: "Milk records. Clear earnings. Connected farmers.", note: "Earnings show milk collection value; they do not indicate payment received.",
  },
  te: {
    login: "లాగిన్", features: "ఫీచర్లు", how: "ఎలా పనిచేస్తుంది", badge: "సులభమైన డైరీ నిర్వహణ",
    title: "ప్రతి పాల సేకరణ.", accent: "స్పష్టమైన వివరాలు.", description: "రైతులు, పాల సేకరణ రికార్డులు, ఆదాయ వివరాలు—అన్నీ ఒకే చోట సులభంగా చూడండి.",
    cta: "DairyFlowలో లాగిన్ అవ్వండి", secondary: "ఫీచర్లు చూడండి", photo: "మీ డైరీతో అనుసంధానం", photoText: "రైతులు, నిర్వాహకులకు ఒకే వేదిక.",
    featureTitle: "మీ డైరీకి అవసరమైనవి ఒకే చోట", featureText: "రోజువారీ పనులకు సులభమైన సాధనాలు.",
    collection: "పాల సేకరణ", collectionText: "ఉదయం, సాయంత్రం పాల పరిమాణం, ధర, అందుబాటులో ఉన్న నాణ్యత వివరాలు నమోదు చేయండి.",
    earnings: "నెలవారీ ఆదాయం", earningsText: "పాల విలువ, మొత్తం లీటర్లు, రోజు లేదా రైతు వారీ ఆదాయం చూడండి.",
    notifications: "రైతులకు నోటిఫికేషన్లు", notificationsText: "అందరికీ లేదా ఒక రైతుకు సమాచారం పంపండి; రైతులు తమ పోర్టల్‌లో చూడవచ్చు.",
    reports: "రిపోర్టులు & ఎక్స్‌పోర్ట్", reportsText: "ఫిల్టర్ చేసిన రిపోర్టులు చూడండి, పూర్తి CSV ఫైళ్లు డౌన్‌లోడ్ చేయండి.",
    processTitle: "ఖాతా నుంచి పాల సేకరణ వరకు సులభంగా", admin: "అడ్మిన్ రైతు ఖాతా సృష్టిస్తారు", adminText: "రైతుకు ID, పాస్‌వర్డ్‌ను అడ్మిన్ ఇస్తారు.",
    sign: "మీ లాగిన్ ఎంచుకోండి", signText: "ఒకే లాగిన్ పేజీలో Farmer లేదా Admin ఎంచుకోండి.",
    work: "రికార్డులు ఒకే చోట ఉంచండి", workText: "పాల సేకరణ నమోదు చేయండి, ఆదాయం, డైరీ సమాచారాన్ని చూడండి.",
    footer: "పాల రికార్డులు. స్పష్టమైన ఆదాయం. అనుసంధానమైన రైతులు.", note: "ఆదాయం అంటే పాల సేకరణ విలువ మాత్రమే; అందుకున్న చెల్లింపు కాదు.",
  },
};

export default function LandingPage() {
  const { language } = useLanguage();
  const text = copy[language];
  return <div className="min-h-screen bg-[#FAFCF8] text-[#17231D]">
    <header className="sticky top-0 z-30 border-b border-[#DDE8DF] bg-white/95 backdrop-blur-sm"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8"><Logo size="md" /><nav className="hidden items-center gap-7 text-sm font-semibold text-[#53645A] md:flex"><Link href="#features" className="hover:text-[#0B5D3B]">{text.features}</Link><Link href="#how-it-works" className="hover:text-[#0B5D3B]">{text.how}</Link></nav><div className="flex items-center gap-3"><LanguageSelector /><Link href="/login" className={buttonVariants({size: "sm"})}>{text.login}<ArrowRight className="h-4 w-4" /></Link></div></div></header>
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6"><span className="inline-flex items-center gap-2 rounded-full border border-[#DDE8DF] bg-[#EEF5E7] px-3 py-2 text-xs font-semibold text-[#0B5D3B]"><Milk className="h-4 w-4" />{text.badge}</span><h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">{text.title}<span className="mt-2 block text-[#3A8F3D]">{text.accent}</span></h1><p className="max-w-lg text-base leading-relaxed text-[#6B756E] sm:text-lg">{text.description}</p><div className="flex flex-col gap-3 pt-2 sm:flex-row"><Link href="/login" className={buttonVariants({size: "lg"})}>{text.cta}<ArrowRight className="h-5 w-5" /></Link><Link href="#features" className={buttonVariants({variant: "outline", size: "lg"})}>{text.secondary}</Link></div><p className="max-w-lg text-xs leading-relaxed text-[#6B756E]">{text.note}</p></div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-[#DDE8DF] bg-[#0B5D3B] shadow-xl shadow-[#0B5D3B]/10"><Image src="/images/hero-farmer.jpg" alt="Farmer at a dairy farm" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#07452C]/90 via-transparent to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8"><p className="text-xl font-bold">{text.photo}</p><p className="mt-2 text-sm text-white/80">{text.photoText}</p></div></div>
      </section>
      <section id="features" className="scroll-mt-24 border-y border-[#DDE8DF] bg-white py-14 sm:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-8"><div className="mb-8 max-w-2xl"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{text.featureTitle}</h2><p className="mt-3 text-sm text-[#6B756E]">{text.featureText}</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{title: text.collection, description: text.collectionText, icon: Milk}, {title: text.earnings, description: text.earningsText, icon: CalendarDays}, {title: text.notifications, description: text.notificationsText, icon: Bell}, {title: text.reports, description: text.reportsText, icon: ClipboardList}].map(({title, description, icon: Icon}) => <article key={title} className="rounded-2xl border border-[#DDE8DF] bg-[#FAFCF8] p-6"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3E4] text-[#0B5D3B]"><Icon className="h-5 w-5" /></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#6B756E]">{description}</p></article>)}</div></div></section>
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-8 sm:py-20"><h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">{text.processTitle}</h2><div className="mt-9 grid gap-7 md:grid-cols-3">{[{title: text.admin, description: text.adminText, icon: UserPlus}, {title: text.sign, description: text.signText, icon: Users}, {title: text.work, description: text.workText, icon: ClipboardList}].map(({title, description, icon: Icon}, index) => <article key={title}><div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B5D3B] text-sm font-bold text-white">{index + 1}</span><Icon className="h-5 w-5 text-[#3A8F3D]" /></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#6B756E]">{description}</p></article>)}</div></section>
    </main>
    <footer className="bg-[#07452C] text-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><Logo size="md" lightText /><p className="mt-4 text-xs leading-relaxed text-white/70">{text.footer}</p></div><Link href="/login" className="inline-flex items-center gap-2 self-start rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/10 sm:self-auto">{text.login}<ArrowRight className="h-4 w-4" /></Link></div></footer>
  </div>;
}
