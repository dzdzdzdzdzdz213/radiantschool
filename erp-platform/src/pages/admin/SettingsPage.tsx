import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Informations du centre</h2>
          <div className="space-y-3">
            <div><label className="mb-1 block text-sm font-medium">Nom du centre</label><input className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue="Radiant Learning" /></div>
            <div><label className="mb-1 block text-sm font-medium">Adresse</label><input className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium">Téléphone</label><input className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium">Wilaya</label>
              <select className="w-full rounded-lg border px-3 py-2 text-sm">
                <option>Alger</option><option>Oran</option><option>Constantine</option>
              </select>
            </div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Enregistrer</button>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Préférences</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm">Notifications email</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Notifications SMS</span>
              <input type="checkbox" className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Factures automatiques</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Devise</span>
              <select className="rounded-lg border px-3 py-1 text-sm"><option>DZD</option><option>EUR</option><option>USD</option></select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
