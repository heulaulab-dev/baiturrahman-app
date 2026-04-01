'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Globe, CircleFadingPlus } from 'lucide-react';
import { useMosqueInfo } from '@/services/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

const layananOptions = [
	'Umum',
	'Reservasi Ruangan',
	'Donasi',
	'Kajian',		
	'Lainnya',
];

export function ContactSection() {
	const { data: mosqueInfo, isLoading } = useMosqueInfo();
	const [selectedService, setSelectedService] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [message, setMessage] = useState('');

	const contactInfo = {
		address: mosqueInfo?.address || '',
		phone: mosqueInfo?.phone || '',
		email: mosqueInfo?.email || '',
		website: mosqueInfo?.website || '',
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
						{/* Embedded Map */}
						<div className="mb-6 aspect-4/3 overflow-hidden border border-sacred-green bg-sacred-green/5">
							{mosqueInfo?.maps_embed_url ? (
								<iframe
									title="Peta Lokasi Masjid Baiturrahim"
									src={mosqueInfo.maps_embed_url}
									className="h-full w-full"
									style={{ border: 0 }}
									allowFullScreen
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-sm text-sacred-muted">
									Peta belum dikonfigurasi
								</div>
							)}
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
											<MapPin size={20} className="text-sacred-green shrink-0 mt-0.5" />
											<span className="text-sacred-muted">{contactInfo.address}</span>
										</div>
									)}
									{contactInfo.phone && (
										<div className="flex items-center gap-3">
											<Phone size={20} className="text-sacred-green shrink-0" />
											<span className="text-sacred-muted">{contactInfo.phone}</span>
										</div>
									)}
									{contactInfo.email && (
										<div className="flex items-center gap-3">
											<Mail size={20} className="text-sacred-green shrink-0" />
											<span className="text-sacred-muted">{contactInfo.email}</span>
										</div>
									)}
									{contactInfo.website && (
										<div className="flex items-center gap-3">
											<Globe size={20} className="text-sacred-green shrink-0" />
											<Link
												href={contactInfo.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sacred-gold hover:underline"
											>
												{contactInfo.website}
											</Link>
										</div>
									)}
								</>
							)}
							<div className="flex items-start gap-3">
								<Clock size={20} className="text-sacred-green shrink-0 mt-0.5" />
								<span className="text-sacred-muted">Shubuh - Isya: 24 Jam | Jumat: Khusus Sholat</span>
							</div>
						</div>

						{/* Social Links */}
						{socialLinks.length > 0 && (
							<div className="flex gap-4 mt-8">
								{socialLinks.map((social) => {
									const Icon = social.icon;
									return (
										<Link
											key={social.href}
											href={social.href}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 border border-sacred-green text-sacred-green hover:border-sacred-gold hover:text-sacred-gold transition-colors"
										>
											<Icon size={20} />
										</Link>
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
						<form
							className="space-y-6"
							onSubmit={async (e) => {
								e.preventDefault();
								if (isSubmitting) return;

								setIsSubmitting(true);
								try {
									const res = await fetch('/api/contact', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											name,
											email,
											phone,
											service: selectedService,
											message,
										}),
									});

									const json = (await res.json().catch(() => ({}))) as { error?: string };
									if (!res.ok) {
										throw new Error(json.error || `Failed sending message (${res.status})`);
									}

									toast.success('Pesan terkirim. Terima kasih!');
									setName('');
									setEmail('');
									setPhone('');
									setSelectedService('');
									setMessage('');
								} catch (err) {
									const msg = err instanceof Error ? err.message : 'Gagal mengirim pesan';
									toast.error(msg);
								} finally {
									setIsSubmitting(false);
								}
							}}
						>
							<div>
								<Label htmlFor="contact-name" className="block text-sm text-sacred-green mb-2">
									Nama
								</Label>
								<Input
									id="contact-name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Nama lengkap"
									className="w-full"
									required
								/>
							</div>

							<div className="grid sm:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="contact-email" className="block text-sm text-sacred-green mb-2">
										Email
									</Label>
									<Input
										id="contact-email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="email@contoh.com"
										className="w-full"
										required
									/>
								</div>
								<div>
									<Label htmlFor="contact-phone" className="block text-sm text-sacred-green mb-2">
										WhatsApp
									</Label>
									<Input
										id="contact-phone"
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="+62 xxx xxxx xxxx"
										className="w-full"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="contact-service" className="block text-sm text-sacred-green mb-2">
									Layanan
								</Label>
								<Select value={selectedService} onValueChange={setSelectedService}>
									<SelectTrigger
										id="contact-service"
										className="w-full rounded-none border-sacred-green bg-white text-sm focus:ring-sacred-green"
									>
										<SelectValue placeholder="Pilih layanan" />
									</SelectTrigger>
									<SelectContent>
										{layananOptions.map((option) => (
											<SelectItem key={option} value={option}>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="contact-message" className="block text-sm text-sacred-green mb-2">
									Pesan
								</Label>
								<Textarea
									id="contact-message"
									rows={5}
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Tulis pesan Anda..."
									className="w-full"
									required
								/>
							</div>

							<Button
								type="submit"
								className="w-full rounded-none bg-sacred-gold py-6 font-serif-cormorant text-lg text-white hover:bg-sacred-gold-light"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
							</Button>
						</form>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
