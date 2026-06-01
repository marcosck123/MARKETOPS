import { AdminShell } from "@/components/layout/admin-shell";
import { NfContent } from "@/components/nf/nf-content";
import { getAllFiscalRequests } from "@/lib/actions/fiscal-requests";

export default async function NfPage() {
  const requests = await getAllFiscalRequests();
  return (
    <AdminShell>
      <NfContent requests={requests} />
    </AdminShell>
  );
}
