import { BrandLoader } from "@/components/brand/brand-loader";

export default function AdminLoading() {
  return (
    <BrandLoader
      message="Loading DairyFlow Admin Console..."
      subMessage="Synchronizing cooperative records, payments, and lab reports"
      fullScreen={false}
      className="min-h-[50vh]"
    />
  );
}
