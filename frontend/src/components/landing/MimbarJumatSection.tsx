'use client';

import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import Link from 'next/link';

const khutbahThisWeek = {
	khatib: 'Ustadz Dr. Abdullah Hakim, M.A.',
	tema: 'Membangun Keluarga Sakinah di Era Digital',
	imam: 'KH. Ahmad Fauzan',
	muadzin: 'Ust. Budi Santoso',
	date: '14 Maret 2026',
};

const khutbahArchive = [
	{ date: '7 Maret 2026', tema: 'Menjaga Lisan dari Ghibah' },
	{ date: '28 Februari 2026', tema: 'Pentingnya Sedekah dalam Islam' },
	{ date: '21 Februari 2026', tema: 'Tanda-Tanda Khusnul Khatimah' },
	{ date: '14 Februari 2026', tema: 'Meneladani Akhlak Rasulullah SAW' },
];

export function MimbarJumatSection() {
	return (
		<section id="mimbar-jumat" className="py-20 bg-white border-t border-sacred-green">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12"
				>
					<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-sacred-green mb-4">
						Mimbar Jumat
					</h2>
				</motion.div>

				<div className="grid md:grid-cols-2 gap-12">
					{/* This Week's Khutbah */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
					>
						<span className="text-xs uppercase tracking-widest text-sacred-muted mb-2 block">
							Khutbah Minggu Ini
						</span>
						<div className="border-2 border-sacred-green p-8">
							<div className="mb-6">
								<span className="font-mono-jetbrains text-sm text-sacred-muted">{khutbahThisWeek.date}</span>
							</div>

							<h3 className="font-serif-cormorant font-semibold text-xl text-sacred-green mb-3">
								{khutbahThisWeek.khatib}
							</h3>

							<p className="text-sacred-green text-lg font-serif-cormorant mb-6">
								"{khutbahThisWeek.tema}"
							</p>

							<div className="space-y-2 pt-6 border-t border-sacred-green">
								<div className="flex items-center gap-2 text-sm">
									<span className="text-sacred-muted">Imam:</span>
									<span className="text-sacred-green">{khutbahThisWeek.imam}</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<span className="text-sacred-muted">Muadzin:</span>
									<span className="text-sacred-green">{khutbahThisWeek.muadzin}</span>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Download & Archive */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
					>
						<div className="mb-8">
							<Link href="#" className="flex items-center gap-3 border-2 border-sacred-gold text-sacred-gold px-6 py-4 hover:bg-sacred-gold hover:text-white transition-colors duration-300">
								<Download size={20} />
								<span className="font-serif-cormorant">Unduh Khutbah</span>
							</Link>
						</div>

						<div>
							<span className="text-xs uppercase tracking-widest text-sacred-muted mb-4 block">
								Archive
							</span>
							<div className="space-y-0">
								{khutbahArchive.map((khutbah, index) => (
									<motion.div
										key={khutbah.date}
										initial={{ opacity: 0, y: 10 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
										className={`
											py-4 border-t flex items-center justify-between gap-4
											${index !== khutbahArchive.length - 1 ? 'border-sacred-green' : ''}
											hover:bg-sacred-green px-2 -mx-2 transition-colors cursor-pointer
										`}
									>
										<div className="flex items-center gap-3 flex-1">
											<FileText size={16} className="text-sacred-muted flex-shrink-0 cursor-pointer" />
											<div className="min-w-0">
												<span className="block text-xs text-sacred-muted">{khutbah.date}</span>
												<span className="block text-sm text-sacred-green truncate cursor-pointer">
													{khutbah.tema}
												</span>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
