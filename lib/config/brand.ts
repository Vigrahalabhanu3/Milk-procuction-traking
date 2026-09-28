export const brandConfig = {
  name: "DairyFlow",
  tagline: "Smart Milk Management for Modern Dairy Farms",
  secondaryTagline: "Track. Manage. Grow.",
  logoUrl:
    process.env.NEXT_PUBLIC_LOGO_URL ||
    "https://res.cloudinary.com/dzu7g2yts/image/upload/v1790573800/ChatGPT_Image_Sep_28_2026_10_31_10_AM_ts1tni.png",
  description:
    "Comprehensive milk collection, quality analytics, and payout management platform designed for modern dairy cooperatives and farmers.",
  supportEmail: "support@dairyflow.com",
  adminEmail: process.env.ADMIN_EMAIL || "admin@dairyflow.com",
  farmerEmail: process.env.FARMER_EMAIL || "farmer@dairyflow.com",
};
