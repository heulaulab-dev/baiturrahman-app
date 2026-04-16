import type { Metadata } from 'next';
import { StrukturSection } from '@/components/landing/StrukturSection';

export const metadata: Metadata = {
  title: 'Struktur Pengurus',
  description: 'Daftar pengurus aktif Masjid Baiturrahim.',
};

export default function StrukturPage() {
  return (
    <main className="min-h-screen bg-white">
      <StrukturSection mode="page" />
    </main>
  );
}
