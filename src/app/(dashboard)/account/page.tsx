import { PageHeader } from "@/components/page-header";
import { AccountSubscriptionPanel } from "@/features/account/components/account-subscription-panel";
import { AccountProfilePanel } from "@/features/account/components/account-profile-panel";

export default function AccountPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Account" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <AccountSubscriptionPanel />
          <AccountProfilePanel />
        </div>
      </div>
    </div>
  );
}
