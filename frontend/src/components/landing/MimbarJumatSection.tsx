'use client';

import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';

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
		<section className="py-20 bg-white border-t border-[#f0f0f0]">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12"
				>
					<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-[#1a3d2b] mb-4">
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
						<span className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-2 block">
							Khutbah Minggu Ini
						</span>
						<div className="border-2 border-[#1a3d2b] p-8">
							<div className="mb-6">
								<span className="font-mono-jetbrains text-sm text-[#6b6b6b]">{khutbahThisWeek.date}</span>
							</div>

							<h3 className="font-serif-cormorant font-semibold text-xl text-[#1a3d2b] mb-3">
								{khutbahThisWeek.khatib}
							</h3>

							<p className="text-[#1a3d2b] text-lg font-serif-cormorant mb-6">
								"{khutbahThisWeek.tema}"
							</p>

							<div className="space-y-2 pt-6 border-t border-[#f0f0f0]">
								<div className="flex items-center gap-2 text-sm">
									<span className="text-[#6b6b6b]">Imam:</span>
									<span className="text-[#1a3d2b]">{khutbahThisWeek.imam}</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<span className="text-[#6b6b6b]">Muadzin:</span>
									<span className="text-[#1a3d2b]">{khutbahThisWeek.muadzin}</span>
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
							<button className="flex items-center gap-3 border-2 border-[#b8962e] text-[#b8962e] px-6 py-4 hover:bg-[#b8962e] hover:text-white transition-colors duration-300">
								<Download size={20} />
								<span className="font-serif-cormorant">Unduh Khutbah</span>
							</button>
						</div>

						<div>
							<span className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-4 block">
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
											${index !== khutbahArchive.length - 1 ? 'border-[#f0f0f0]' : ''}
											hover:bg-[#fafafa] px-2 -mx-2 transition-colors cursor-pointer
										`}
									>
										<div className="flex items-center gap-3 flex-1">
											<FileText size={16} className="text-[#6b6b6b] flex-shrink-0" />
											<div className="min-w-0">
												<span className="block text-xs text-[#6b6b6b]">{khutbah.date}</span>
												<span className="block text-sm text-[#1a3d2b] truncate">
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
