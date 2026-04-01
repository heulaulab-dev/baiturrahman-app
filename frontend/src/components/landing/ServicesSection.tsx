'use client';

import { motion } from 'framer-motion';
import { Book, Heart, Calendar } from 'lucide-react';
import { useState } from 'react';

const services = [
	{
		name: 'Kajian Harian',
		description: 'Pembelajaran rutin setiap hari dengan berbagai tema',
		icon: Book,
	},	
	{
		name: 'Zakat & Wakaf',
		description: 'Layanan penyaluran zakat dan wakaf terpercaya',
		icon: Heart,
	},
	{
		name: 'Reservasi Ruangan',
		description: 'Fasilitas ruangan untuk kegiatan dan acara',
		icon: Calendar,
	},
];

export function ServicesSection() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<section id="layanan" className="py-20 bg-white">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12"
				>
					<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-sacred-green mb-4">
						Layanan Masjid
					</h2>
					<p className="text-sacred-muted max-w-2xl">
						Kami menyediakan berbagai layanan untuk memenuhi kebutuhan ibadah dan kegiatan sosial jamaah.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{services.map((service, index) => {
						const Icon = service.icon;
						return (
							<motion.div
								key={service.name}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.2 }}
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
								className={`
									p-8 border transition-all duration-300 cursor-pointer
									${hoveredIndex === index
										? 'border-sacred-gold -translate-y-1'
										: 'border-sacred-green hover:border-sacred-gold'
									}
								`}
							>
								<div className="mb-4">
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
										className={`transition-opacity duration-300 ${hoveredIndex === index ? 'block' : 'hidden'}`}
									>
										<Icon size={24} className="text-sacred-gold cursor-pointer" />
									</motion.div>
								</div>

								<h3 className="font-serif-cormorant font-semibold text-xl text-sacred-green mb-2 cursor-pointer">
									{service.name}
								</h3>

								<p className="text-sacred-muted text-sm leading-relaxed cursor-pointer">
									{service.description}
								</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
