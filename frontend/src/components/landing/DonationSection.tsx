'use client';

import { motion } from 'framer-motion';
import { Shield, FileText, QrCode, Calculator } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const stats = [
	{ value: '50.000+', label: 'Jamaah/Bulan' },
	{ value: '200+', label: 'Kajian/Tahun' },
	{ value: '15+', label: 'Tahun Berdiri' },
	{ value: '1.000+', label: 'Muallaf Dibina' },
];

const bankDetails = [
	{ bank: 'Bank Syariah Indonesia', account: '7123456789', holder: 'Yayasan Baiturrahman' },
	{ bank: 'Bank Mandiri', account: '1234567890123', holder: 'Yayasan Baiturrahman' },
	{ bank: 'Bank BCA', account: '0987654321', holder: 'Yayasan Baiturrahman' },
];

export function DonationSection() {
	const [showCalculator, setShowCalculator] = useState(false);

	return (
		<section id="donasi" className="py-20 bg-white">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mb-12"
				>
					<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-sacred-green mb-4">
						Donasi & Wakaf
					</h2>
					<p className="text-sacred-muted max-w-2xl mx-auto">
						Sedekah dan wakaf Anda akan disalurkan untuk operasional masjid, program pendidikan, dan bantuan sosial.
					</p>
				</motion.div>

				<div className="grid md:grid-cols-3 gap-8">
					{/* Left: Trust Signals */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="md:col-span-1"
					>
						<div className="space-y-6">
							<div className="flex items-center gap-3 p-4 border border-sacred-green">
								<Shield size={24} className="text-sacred-green shrink-0" />
								<div>
									<span className="block text-sm font-medium text-sacred-green">
										Legal & Terdaftar
									</span>
									<span className="text-xs text-sacred-muted">Kemenag RI No. 123/2024</span>
								</div>
							</div>

							<div className="flex items-center gap-3 p-4 border border-sacred-green">
								<FileText size={24} className="text-sacred-green shrink-0" />
								<a href="#" className="text-sm text-sacred-gold relative group">
									Laporan Transparansi
									<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
								</a>
							</div>

							<div className="grid grid-cols-2 gap-3 pt-4">
								{stats.map((stat, index) => (
									<motion.div
										key={stat.label}
										initial={{ opacity: 0, y: 10 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
										className="text-center p-3 bg-white"
									>
										<span className="block font-serif-cormorant font-semibold text-lg text-sacred-green">
											{stat.value}
										</span>
										<span className="text-xs text-sacred-muted">{stat.label}</span>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>

					{/* Center: QRIS */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="md:col-span-1"
					>
						<div className="border-2 border-sacred-green p-8 flex flex-col items-center justify-center aspect-square">
							<QrCode size={160} className="text-sacred-green mb-4" />
							<span className="text-sm text-sacred-muted">Scan untuk Donasi</span>
							<span className="text-xs text-sacred-gold mt-1">QRIS Masjid Baiturrahman</span>
						</div>
					</motion.div>

					{/* Right: Bank Details */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="md:col-span-1"
					>
						<div className="space-y-4">
							{bankDetails.map((bank, index) => (
								<motion.div
									key={bank.bank}
									initial={{ opacity: 0, x: 10 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1 }}
									className="p-4 border border-sacred-green hover:border-sacred-gold transition-colors"
								>
									<span className="block text-sm text-sacred-muted mb-1">{bank.bank}</span>
									<span className="block font-mono-jetbrains text-lg text-sacred-green mb-1">
										{bank.account}
									</span>
									<span className="text-xs text-sacred-muted">a.n. {bank.holder}</span>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>

				{/* Zakat Calculator Toggle */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="mt-12 text-center"
				>
					<button
						onClick={() => setShowCalculator(!showCalculator)}
						className="flex items-center gap-2 mx-auto text-sacred-green font-serif-cormorant relative group"
					>
						<Calculator size={18} />
						<span>Kalkulator Zakat</span>
						<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
					</button>

					{showCalculator && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-6 max-w-md mx-auto p-6 border border-sacred-green"
						>
							<h4 className="font-serif-cormorant text-lg text-sacred-green mb-4">Kalkulator Zakat Maal</h4>
							<div className="space-y-4">
								<div>
									<label className="block text-sm text-sacred-green mb-1">Total Harta (Rp)</label>
									<Input
										type="number"
										placeholder="Masukkan jumlah harta"
										className="w-full"
									/>
								</div>
								<div>
									<label className="block text-sm text-sacred-muted mb-1">Nishab (Rp 85.000.000)</label>
									<span className="text-sm text-sacred-green">Minimal untuk wajib zakat</span>
								</div>
								<Button className="w-full">
									Hitung Zakat
								</Button>
							</div>
						</motion.div>
					)}
				</motion.div>
			</div>
		</section>
	);
}
