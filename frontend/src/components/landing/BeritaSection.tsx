'use client';

import { motion } from 'framer-motion';
import { Calendar, CalendarDays } from 'lucide-react';
import { useAnnouncements } from '@/services/hooks';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function BeritaSection() {
	const { data: announcements, isLoading } = useAnnouncements();

	// Get featured announcement (first published one) and remaining
	const featuredAnnouncement = announcements?.find((a) => a.is_published);
	const otherAnnouncements = announcements?.filter((a) => a.is_published && a.id !== featuredAnnouncement?.id) || [];

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
						{/* Background gradient overlay */}
						<div className="absolute inset-0 bg-gradient-to-br from-sacred-green to-sacred-gold group-hover:scale-[1.02] transition-transform duration-500" />

						{/* Content Overlay */}
						<div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
							<div className="flex items-center gap-3 mb-3">
								<span className="px-3 py-1 bg-sacred-gold text-white text-xs uppercase tracking-wider">
									Pengumuman
								</span>
								{featuredAnnouncement.created_at && (
									<span className="font-mono-jetbrains text-xs text-white/80">
										{format(new Date(featuredAnnouncement.created_at), 'd MMMM yyyy', { locale: id })}
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
								<div className="aspect-[4/3] bg-gradient-to-br from-sacred-green/10 to-sacred-gold/10 group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
									<CalendarDays size={48} className="text-sacred-green/20 group-hover:text-sacred-gold/30 transition-colors" />
								</div>

								<div className="p-6">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-xs uppercase tracking-wider text-sacred-gold">
											Pengumuman
										</span>
										{announcement.created_at && (
											<span className="font-mono-jetbrains text-xs text-sacred-muted">
												{format(new Date(announcement.created_at), 'd MMM yyyy', { locale: id })}
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
