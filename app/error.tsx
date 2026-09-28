"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFCF8] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div className="w-20 h-20 rounded-3xl bg-[#D9534F]/10 border border-[#D9534F]/20 flex items-center justify-center text-[#D9534F] mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <h1 className="text-3xl font-extrabold text-[#17231D] tracking-tight mb-3">
        Something unexpected happened
      </h1>
      <p className="text-base text-[#6B756E] max-w-md mb-8">
        We encountered a momentary glitch while processing your request. Rest assured, your dairy records and session are safe.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5D3B] text-white font-semibold text-sm hover:bg-[#07452C] transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#DDE8DF] bg-white text-[#17231D] font-semibold text-sm hover:bg-[#FAFCF8] transition-colors"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
