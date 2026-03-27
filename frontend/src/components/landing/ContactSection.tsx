'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import { CircleFadingPlus } from 'lucide-react';

import { useMosqueInfo } from '@/services/hooks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const layananOptions = [
	'Umum',
	'Reservasi Ruangan',
	'Donasi',
	'Kajian',		
	'Lainnya',
];

export function ContactSection() {
	const { data: mosqueInfo, isLoading } = useMosqueInfo();

	const contactInfo = {
		address: mosqueInfo?.address || 'Jl. Masjid Baiturrahman No. 1, Jakarta Selatan, Indonesia',
		phone: mosqueInfo?.phone || '+62 21 1234 5678',
		email: mosqueInfo?.email || 'info@baiturrahman.or.id',
		website: mosqueInfo?.website || 'https://baiturrahman.or.id',
	};

	const socialLinks = [
		...(mosqueInfo?.instagram ? [{ icon: CircleFadingPlus, href: mosqueInfo.instagram }] : []),
		...(mosqueInfo?.youtube ? [{ icon: CircleFadingPlus, href: mosqueInfo.youtube }] : []),
		...(mosqueInfo?.facebook ? [{ icon: CircleFadingPlus, href: mosqueInfo.facebook }] : []),
	];

	return (
		<section id="kontak" className="py-20 bg-white border-t border-sacred-green">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12"
				>
					<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-sacred-green mb-4">
						Kontak & Lokasi
					</h2>
				</motion.div>

				<div className="grid md:grid-cols-2 gap-12">
					{/* Left: Map & Info */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
					>
						{/* Map Placeholder */}
						<div className="aspect-[4/3] bg-sacred-green/10 border border-sacred-green flex items-center justify-center mb-6">
							<div className="text-center">
								<MapPin size={48} className="text-sacred-green/30 mx-auto mb-2" />
								<span className="text-sm text-sacred-muted">Peta Lokasi Masjid</span>
							</div>
						</div>

						{/* Contact Info */}
						<div className="space-y-4">
							{isLoading ? (
								<>
									<div className="h-4 bg-gray-200 rounded animate-pulse" />
									<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
									<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
								</>
							) : (
								<>
									{contactInfo.address && (
										<div className="flex items-start gap-3">
											<MapPin size={20} className="text-sacred-green flex-shrink-0 mt-0.5" />
											<span className="text-sacred-muted">{contactInfo.address}</span>
										</div>
									)}
									{contactInfo.phone && (
										<div className="flex items-center gap-3">
											<Phone size={20} className="text-sacred-green flex-shrink-0" />
											<span className="text-sacred-muted">{contactInfo.phone}</span>
										</div>
									)}
									{contactInfo.email && (
										<div className="flex items-center gap-3">
											<Mail size={20} className="text-sacred-green flex-shrink-0" />
											<span className="text-sacred-muted">{contactInfo.email}</span>
										</div>
									)}
									{contactInfo.website && (
										<div className="flex items-center gap-3">
											<Globe size={20} className="text-sacred-green flex-shrink-0" />
											<a
												href={contactInfo.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sacred-gold hover:underline"
											>
												{contactInfo.website}
											</a>
										</div>
									)}
								</>
							)}
							<div className="flex items-start gap-3">
								<Clock size={20} className="text-sacred-green flex-shrink-0 mt-0.5" />
								<span className="text-sacred-muted">Shubuh - Isya: 24 Jam | Jumat: Khusus Sholat</span>
							</div>
						</div>

						{/* Social Links */}
						{socialLinks.length > 0 && (
							<div className="flex gap-4 mt-8">
								{socialLinks.map((social) => {
									const Icon = social.icon;
									return (
										<a
											key={social.href}
											href={social.href}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 border border-sacred-green text-sacred-green hover:border-sacred-gold hover:text-sacred-gold transition-colors"
										>
											<Icon size={20} />
										</a>
									);
								})}
							</div>
						)}
					</motion.div>

					{/* Right: Contact Form */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
					>
						<form className="space-y-6">
							<div>
								<label htmlFor="contact-name" className="block text-sm text-sacred-green mb-2">Nama</label>
								<Input
									id="contact-name"
									type="text"
									placeholder="Nama lengkap"
									className="w-full"
								/>
							</div>

							<div className="grid sm:grid-cols-2 gap-4">
								<div>
									<label htmlFor="contact-email" className="block text-sm text-sacred-green mb-2">Email</label>
									<Input
										id="contact-email"
										type="email"
										placeholder="email@contoh.com"
										className="w-full"
									/>
								</div>
								<div>
									<label htmlFor="contact-phone" className="block text-sm text-sacred-green mb-2">WhatsApp</label>
									<Input
										id="contact-phone"
										type="tel"
										placeholder="+62 xxx xxxx xxxx"
										className="w-full"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="contact-service" className="block text-sm text-sacred-green mb-2">Layanan</label>
								<select
									id="contact-service"
									className="w-full px-3 py-2 border border-sacred-green bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sacred-green"
								>
									<option value="">Pilih layanan</option>
									{layananOptions.map((option) => (
										<option key={option} value={option}>{option}</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="contact-message" className="block text-sm text-sacred-green mb-2">Pesan</label>
								<Textarea
									id="contact-message"
									rows={5}
									placeholder="Tulis pesan Anda..."
									className="w-full"
								/>
							</div>

							<button
								type="submit"
								className="w-full bg-sacred-gold text-white py-4 font-serif-cormorant text-lg hover:bg-sacred-gold-light transition-colors"
							>
								Kirim Pesan
							</button>
						</form>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
