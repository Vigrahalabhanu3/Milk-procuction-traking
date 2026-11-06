import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BrandMark } from "@/components/brand/brand-mark";
import { LanguageSelector } from "@/components/ui/language-selector";
import { LoginScreen } from "@/components/auth/login-screen";

export default function LoginPage() {
  return <div className="min-h-screen bg-[#FAFCF8] grid grid-cols-1 lg:grid-cols-12">
    <div className="hidden lg:block lg:col-span-6 relative overflow-hidden bg-[#07452C]">
      <Image src="/images/login-farm.jpg" alt="Dairy farm at dawn" fill priority sizes="50vw" className="object-cover object-center opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07452C]/90 via-[#07452C]/40 to-transparent" />
      <Link href="/" className="absolute top-8 left-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 text-white text-xs font-semibold"><ArrowLeft className="w-3.5 h-3.5" />Back to Home</Link>
      <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#F4C95D]"><BrandMark size={20} />DairyFlow Portal</div>
        <h2 className="text-3xl font-black tracking-tight">Your Dairy. Your Growth.</h2>
        <p className="text-sm text-white/80">Record milk collections, view earnings, and stay connected.</p>
      </div>
    </div>
    <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-10 md:px-16 lg:px-20 py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-md w-full mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between pb-3 border-b border-[#DDE8DF]/60"><Logo size="md" href="/" /><LanguageSelector variant="circle" /></div>
        <Suspense fallback={<p>Loading sign-in...</p>}><LoginScreen /></Suspense>
      </div>
    </div>
  </div>;
}
