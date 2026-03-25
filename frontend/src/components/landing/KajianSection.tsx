'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, User } from 'lucide-react';
import { useEvents } from '@/services/hooks';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const categories = ['Tafsir', 'Fiqh', 'Tasawuf', 'Khutbah', 'Keislaman'];

export function KajianSection() {
	const { data: events, isLoading } = useEvents();

	// Get featured event (first published event) and remaining events
	const featuredEvent = events?.find((e) => e.is_published);
	const otherEvents = events?.filter((e) => e.is_published && e.id !== featuredEvent?.id) || [];

	return (
		<section id="kajian" className="py-20 bg-white">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12 flex items-end justify-between"
				>
					<div>
						<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-sacred-green mb-4">
							Kajian & Konten Islam
						</h2>
						<div className="flex flex-wrap gap-2">
							{categories.map((category) => (
								<span
									key={category}
									className="px-3 py-1 border border-sacred-green text-xs uppercase tracking-wider text-sacred-green"
								>
									{category}
								</span>
							))}
						</div>
					</div>
				</motion.div>

				{/* Featured Kajian */}
				{isLoading ? (
					<div className="mb-12 bg-white p-8 border border-sacred-green">
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<div className="aspect-[4/3] bg-gray-100 animate-pulse" />
							<div className="space-y-4">
								<div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
								<div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
								<div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
								<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
							</div>
						</div>
					</div>
				) : featuredEvent ? (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-12 bg-white p-8 border border-sacred-green cursor-pointer group hover:border-sacred-gold transition-colors duration-300"
					>
						<div className="grid md:grid-cols-2 gap-8 items-center">
							{featuredEvent.image_url ? (
								<img
									src={featuredEvent.image_url}
									alt={featuredEvent.title}
									className="aspect-[4/3] w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
								/>
							) : (
								<div className="aspect-[4/3] bg-gradient-to-br from-[#1a3d2b]/10 to-[#b8962e]/10 flex items-center justify-center">
									<Calendar size={48} className="text-sacred-green/20" />
								</div>
							)}
							<div>
								<div className="mb-3">
									<span className="px-3 py-1 bg-sacred-gold/10 text-sacred-gold text-xs uppercase tracking-wider">
										Kajian
									</span>
								</div>
								<h3 className="font-serif-cormorant font-semibold text-2xl text-sacred-green mb-3 group-hover:text-sacred-gold transition-colors">
									{featuredEvent.title}
								</h3>
								<p className="text-sacred-muted mb-4 leading-relaxed line-clamp-2">
									{featuredEvent.description}
								</p>
								<div className="space-y-2 text-sm text-sacred-muted">
									{featuredEvent.date && (
										<div className="flex items-center gap-2">
											<Calendar size={14} />
											<span>
												{format(new Date(featuredEvent.date), 'EEEE, d MMMM yyyy', { locale: id })}
											</span>
										</div>
									)}
									{featuredEvent.time && (
										<div className="font-mono-jetbrains">{featuredEvent.time}</div>
									)}
									{featuredEvent.location && (
										<div className="flex items-center gap-2">
											<MapPin size={14} />
											<span className="line-clamp-1">{featuredEvent.location}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</motion.div>
				) : (
					<div className="mb-12 bg-white p-8 border border-sacred-green text-center text-sacred-muted">
						Belum ada kajian yang terjadwal
					</div>
				)}

				{/* Kajian List */}
				{isLoading ? (
					<div className="grid md:grid-cols-3 gap-6 mb-8">
						{[1, 2, 3].map((i) => (
							<div key={i} className="bg-white p-6 border border-sacred-green">
								<div className="aspect-[1/1.2] bg-gray-100 mb-4 animate-pulse" />
								<div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
								<div className="h-6 bg-gray-200 rounded w-full mb-2 animate-pulse" />
								<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
							</div>
						))}
					</div>
				) : otherEvents.length > 0 ? (
					<div className="grid md:grid-cols-3 gap-6 mb-8">
						{otherEvents.slice(0, 3).map((event, index) => (
							<motion.div
								key={event.id}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="bg-white p-6 border border-sacred-green hover:border-sacred-gold transition-colors duration-300 group cursor-pointer"
							>
								{event.image_url ? (
									<img
										src={event.image_url}
										alt={event.title}
										className="aspect-[1/1.2] w-full object-cover mb-4 group-hover:scale-[1.02] transition-transform duration-500"
									/>
								) : (
									<div className="aspect-[1/1.2] bg-gradient-to-br from-sacred-green/5 to-sacred-gold/5 mb-4 flex items-center justify-center">
										<Calendar size={32} className="text-sacred-green/20 group-hover:text-sacred-gold/30 transition-colors" />
									</div>
								)}
								{event.date && (
									<span className="font-mono-jetbrains text-xs uppercase tracking-wider text-sacred-gold mb-2 block">
										{format(new Date(event.date), 'd MMM yyyy', { locale: id })}
									</span>
								)}
								<h4 className="font-serif-cormorant font-semibold text-lg text-sacred-green mb-2 group-hover:text-sacred-gold transition-colors">
									{event.title}
								</h4>
								<p className="text-sacred-muted text-sm mb-3 line-clamp-2">
									{event.description}
								</p>
								{event.time && (
									<span className="font-mono-jetbrains text-xs text-sacred-muted">
										{event.time}
									</span>
								)}
							</motion.div>
						))}
					</div>
				) : !isLoading ? (
					<div className="text-center py-12 text-sacred-muted">
						Tidak ada kajian lain yang tersedia saat ini
					</div>
				) : null}

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<button
						type="button"
						className="inline-flex items-center gap-2 text-sacred-green font-serif-cormorant relative group"
						onClick={() => console.log('Navigate to all events')}
					>
						Lihat Semua Artikel
						<ArrowRight size={16} />
						<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
					</button>
				</motion.div>
			</div>
		</section>
	);
}
