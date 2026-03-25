'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const categories = ['Tafsir', 'Fiqh', 'Tasawuf', 'Khutbah', 'Keislaman'];

const featuredKajian = {
	title: 'Makna Kehidupan dalam Al-Quran',
	excerpt: 'Menjelajahi kedalaman makna kehidupan yang terkandung dalam ayat-ayat suci Al-Quran dan relevansinya dengan kehidupan modern.',
	category: 'Tafsir',
	date: '15 Maret 2026',
	author: 'Ustadz Dr. Abdullah Hakim, M.A.',
};

const kajianList = [
	{
		title: 'Fiqh Sholat Lengkap',
		excerpt: 'Panduan lengkap tata cara sholat sesuai sunnah.',
		category: 'Fiqh',
		date: '14 Maret 2026',
	},
	{
		title: 'Meraih Ketenangan Hati',
		excerpt: 'Jalan menuju ketenangan hati melalui dzikir dan doa.',
		category: 'Tasawuf',
		date: '13 Maret 2026',
	},
	{
		title: 'Khutbah Jumat Pilihan',
		excerpt: 'Kumpulan khutbah jumat yang menginspirasi.',
		category: 'Khutbah',
		date: '12 Maret 2026',
	},
];

export function KajianSection() {
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
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12 bg-white p-8 border border-sacred-green"
				>
					<div className="grid md:grid-cols-2 gap-8 items-center">
						<div className="aspect-[4/3] bg-gradient-to-br from-[#1a3d2b]/10 to-[#b8962e]/10 flex items-center justify-center">
							<svg
								viewBox="0 0 24 24"
								className="w-24 h-24 text-sacred-green/20"
								fill="none"
								stroke="currentColor"
								strokeWidth="1"
							>
								<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
								<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
							</svg>
						</div>
						<div>
							<div className="mb-3">
								<span className="px-3 py-1 bg-sacred-gold/10 text-sacred-gold text-xs uppercase tracking-wider">
									{featuredKajian.category}
								</span>
							</div>
							<h3 className="font-serif-cormorant font-semibold text-2xl text-sacred-green mb-3">
								{featuredKajian.title}
							</h3>
							<p className="text-sacred-muted mb-4 leading-relaxed">
								{featuredKajian.excerpt}
							</p>
							<div className="flex items-center justify-between text-sm text-sacred-muted">
								<span>{featuredKajian.author}</span>
								<span className="font-mono-jetbrains">{featuredKajian.date}</span>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Kajian List */}
				<div className="grid md:grid-cols-3 gap-6 mb-8">
					{kajianList.map((kajian, index) => (
						<motion.div
							key={kajian.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="bg-white p-6 border border-sacred-green hover:border-sacred-gold transition-colors duration-300 group"
						>
							<div className="aspect-[1/1.2] bg-gradient-to-br from-sacred-green/5 to-sacred-gold/5 mb-4 flex items-center justify-center">
								<svg
									viewBox="0 0 24 24"
									className="w-16 h-16 text-sacred-green/20 group-hover:text-sacred-gold/30 transition-colors"
									fill="none"
									stroke="currentColor"
									strokeWidth="1"
								>
									<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
									<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
								</svg>
							</div>
							<span className="text-xs uppercase tracking-wider text-sacred-gold mb-2 block">
								{kajian.category}
							</span>
							<h4 className="font-serif-cormorant font-semibold text-lg text-sacred-green mb-2">
								{kajian.title}
							</h4>
							<p className="text-sacred-muted text-sm mb-3 line-clamp-2">
								{kajian.excerpt}
							</p>
							<span className="font-mono-jetbrains text-xs text-sacred-muted">
								{kajian.date}
							</span>
						</motion.div>
					))}
				</div>

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<a
						href="#"
						className="inline-flex items-center gap-2 text-sacred-green font-serif-cormorant relative group"
					>
						Lihat Semua Artikel
						<ArrowRight size={16} />
						<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
					</a>
				</motion.div>
			</div>
		</section>
	);
}
