'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { PrayerTimesSection } from '@/components/landing/PrayerTimesSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { KajianSection } from '@/components/landing/KajianSection';
import { MimbarJumatSection } from '@/components/landing/MimbarJumatSection';
import { BeritaSection } from '@/components/landing/BeritaSection';
import { GallerySection } from '@/components/landing/GallerySection';
import { SponsorsLandingSection } from '@/components/landing/SponsorsLandingSection';
import { DonationSection } from '@/components/landing/DonationSection';
import { QurbanSection } from '@/components/landing/QurbanSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { TentangKamiSection } from '@/components/landing/TentangKamiSection';
import { SejarahSection } from '@/components/landing/SejarahSection';
import { VisiMisiSection } from '@/components/landing/VisiMisiSection';
import { StrukturSection } from '@/components/landing/StrukturSection';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-white">
			<HeroSection />
			<PrayerTimesSection />
			<SponsorsLandingSection />
			<TentangKamiSection />
			<VisiMisiSection />
			<ServicesSection />
			<KajianSection />
			<SejarahSection />
			<MimbarJumatSection />
			<StrukturSection mode="landing" />
			<BeritaSection />
			<GallerySection />
			<QurbanSection />
			<DonationSection />
			<ContactSection />
		</div>
	);
}
