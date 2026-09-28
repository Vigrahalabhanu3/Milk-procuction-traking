"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/components/brand/logo";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createFarmer } from "@/lib/services/farmer.service";
import { User, Mail, Phone, Lock, Home, MapPin, CheckCircle2, ArrowLeft } from "lucide-react";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    village: z.string().min(2, "Village name is required"),
    address: z.string().min(5, "Full postal address is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { success } = useToast();
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assignedId, setAssignedId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      village: "",
      address: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const newFarmer = await createFarmer({
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      village: data.village,
      address: data.address,
      cattleCount: 4,
      bankAccount: "SBI-9923847123",
      ifsc: "SBIN0001234",
    });

    if (typeof window !== "undefined") {
      try {
        const users = JSON.parse(localStorage.getItem("dairyflow_registered_users") || "[]");
        users.push({
          email: data.email,
          password: data.password,
          role: "FARMER",
          farmerId: newFarmer.farmerId,
          name: newFarmer.name,
        });
        localStorage.setItem("dairyflow_registered_users", JSON.stringify(users));
      } catch {
        // ignore
      }
    }

    setAssignedId(newFarmer.farmerId);
    setIsSubmitted(true);
    success("Account submitted for approval.");
  };

  return (
    <div className="min-h-screen bg-[#FAFCF8] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative">
      {/* Top Header Bar with Home Link & Small Circular Language Selector */}
      <div className="w-full max-w-xl flex items-center justify-between pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B756E] hover:text-[#0B5D3B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.register.backHome}</span>
        </Link>
        <LanguageSelector variant="circle" />
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl border border-[#DDE8DF] shadow-xl p-5 sm:p-8 md:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" href="/" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            {t.register.title}
          </h1>
          <p className="text-sm text-[#6B756E]">
            {t.register.subtitle}
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#0B5D3B]/10 border border-[#0B5D3B]/20 flex items-center justify-center text-[#0B5D3B] mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#3A8F3D]" />
            </div>

            <h3 className="text-xl font-extrabold text-[#17231D]">
              {t.register.successTitle}
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAFCF8] border border-[#DDE8DF] max-w-sm mx-auto text-left space-y-1.5 text-xs">
              <p className="text-[#6B756E]">
                {t.register.assignedIdLabel}: <span className="font-bold text-[#0B5D3B] text-sm">{assignedId}</span>
              </p>
              <p className="text-[#6B756E]">
                Status: <span className="font-semibold text-[#B47805]">Pending Verification</span>
              </p>
              <p className="text-[#6B756E]">
                {t.register.successDesc}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <Button variant="primary">{t.register.goToLoginBtn}</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">{t.register.backHome}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                {t.register.fullNameLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  {...register("fullName")}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE8DF] text-sm text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-[#FAFCF8]"
                />
              </div>
              {errors.fullName && <p className="text-xs text-[#D9534F]">{errors.fullName.message}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  {t.register.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="ramesh@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE8DF] text-sm text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-[#FAFCF8]"
                  />
                </div>
                {errors.email && <p className="text-xs text-[#D9534F]">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  {t.register.phoneLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    {...register("phone")}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE8DF] text-sm text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-[#FAFCF8]"
                  />
                </div>
                {errors.phone && <p className="text-xs text-[#D9534F]">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  {t.register.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE8DF] text-sm text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-[#FAFCF8]"
                  />
                </div>
                {errors.password && <p className="text-xs text-[#D9534F]">{errors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE8DF] text-sm text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-[#FAFCF8]"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-[#D9534F]">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Village */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                {t.register.villageLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  {...register("village")}
                  placeholder="e.g. Green Valley / గ్రామం"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE8DF] text-sm text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-[#FAFCF8]"
                />
              </div>
              {errors.village && <p className="text-xs text-[#D9534F]">{errors.village.message}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">
                {t.register.addressLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                  <Home className="w-4 h-4" />
                </div>
                <input
                  {...register("address")}
                  placeholder="House number, Street, Tehsil, District"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE8DF] text-sm text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-[#FAFCF8]"
                />
              </div>
              {errors.address && <p className="text-xs text-[#D9534F]">{errors.address.message}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              loadingText={t.register.submitting}
              className="w-full shadow-md mt-2"
            >
              {t.register.submitBtn}
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-[#DDE8DF] text-center">
          <p className="text-xs text-[#6B756E]">
            {t.register.alreadyRegistered}{" "}
            <Link href="/login" className="font-bold text-[#0B5D3B] hover:underline">
              {t.register.signInLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
