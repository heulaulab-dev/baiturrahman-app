'use client'

import { QurbanManagement } from '@/components/dashboard/QurbanManagement'

export default function QurbanPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Kantong Qurban</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola konfigurasi kapasitas, hewan qurban, dan peserta patungan per hewan.
        </p>
      </div>
      <QurbanManagement />
    </div>
  )
}
