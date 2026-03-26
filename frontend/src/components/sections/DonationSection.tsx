'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, CreditCard } from 'lucide-react';
import { usePaymentMethods } from '@/services/hooks';

export function DonationSection() {
	const { data: paymentMethods } = usePaymentMethods();

	const methods = Array.isArray(paymentMethods) ? paymentMethods : [];

	return (
		<section
			id='donations'
			className='bg-secondary/30 py-20'
		>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 container'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className='mb-12 text-center'
				>
					<div className='inline-flex justify-center items-center bg-primary mb-4 rounded-full w-16 h-16'>
						<Heart className='text-primary-foreground' size={32} />
					</div>
					<h2 className='mb-4 font-bold text-4xl'>Salurkan Infaq & Sedekah</h2>
					<p className='mx-auto max-w-2xl text-muted-foreground text-lg'>
						Mari berinfak dan bersedekah untuk operasional masjid, kegiatan
						sosial, dan kemakmuran umat
					</p>
				</motion.div>

				<div className='gap-8 grid grid-cols-1 lg:grid-cols-2 mx-auto max-w-5xl'>
					{/* Donation Info */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className='border-2 border-border h-full'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Heart className='text-primary' />
									Cara Berdonasi
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-start gap-3'>
									<div className='flex flex-shrink-0 justify-center items-center bg-secondary rounded-full w-8 h-8 font-semibold text-secondary-foreground'>
										1
									</div>
									<div>
										<h4 className='mb-1 font-semibold'>Pilih Nominal</h4>
										<p className='text-muted-foreground text-sm'>
											Tentukan jumlah donasi yang ingin Anda berikan
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<div className='flex flex-shrink-0 justify-center items-center bg-secondary rounded-full w-8 h-8 font-semibold text-secondary-foreground'>
										2
									</div>
									<div>
										<h4 className='mb-1 font-semibold'>Transfer Pembayaran</h4>
										<p className='text-muted-foreground text-sm'>
											Transfer ke rekening masjid yang tersedia
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<div className='flex flex-shrink-0 justify-center items-center bg-secondary rounded-full w-8 h-8 font-semibold text-secondary-foreground'>
										3
									</div>
									<div>
										<h4 className='mb-1 font-semibold'>Konfirmasi Donasi</h4>
										<p className='text-muted-foreground text-sm'>
											Isi form konfirmasi dan upload bukti transfer
										</p>
									</div>
								</div>
								<div className='pt-4'>
									<Button size='lg' className='w-full'>
										<CreditCard className='mr-2' size={20} />
										Donasi Sekarang
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Bank Accounts */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className='h-full'>
							<CardHeader>
								<CardTitle>Rekening Donasi</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{methods.length > 0 ? (
										methods.map((method) => (
											<div
												key={method.id}
												className='bg-secondary/50 p-4 border border-border rounded-lg'
											>
												<h4 className='mb-2 font-semibold text-lg'>
													{method.name}
												</h4>
												<p className='mb-1 font-bold text-primary text-2xl'>
													{method.account_number}
												</p>
												<p className='text-muted-foreground text-sm'>
													a.n {method.account_name}
												</p>
											</div>
										))
									) : (
										// Placeholder data
										<>
											<div className='bg-secondary/50 p-4 border border-border rounded-lg'>
												<h4 className='mb-2 font-semibold text-lg'>
													Bank Syariah Indonesia
												</h4>
												<p className='mb-1 font-bold text-primary text-2xl'>
													1234567890
												</p>
												<p className='text-muted-foreground text-sm'>
													a.n Masjid Baiturrahim
												</p>
											</div>
											<div className='bg-secondary/50 p-4 border border-border rounded-lg'>
												<h4 className='mb-2 font-semibold text-lg'>
													Bank Muamalat
												</h4>
												<p className='mb-1 font-bold text-primary text-2xl'>
													9876543210
												</p>
												<p className='text-muted-foreground text-sm'>
													a.n Masjid Baiturrahim
												</p>
											</div>
										</>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
