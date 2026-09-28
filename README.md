# Milk-procuction-traking

# DairyFlow — Modern Milk Production & Dairy Management System

A full-stack UI-first web application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. DairyFlow empowers cooperative dairies and chilling centers to manage milk collections, fat/SNF quality metrics, automated pricing formulas, farmer ledger payments, and multi-language operations.

🌐 **Live Production App**: [https://milk-production-tracking.vercel.app](https://milk-production-tracking.vercel.app)

---

## 🚀 Key Features

* **Dual-Portal Role Architecture**:
  * **Farmer Portal**: Daily morning/evening milk collection records, fat & SNF testing history, automated payments ledger, notification center, and mobile profile settings.
  * **Admin / Supervisor Portal**: Real-time collections dispatch, farmer directory & enrollment, configurable rate charts (Fat % + SNF % matrix formulas), payment batch disbursements, announcements, and compliance audit logs.
* **Mobile-First Experience**:
  * Dedicated app-like bottom navigation bar for mobile farmers.
  * Responsive 48px touch targets, zero horizontal overflow, and auto-zoom prevention.
* **Bilingual Multi-Language Support**:
  * Seamless instantaneous toggling between **English** and **తెలుగు** (Telugu) across all pages.
  * Minimalist circular language selector with accessible popup selection.
* **Smart Quality & Rate Engine**:
  * Supports Cow, Buffalo, and Mixed milk types with standard pricing formulas based on Fat % and SNF %.
* **Mock Service Architecture**:
  * Decoupled mock repository pattern ready for PostgreSQL + Prisma migration without UI disruption.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Components & Icons**: Lucide React, shadcn/ui patterns
* **Animation**: Framer Motion
* **Forms & Validation**: React Hook Form, Zod
* **Deployment**: [Vercel](https://vercel.com/)

---

## 📦 Getting Started

### Prerequisites

* Node.js 18+ or 20+
* npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Vigrahalabhanu3/Milk-procuction-traking.git
cd Milk-procuction-traking

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Portal |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@dairyflow.com` | `Farmer@123` | [/login](https://milk-production-tracking.vercel.app/login) |
| **Admin** | `admin@dairyflow.com` | `Admin@123` | [/admin/login](https://milk-production-tracking.vercel.app/admin/login) |

*(Quick-fill 1-click demo buttons are provided on both login screens).*

---

## 📜 License

MIT License. Designed and built for cooperative dairy farming and milk tracking operations.
