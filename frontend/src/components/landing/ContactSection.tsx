'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Youtube, Facebook, Twitter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

const contactInfo = {
	address: 'Jl. Masjid Baiturrahman No. 1, Jakarta Selatan, Indonesia',
	phone: '+62 21 1234 5678',
	email: 'info@baiturrahman.or.id',
	hours: 'Shubuh - Isya: 24 Jam | Jumat: Khusus Sholat',
};

const socialLinks = [
	{ icon: Instagram, href: 'https://instagram.com/baiturrahman' },
	{ icon: Youtube, href: 'https://youtube.com/baiturrahman' },
	{ icon: Facebook, href: 'https://facebook.com/baiturrahman' },
	{ icon: Twitter, href: 'https://twitter.com/baiturrahman' },
];

const layananOptions = [
	'Umum',
	'Reservasi Ruangan',
	'Donasi',
	'Kajian',
	'Lainnya',
];

export function ContactSection() {
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
							<div className="flex items-start gap-3">
								<MapPin size={20} className="text-sacred-green flex-shrink-0 mt-0.5" />
								<span className="text-sacred-muted">{contactInfo.address}</span>
							</div>
							<div className="flex items-center gap-3">
								<Phone size={20} className="text-sacred-green flex-shrink-0" />
								<span className="text-sacred-muted">{contactInfo.phone}</span>
							</div>
							<div className="flex items-center gap-3">
								<Mail size={20} className="text-sacred-green flex-shrink-0" />
								<span className="text-sacred-muted">{contactInfo.email}</span>
							</div>
							<div className="flex items-start gap-3">
								<Clock size={20} className="text-sacred-green flex-shrink-0 mt-0.5" />
								<span className="text-sacred-muted">{contactInfo.hours}</span>
							</div>
						</div>

						{/* Social Links */}
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
					</motion.div>

					{/* Right: Contact Form */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
					>
						<form className="space-y-6">
							<div>
								<label className="block text-sm text-sacred-green mb-2">Nama</label>
								<Input
									type="text"
									placeholder="Nama lengkap"
									className="w-full"
								/>
							</div>

							<div className="grid sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-sacred-green mb-2">Email</label>
									<Input
										type="email"
										placeholder="email@contoh.com"
										className="w-full"
									/>
								</div>
								<div>
									<label className="block text-sm text-sacred-green mb-2">WhatsApp</label>
									<Input
										type="tel"
										placeholder="+62 xxx xxxx xxxx"
										className="w-full"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm text-sacred-green mb-2">Layanan</label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Pilih layanan" />
									</SelectTrigger>
									<SelectContent>
										{layananOptions.map((option) => (
											<SelectItem key={option} value={option}>{option}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="block text-sm text-sacred-green mb-2">Pesan</label>
								<Textarea
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
