import { CorporateAdmin } from "@/features/admin/corporate-admin";

export default function AdminCorporatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Gifting bundles
        </h1>
        <p className="mt-1 text-sm text-muted">
          Perfect gifting sets for shoppers and corporate sample kits with
          contact-form inquiries.
        </p>
      </div>
      <CorporateAdmin />
    </div>
  );
}
