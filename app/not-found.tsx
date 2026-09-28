import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFCF8] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div className="w-20 h-20 rounded-3xl bg-[#0B5D3B]/5 border border-[#DDE8DF] flex items-center justify-center text-[#0B5D3B] mb-6 shadow-sm">
        <Search className="w-10 h-10 text-[#3A8F3D]" />
      </div>

      <h1 className="text-4xl font-extrabold text-[#17231D] tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-base text-[#6B756E] max-w-md mb-8">
        The dairy record or page you requested could not be located. It might have been moved or the address is incorrect.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5D3B] text-white font-semibold text-sm hover:bg-[#07452C] transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#DDE8DF] bg-white text-[#17231D] font-semibold text-sm hover:bg-[#FAFCF8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
