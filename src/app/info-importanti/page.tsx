import { AuthGuard } from "@/components/auth-guard";
import { InfoImportantiPageClient } from "./info-importanti-page-client";

export default function InfoImportantiPage() {
  return (
    <AuthGuard>
      <div
        id="main-content"
        className="flex min-h-screen flex-col p-4 sm:p-6 md:p-8 lg:p-10"
      >
        <InfoImportantiPageClient />
      </div>
    </AuthGuard>
  );
}
