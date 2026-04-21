import { ApiKeysPanel } from "@/features/settings/components/api-keys-panel";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <ApiKeysPanel />
        </div>
      </div>
    </div>
  );
}
