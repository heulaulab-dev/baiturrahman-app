'use client';

import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { resolveBackendAssetUrl } from '@/lib/utils';
import { useLatestKhutbah, useKhutbahArchive } from '@/services/hooks';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function MimbarJumatSection() {
	const { data: latestKhutbah, isLoading: latestLoading } = useLatestKhutbah();
	const { data: khutbahArchive, isLoading: archiveLoading } = useKhutbahArchive();
	const latestPdfHref = resolveBackendAssetUrl(latestKhutbah?.file_url ?? undefined);

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
							{latestLoading ? (
								<div className="space-y-3">
									<div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
									<div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
									<div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
								</div>
							) : latestKhutbah ? (
								<>
									<div className="mb-6">
										<span className="font-mono-jetbrains text-sm text-sacred-muted">
											{format(new Date(latestKhutbah.date), 'd MMMM yyyy', { locale: id })}
										</span>
									</div>

									<h3 className="font-serif-cormorant font-semibold text-xl text-sacred-green mb-3">
										{latestKhutbah.khatib}
									</h3>

									<p className="text-sacred-green text-lg font-serif-cormorant mb-6">
										"{latestKhutbah.tema}"
									</p>

									<div className="space-y-2 pt-6 border-t border-sacred-green">
										{latestKhutbah.imam && (
											<div className="flex items-center gap-2 text-sm">
												<span className="text-sacred-muted">Imam:</span>
												<span className="text-sacred-green">{latestKhutbah.imam}</span>
											</div>
										)}
										{latestKhutbah.muadzin && (
											<div className="flex items-center gap-2 text-sm">
												<span className="text-sacred-muted">Muadzin:</span>
												<span className="text-sacred-green">{latestKhutbah.muadzin}</span>
											</div>
										)}
									</div>

									{latestPdfHref ? (
										<a
											href={latestPdfHref}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-6 flex items-center gap-3 border-2 border-sacred-gold text-sacred-gold px-6 py-4 hover:bg-sacred-gold hover:text-white transition-colors duration-300"
										>
											<Download size={20} />
											<span className="font-serif-cormorant">Unduh / lampiran PDF</span>
										</a>
									) : null}
								</>
							) : (
								<div className="text-center text-sacred-muted py-8">
									Belum ada khutbah minggu ini
								</div>
							)}
						</div>
					</motion.div>

					{/* Download & Archive */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
					>
						{archiveLoading ? (
							<div className="space-y-4">
								<div className="h-12 bg-gray-200 rounded animate-pulse" />
								{[1, 2, 3].map((i) => (
									<div key={i} className="border-t border-sacred-green py-4">
										<div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-1" />
										<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
									</div>
								))}
							</div>
						) : khutbahArchive && khutbahArchive.length > 0 ? (
							<>
								{latestPdfHref ? (
									<div className="mb-8">
										<a
											href={latestPdfHref}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 border-2 border-sacred-gold text-sacred-gold px-6 py-4 hover:bg-sacred-gold hover:text-white transition-colors duration-300"
										>
											<Download size={20} />
											<span className="font-serif-cormorant">Unduh khutbah terbaru</span>
										</a>
									</div>
								) : null}

								<div>
									<span className="text-xs uppercase tracking-widest text-sacred-muted mb-4 block">
										Archive
									</span>
									<div className="space-y-0">
										{khutbahArchive.map((khutbah, index) => {
											const rowPdfHref = resolveBackendAssetUrl(khutbah.file_url ?? undefined)
											return (
												<motion.div
												key={khutbah.id}
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
													<FileText size={16} className="text-sacred-muted shrink-0 cursor-pointer" />
													<div className="min-w-0">
														<span className="block text-xs text-sacred-muted">
															{format(new Date(khutbah.date), 'd MMM yyyy', { locale: id })}
														</span>
														<span className="block text-sm text-sacred-green truncate cursor-pointer">
															{khutbah.tema}
														</span>
													</div>
												</div>
												{rowPdfHref ? (
													<a
														href={rowPdfHref}
														target="_blank"
														rel="noopener noreferrer"
														className="text-sacred-gold hover:text-white transition-colors"
														onClick={(e) => e.stopPropagation()}
													>
														<Download size={16} />
													</a>
												) : null}
												</motion.div>
											)
										})}
									</div>
								</div>
							</>
						) : (
							<div className="text-center py-12 text-sacred-muted">
								Tidak ada arsip khutbah tersedia
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
