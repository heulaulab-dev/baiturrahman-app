'use client';

import { MosqueProfile } from '@/components/dashboard/MosqueProfile';

export default function ProfilMasjidPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profil Masjid</h1>
        <p className="text-muted-foreground">
          Kelola informasi publik masjid yang tampil di situs dan kontak.
        </p>
      </div>
      <MosqueProfile />
    </div>
  );
}
