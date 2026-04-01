'use client';

import { motion } from 'framer-motion';
import { Shield, FileText, QrCode, Calculator, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { usePaymentMethods, createDonation } from '@/services/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const stats = [
	{ value: '50.000+', label: 'Jamaah/Bulan' },
	{ value: '200+', label: 'Kajian/Tahun' },
	{ value: '15+', label: 'Tahun Berdiri' },
	{ value: '1.000+', label: 'Muallaf Dibina' },
];

export function DonationSection() {
	const [showCalculator, setShowCalculator] = useState(false);
	const [showDonationForm, setShowDonationForm] = useState(false);
	const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
	const [donationAmount, setDonationAmount] = useState('');
	const [donorName, setDonorName] = useState('');
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
	const [donationMessage, setDonationMessage] = useState('');
	const [donationSuccess, setDonationSuccess] = useState(false);

	const { data: paymentMethods, isLoading: paymentLoading } = usePaymentMethods();

	const donationMutation = useMutation({
		mutationFn: (data: { donor_name: string; amount: number; payment_method_id: string; message?: string }) =>
			createDonation(data),
		onSuccess: () => {
			setDonationSuccess(true);
			setDonationAmount('');
			setDonorName('');
			setDonationMessage('');
			setSelectedPaymentMethod(null);
			setTimeout(() => setDonationSuccess(false), 3000);
		},
	});

	const handleCopyAccount = (accountNumber: string) => {
		navigator.clipboard.writeText(accountNumber);
		setCopiedAccount(accountNumber);
		setTimeout(() => setCopiedAccount(null), 2000);
	};

	const handleDonationSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!donorName || !donationAmount || !selectedPaymentMethod) return;

		donationMutation.mutate({
			donor_name: donorName,
			amount: parseFloat(donationAmount),
			payment_method_id: selectedPaymentMethod,
			message: donationMessage,
		});
	};

	// Group payment methods by type
	const bankMethods = paymentMethods?.filter((pm) => pm.type === 'bank_transfer') || [];
	const qrisMethods = paymentMethods?.filter((pm) => pm.type === 'qris') || [];
	const ewalletMethods = paymentMethods?.filter((pm) => pm.type === 'ewallet') || [];

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
								<Button
									type="button"
									variant="ghost"
									className="relative h-auto p-0 text-sm font-normal text-sacred-gold hover:bg-transparent hover:text-sacred-gold"
									onClick={() => console.log('Download report')}
								>
									Laporan Transparansi
									<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
								</Button>
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

							<motion.div
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								viewport={{ once: true }}
							>
								<Button
									type="button"
									variant="outline"
									className="h-auto w-full rounded-none border-sacred-green py-3 font-serif-cormorant text-sacred-green hover:bg-sacred-green hover:text-white"
									onClick={() => {
										setShowDonationForm(!showDonationForm);
										setShowCalculator(false);
									}}
								>
									Isi Form Donasi
								</Button>
							</motion.div>
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
							{qrisMethods.length > 0 && qrisMethods[0].qr_code_url ? (
								<Image
									src={qrisMethods[0].qr_code_url}
									alt="QRIS Masjid Baiturrahman"
									width={160}
									height={160}
									className="mb-4"
								/>
							) : (
								<QrCode size={160} className="text-sacred-green mb-4" />
							)}
							<span className="text-sm text-sacred-muted">Scan untuk Donasi</span>
							<span className="text-xs text-sacred-gold mt-1">QRIS Masjid Baiturrahman</span>
							{qrisMethods.length > 0 && qrisMethods[0].instructions && (
								<p className="text-xs text-sacred-muted mt-2 text-center">{qrisMethods[0].instructions}</p>
							)}
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
							{paymentLoading ? (
								<div className="p-4 border border-sacred-green">
									<div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
									<div className="h-6 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
									<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
								</div>
							) : bankMethods.length > 0 ? (
								bankMethods.map((bank, index) => (
									<motion.div
										key={bank.id}
										initial={{ opacity: 0, x: 10 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
										className="p-4 border border-sacred-green hover:border-sacred-gold transition-colors"
									>
										<div className="flex justify-between items-start">
											<div>
												<span className="block text-sm text-sacred-muted mb-1">{bank.name}</span>
												<span className="block font-mono-jetbrains text-lg text-sacred-green mb-1">
													{bank.account_number || '--'}
												</span>
												<span className="text-xs text-sacred-muted">a.n. {bank.account_name || '--'}</span>
											</div>
											{bank.account_number && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-8 w-8 shrink-0 text-sacred-muted hover:bg-sacred-green/10 hover:text-sacred-muted"
													onClick={() => handleCopyAccount(bank.account_number!)}
												>
													{copiedAccount === bank.account_number ? (
														<Check size={16} className="text-sacred-gold" />
													) : (
														<Copy size={16} />
													)}
												</Button>
											)}
										</div>
									</motion.div>
								))
							) : (
								<div className="p-4 border border-sacred-green text-center text-sacred-muted text-sm">
									Belum ada metode pembayaran
								</div>
							)}

							{/* E-Wallets */}
							{ewalletMethods.length > 0 && (
								<div className="mt-4">
									<h3 className="text-sm font-medium text-sacred-green mb-2">E-Wallet</h3>
									{ewalletMethods.map((wallet, index) => (
										<motion.div
											key={wallet.id}
											initial={{ opacity: 0, x: 10 }}
											whileInView={{ opacity: 1, x: 0 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.1 }}
											className="p-4 border border-sacred-green hover:border-sacred-gold transition-colors"
										>
											<div className="flex justify-between items-start">
												<div>
													<span className="block text-sm text-sacred-muted mb-1">{wallet.name}</span>
													<span className="block font-mono-jetbrains text-lg text-sacred-green mb-1">
														{wallet.account_number || '--'}
													</span>
													<span className="text-xs text-sacred-muted">a.n. {wallet.account_name || '--'}</span>
												</div>
												{wallet.account_number && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-8 w-8 shrink-0 text-sacred-muted hover:bg-sacred-green/10 hover:text-sacred-muted"
														onClick={() => handleCopyAccount(wallet.account_number!)}
													>
														{copiedAccount === wallet.account_number ? (
															<Check size={16} className="text-sacred-gold" />
														) : (
															<Copy size={16} />
														)}
													</Button>
												)}
											</div>
										</motion.div>
									))}
								</div>
							)}
						</div>
					</motion.div>
				</div>

				{/* Donation Form */}
				{showDonationForm && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="mt-12 max-w-lg mx-auto"
					>
						<div className="p-6 border border-sacred-green">
							<h4 className="font-serif-cormorant text-lg text-sacred-green mb-4">Formulir Donasi</h4>

							{donationSuccess ? (
								<div className="text-center py-8">
									<Check size={48} className="text-sacred-gold mx-auto mb-2" />
									<p className="text-sacred-green font-medium">Terima kasih atas donasi Anda!</p>
									<p className="text-xs text-sacred-muted mt-1">Silakan transfer sesuai nominal yang tertera.</p>
								</div>
							) : (
								<form onSubmit={handleDonationSubmit} className="space-y-4">
									<div>
										<label htmlFor="donor-name" className="block text-sm text-sacred-green mb-1">Nama Donatur</label>
										<Input
											id="donor-name"
											type="text"
											value={donorName}
											onChange={(e) => setDonorName(e.target.value)}
											placeholder="Masukkan nama Anda"
											required
										/>
									</div>
									<div>
										<label htmlFor="donation-amount" className="block text-sm text-sacred-green mb-1">Jumlah Donasi (Rp)</label>
										<Input
											id="donation-amount"
											type="number"
											value={donationAmount}
											onChange={(e) => setDonationAmount(e.target.value)}
											placeholder="Masukkan jumlah donasi"
											min="1"
											required
										/>
									</div>
									<div>
										<label htmlFor="payment-method" className="block text-sm text-sacred-green mb-1">Metode Pembayaran</label>
										<select
											id="payment-method"
											value={selectedPaymentMethod || ''}
											onChange={(e) => setSelectedPaymentMethod(e.target.value)}
											className="w-full px-3 py-2 border border-sacred-green bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sacred-green"
											required
										>
											<option value="">Pilih metode pembayaran</option>
											{bankMethods.map((method) => (
												<option key={method.id} value={method.id}>
													{method.name} - {method.account_number}
												</option>
											))}
											{qrisMethods.map((method) => (
												<option key={method.id} value={method.id}>
													QRIS
												</option>
											))}
											{ewalletMethods.map((method) => (
												<option key={method.id} value={method.id}>
													{method.name} - {method.account_number}
												</option>
											))}
										</select>
									</div>
									<div>
										<label htmlFor="donation-message" className="block text-sm text-sacred-muted mb-1">Pesan (opsional)</label>
										<Input
											id="donation-message"
											type="text"
											value={donationMessage}
											onChange={(e) => setDonationMessage(e.target.value)}
											placeholder="Doa atau pesan untuk masjid"
										/>
									</div>
									<Button
										type="submit"
										className="w-full"
										disabled={donationMutation.isPending}
									>
										{donationMutation.isPending ? 'Memproses...' : 'Kirim Donasi'}
									</Button>
									<p className="text-xs text-sacred-muted text-center">
										Setelah mengirim, silakan transfer ke rekening yang dipilih.
									</p>
								</form>
							)}
						</div>
					</motion.div>
				)}

				{/* Zakat Calculator Toggle */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="mt-12 text-center"
				>
					<Button
						type="button"
						variant="ghost"
						className="group relative mx-auto flex h-auto items-center gap-2 rounded-none p-0 font-serif-cormorant text-sacred-green hover:bg-transparent hover:text-sacred-green"
						onClick={() => {
							setShowCalculator(!showCalculator);
							setShowDonationForm(false);
						}}
					>
						<Calculator size={18} />
						<span>Kalkulator Zakat</span>
						<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
					</Button>

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
									<label htmlFor="wealth-total" className="block text-sm text-sacred-green mb-1">Total Harta (Rp)</label>
									<Input
										id="wealth-total"
										type="number"
										placeholder="Masukkan jumlah harta"
										className="w-full"
									/>
								</div>
								<div>
									<label htmlFor="nishab-info" className="block text-sm text-sacred-muted mb-1">Nishab (Rp 85.000.000)</label>
									<span id="nishab-info" className="text-sm text-sacred-green">Minimal untuk wajib zakat</span>
								</div>
									<Button type="button" className="w-full rounded-none">
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
