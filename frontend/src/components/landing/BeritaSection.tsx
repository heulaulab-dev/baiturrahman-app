'use client';

import { motion } from 'framer-motion';

const featuredBerita = {
	title: 'Pembukaan Program Ramadhan 1446 H: Berbagi Berkah Bersama Umat',
	category: 'Kegiatan',
	date: '12 Maret 2026',
	excerpt: 'Masjid Baiturrahman membuka serangkaian kegiatan Ramadhan dengan buka puasa bersama dan pembagian takjil gratis untuk 500 jamaah.',
	image: null, // Placeholder for actual image
};

const beritaList = [
	{
		title: 'Wisuda Tahfidz Angkatan ke-15',
		category: 'Pendidikan',
		date: '10 Maret 2026',
		excerpt: '25 santri berhasil menyelesaikan hafalan 30 juz Al-Quran.',
	},
	{
		title: 'Khitanan Massal Gratis',
		category: 'Kegiatan',
		date: '8 Maret 2026',
		excerpt: 'Terlaksana khitanan massal untuk 50 anak yatim dan duafa.',
	},
];

export function BeritaSection() {
	return (
		<section className="py-20 bg-[#fafafa]">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12"
				>
					<h2 className="font-serif-cormorant font-semibold text-[clamp(2rem,4vw,3rem)] text-[#1a3d2b] mb-4">
						Berita & Kegiatan
					</h2>
				</motion.div>

				{/* Featured Story */}
				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					className="mb-8 relative aspect-[16/9] md:aspect-[21/9] overflow-hidden group"
				>
					{/* Placeholder background */}
					<div className="absolute inset-0 bg-gradient-to-br from-[#1a3d2b] to-[#b8962e] group-hover:scale-[1.02] transition-transform duration-500" />

					{/* Content Overlay */}
					<div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
						<div className="flex items-center gap-3 mb-3">
							<span className="px-3 py-1 bg-[#b8962e] text-white text-xs uppercase tracking-wider">
								{featuredBerita.category}
							</span>
							<span className="font-mono-jetbrains text-xs text-white/80">
								{featuredBerita.date}
							</span>
						</div>
						<h3 className="font-serif-cormorant font-semibold text-xl md:text-3xl text-white mb-2 max-w-3xl">
							{featuredBerita.title}
						</h3>
						<p className="text-white/90 text-sm md:text-base max-w-2xl line-clamp-2">
							{featuredBerita.excerpt}
						</p>
					</div>
				</motion.div>

				{/* Supporting Stories */}
				<div className="grid md:grid-cols-2 gap-6">
					{beritaList.map((berita, index) => (
						<motion.div
							key={berita.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="bg-white border border-[#f0f0f0] overflow-hidden group cursor-pointer"
						>
							{/* Image placeholder */}
							<div className="aspect-[4/3] bg-gradient-to-br from-[#1a3d2b]/10 to-[#b8962e]/10 group-hover:scale-[1.02] transition-transform duration-500" />

							<div className="p-6">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-xs uppercase tracking-wider text-[#b8962e]">
										{berita.category}
									</span>
									<span className="font-mono-jetbrains text-xs text-[#6b6b6b]">
										{berita.date}
									</span>
								</div>
								<h4 className="font-serif-cormorant font-semibold text-lg text-[#1a3d2b] mb-2 group-hover:text-[#b8962e] transition-colors">
									{berita.title}
								</h4>
								<p className="text-[#6b6b6b] text-sm line-clamp-2">
									{berita.excerpt}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
