import { BrandLoader } from "@/components/brand/brand-loader";

export default function FarmerLoading() {
  return (
    <BrandLoader
      message="Loading Farmer Portal..."
      subMessage="Fetching your milk collections and quality metrics"
      fullScreen={false}
      className="min-h-[50vh]"
    />
  );
}
