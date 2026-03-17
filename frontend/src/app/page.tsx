'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { PrayerTimesSection } from '@/components/landing/PrayerTimesSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { KajianSection } from '@/components/landing/KajianSection';
import { MimbarJumatSection } from '@/components/landing/MimbarJumatSection';
import { BeritaSection } from '@/components/landing/BeritaSection';
import { DonationSection } from '@/components/landing/DonationSection';
import { ContactSection } from '@/components/landing/ContactSection';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-white">
			<HeroSection />
			<PrayerTimesSection />
			<ServicesSection />
			<KajianSection />
			<MimbarJumatSection />
			<BeritaSection />
			<DonationSection />
			<ContactSection />
		</div>
	);
}
