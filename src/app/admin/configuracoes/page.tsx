import { AdminShell } from "@/components/layout/admin-shell";
import { CompanySettingsContent } from "@/components/settings/company-settings-content";
import { getCompanySettings } from "@/lib/actions/company-settings";

export default async function ConfiguracoesPage() {
  const settings = await getCompanySettings();

  return (
    <AdminShell>
      <CompanySettingsContent settings={settings} />
    </AdminShell>
  );
}
