import SettingsClient from "./SettingsClient";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="text-ink-muted text-sm mt-1">Store-wide configuration</p>
      </div>
      <SettingsClient />
    </div>
  );
}
