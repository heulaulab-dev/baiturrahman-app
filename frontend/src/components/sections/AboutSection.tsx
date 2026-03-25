'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useMosqueInfo, useContentSections } from '@/services/hooks';
import Image from 'next/image';

export function AboutSection() {
	const { data: mosqueInfo } = useMosqueInfo();
	const { data: contentSections } = useContentSections();

	const sections = Array.isArray(contentSections) ? contentSections : [];
	const aboutContent = sections.find((c) => c.section_type === 'about');

	return (
		<section id='about' className='py-20'>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 container'>
				<div className='items-center gap-12 grid grid-cols-1 lg:grid-cols-2'>
					{/* Image */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<div className='relative shadow-2xl rounded-2xl h-[400px] lg:h-[500px] overflow-hidden'>
							<div className='absolute inset-0 bg-gradient-to-br from-sacred-green via-sacred-gold to-sacred-green' />
							<div className='absolute inset-0 flex justify-center items-center'>
								<div className='p-8 text-center'>
									<div className='flex justify-center items-center bg-white/20 backdrop-blur-sm mx-auto mb-6 rounded-full w-24 h-24'>
										<span className='font-bold text-sacred-green text-6xl'>M</span>
									</div>
									<h3 className='mb-2 font-bold text-sacred-green text-3xl'>
										Masjid Baiturrahim
									</h3>
									<p className='opacity-90 text-sacred-green text-lg'>
										Pusat Ibadah & Ukhuwah
									</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Content */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className='mb-6 font-bold text-sacred-green text-4xl'>
							Tentang Masjid Kami
						</h2>
						<div className='space-y-6 text-sacred-green'>
							{aboutContent ? (
								<p className='text-sacred-green text-lg leading-relaxed'>
									{aboutContent.content}
								</p>
							) : (
								<>
									<p className='text-lg leading-relaxed'>
										Masjid Baiturrahim hadir sebagai pusat ibadah dan pembinaan
										umat yang berkomitmen untuk membangun generasi Muslim yang
										berakhlak mulia, berilmu, dan bermanfaat bagi masyarakat.
									</p>
									<p className='text-lg leading-relaxed'>
										Dengan fasilitas yang lengkap dan lingkungan yang nyaman,
										kami menyediakan berbagai layanan dan kegiatan untuk
										mendukung kebutuhan ibadah dan pengembangan diri jama'ah.
									</p>
								</>
							)}
						</div>

						{/* Features */}
						<div className='gap-4 grid grid-cols-2 mt-8'>
							<Card className='border border-sacred-green'>
								<CardContent className='p-4'>
									<h4 className='mb-2 font-semibold text-sacred-green'>
										Fasilitas Lengkap
									</h4>
									<p className='text-sm'>Tempat wudhu, parkir luas, ruang AC</p>
								</CardContent>
							</Card>
							<Card className='border border-sacred-green'>
								<CardContent className='p-4'>
									<h4 className='mb-2 font-semibold text-sacred-green'>
										Kajian Rutin
									</h4>
									<p className='text-sm'>Ilmu agama setiap pekannya</p>
								</CardContent>
							</Card>
							<Card className='border border-sacred-green'>
								<CardContent className='p-4'>
									<h4 className='mb-2 font-semibold text-sacred-green'>
										Program Sosial
									</h4>
									<p className='text-sm'>Zakat, infaq, dan sedekah</p>
								</CardContent>
							</Card>
							<Card className='border border-sacred-green'>
								<CardContent className='p-4'>
									<h4 className='mb-2 font-semibold text-sacred-green'>
										Anak & Remaja
									</h4>
									<p className='text-sm'>TPA, remaja masjid</p>
								</CardContent>
							</Card>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
