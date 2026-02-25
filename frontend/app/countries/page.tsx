import { Suspense } from "react";
import CountriesContent from "./CountriesContent";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CountriesPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="読み込み中..." />}>
      <CountriesContent />
    </Suspense>
  );
}
