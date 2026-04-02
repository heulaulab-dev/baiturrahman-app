'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useAnnouncements } from '@/services/hooks';

export function AnnouncementsSection() {
	const { data: announcements } = useAnnouncements();

	const announcementsArray = Array.isArray(announcements) ? announcements : [];
	const publishedAnnouncements = announcementsArray.slice(0, 3);

	return (
		<section id='announcements' className='bg-white dark:bg-gray-900 py-20'>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 container'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className='mb-12 text-center'
				>
					<div className='inline-flex justify-center items-center bg-primary/20 dark:bg-primary/30 mb-4 rounded-full w-16 h-16'>
						<Bell className='text-primary' size={32} />
					</div>
					<h2 className='mb-4 font-bold text-4xl dark:text-white'>Pengumuman Terbaru</h2>
					<p className='text-gray-600 dark:text-gray-400 text-lg'>
						Informasi penting dan update terkini dari masjid
					</p>
				</motion.div>

				<div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-6xl'>
					{publishedAnnouncements.map((announcement, index) => (
						<motion.div
							key={announcement.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
						>
							<Card className='hover:shadow-lg border-l-4 border-l-primary dark:bg-gray-800 transition-shadow'>
								<CardContent className='p-6'>
									<h3 className='mb-3 font-semibold text-lg line-clamp-2 dark:text-white'>
										{announcement.title}
									</h3>
									<p className='text-gray-600 dark:text-gray-400 text-sm line-clamp-3'>
										{announcement.content}
									</p>
									<div className='mt-4 text-gray-400 dark:text-gray-500 text-xs'>
										{new Date(
											announcement.published_at ?? announcement.created_at,
										).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										})}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
