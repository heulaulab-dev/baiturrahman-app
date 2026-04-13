'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

const navLinks = [
	{ name: 'Beranda', href: '#hero' },
	{ name: 'Jadwal Sholat', href: '#jadwal' },
	{ name: 'Layanan', href: '#layanan' },
	{ name: 'Kajian', href: '#kajian' },
	{ name: 'Berita', href: '#berita' },
	{ name: 'Galeri', href: '/galeri' },
	{ name: 'Mitra', href: '/mitra' },
	{ name: 'Tabungan Akhirat', href: '#donasi' },
];

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<>
			<nav
				className={`
					fixed top-0 left-0 right-0 z-50 transition-all duration-300
					${isScrolled ? 'bg-white/80 backdrop-blur-md border-b' : 'bg-transparent'}
				`}
			>
				<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
					<div className="flex items-center justify-between h-16 md:h-20">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-3">
							<Image
								src="/Logo.svg"
								alt="Baiturrahman"
								width={200}
								height={56}
								className="h-10 w-auto md:h-12"
								unoptimized
							/>
						</Link>

						{/* Desktop Nav */}
						<div className="hidden md:flex items-center gap-8">
							{navLinks.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									className="text-sm uppercase tracking-widest text-sacred-green relative group"
								>
									{link.name}
									<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
								</Link>
							))}
						</div>

						{/* Mobile Menu Button */}
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="md:hidden text-sacred-green"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							aria-label="Toggle menu"
						>
							{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</Button>
					</div>
				</div>
			</nav>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, x: '100%' }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: '100%' }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-40 md:hidden bg-white/95 backdrop-blur-lg"
					>
						<div className="flex flex-col items-center justify-center h-full gap-8">
							{navLinks.map((link, index) => (
								<motion.div
									key={link.name}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Link
										href={link.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className="font-serif-cormorant text-2xl text-sacred-green relative group block text-center"
									>
										{link.name}
										<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
									</Link>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
