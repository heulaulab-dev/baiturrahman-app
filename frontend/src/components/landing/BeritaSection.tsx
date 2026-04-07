'use client';

import { motion } from 'framer-motion';
import { Calendar, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { useAnnouncements } from '@/services/hooks';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { resolveBackendAssetUrl } from '@/lib/utils';

export function BeritaSection() {
	const { data: announcements, isLoading } = useAnnouncements();

	const sorted = [...(announcements ?? [])].sort((a, b) => {
		if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
		const ta = a.published_at ? parseISO(a.published_at).getTime() : 0;
		const tb = b.published_at ? parseISO(b.published_at).getTime() : 0;
		return tb - ta;
	});
	const featuredAnnouncement = sorted[0];
	const otherAnnouncements = sorted.slice(1);

	return (
		<section id="berita" className="py-20 bg-white">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12"
				>
					<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-sacred-green mb-4">
						Berita & Kegiatan
					</h2>
				</motion.div>

				{/* Featured Story */}
				{isLoading ? (
					<div className="mb-8 relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
						<div className="absolute inset-0 bg-gray-100 animate-pulse" />
					</div>
				) : featuredAnnouncement ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						className="mb-8 relative aspect-[16/9] md:aspect-[21/9] overflow-hidden group cursor-pointer"
					>
						{resolveBackendAssetUrl(featuredAnnouncement.image_url ?? undefined) ? (
							<div className="absolute inset-0">
								<Image
									src={resolveBackendAssetUrl(featuredAnnouncement.image_url ?? undefined)!}
									alt=""
									fill
									className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
									sizes="(max-width: 768px) 100vw, 896px"
								/>
							</div>
						) : (
							<div className="absolute inset-0 bg-gradient-to-br from-sacred-green to-sacred-gold group-hover:scale-[1.02] transition-transform duration-500" />
						)}

						{/* Content Overlay */}
						<div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
							<div className="flex items-center gap-3 mb-3">
								<span className="px-3 py-1 bg-sacred-gold text-white text-xs uppercase tracking-wider">
									Pengumuman
								</span>
								{(featuredAnnouncement.published_at ?? featuredAnnouncement.created_at) && (
									<span className="font-mono-jetbrains text-xs text-white/80">
										{format(
											parseISO(featuredAnnouncement.published_at ?? featuredAnnouncement.created_at),
											'd MMMM yyyy',
											{ locale: id }
										)}
									</span>
								)}
							</div>
							<h3 className="font-serif-cormorant font-semibold text-xl md:text-3xl text-white mb-2 max-w-3xl">
								{featuredAnnouncement.title}
							</h3>
							<p className="text-white/90 text-sm md:text-base max-w-2xl line-clamp-2">
								{featuredAnnouncement.content}
							</p>
						</div>
					</motion.div>
				) : (
					<div className="mb-8 bg-white p-8 border border-sacred-green text-center text-sacred-muted">
						Belum ada berita yang tersedia
					</div>
				)}

				{/* Supporting Stories */}
				{isLoading ? (
					<div className="grid md:grid-cols-2 gap-6">
						{[1, 2].map((i) => (
							<div key={i} className="bg-white border border-sacred-green overflow-hidden">
								<div className="aspect-[4/3] bg-gray-100 animate-pulse" />
								<div className="p-6 space-y-2">
									<div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
									<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
									<div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
									<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
								</div>
							</div>
						))}
					</div>
				) : otherAnnouncements.length > 0 ? (
					<div className="grid md:grid-cols-2 gap-6">
						{otherAnnouncements.slice(0, 2).map((announcement, index) => (
							<motion.div
								key={announcement.id}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="bg-white border border-sacred-green overflow-hidden group cursor-pointer hover:border-sacred-gold transition-colors"
							>
								<div className="relative aspect-[4/3] bg-gradient-to-br from-sacred-green/10 to-sacred-gold/10 group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
									{resolveBackendAssetUrl(announcement.image_url ?? undefined) ? (
										<Image
											src={resolveBackendAssetUrl(announcement.image_url ?? undefined)!}
											alt=""
											fill
											className="object-cover"
											sizes="(max-width: 768px) 100vw, 400px"
										/>
									) : (
										<CalendarDays size={48} className="text-sacred-green/20 group-hover:text-sacred-gold/30 transition-colors" />
									)}
								</div>

								<div className="p-6">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-xs uppercase tracking-wider text-sacred-gold">
											Pengumuman
										</span>
										{(announcement.published_at ?? announcement.created_at) && (
											<span className="font-mono-jetbrains text-xs text-sacred-muted">
												{format(
													parseISO(announcement.published_at ?? announcement.created_at),
													'd MMM yyyy',
													{ locale: id }
												)}
											</span>
										)}
									</div>
									<h4 className="font-serif-cormorant font-semibold text-lg text-sacred-green mb-2 group-hover:text-sacred-gold transition-colors">
										{announcement.title}
									</h4>
									<p className="text-sacred-muted text-sm line-clamp-2">
										{announcement.content}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				) : !isLoading ? (
					<div className="text-center py-12 text-sacred-muted">
						Tidak ada berita lain yang tersedia saat ini
					</div>
				) : null}
			</div>
		</section>
	);
}
