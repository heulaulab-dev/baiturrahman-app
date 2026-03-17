'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Building2 } from 'lucide-react';

const navLinks = [
	{ name: 'Beranda', href: '#' },
	{ name: 'Jadwal Sholat', href: '#jadwal' },
	{ name: 'Layanan', href: '#layanan' },
	{ name: 'Kajian', href: '#kajian' },
	{ name: 'Berita', href: '#berita' },
	{ name: 'Donasi', href: '#donasi' },
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
					${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-[#f0f0f0]' : 'bg-transparent'}
				`}
			>
				<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
					<div className="flex items-center justify-between h-16 md:h-20">
						{/* Logo */}
						<a href="#" className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 border-2 border-[#1a3d2b]">
								<Building2 size={20} className="text-[#1a3d2b]" />
							</div>
							<span className="font-serif-cormorant font-semibold text-xl text-[#1a3d2b]">
								Baiturrahman
							</span>
						</a>

						{/* Desktop Nav */}
						<div className="hidden md:flex items-center gap-8">
							{navLinks.map((link) => (
								<a
									key={link.name}
									href={link.href}
									className="text-sm uppercase tracking-widest text-[#1a3d2b] gold-underline"
								>
									{link.name}
								</a>
							))}
						</div>

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="md:hidden p-2 text-[#1a3d2b]"
							aria-label="Toggle menu"
						>
							{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
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
								<motion.a
									key={link.name}
									href={link.href}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									onClick={() => setIsMobileMenuOpen(false)}
									className="font-serif-cormorant text-2xl text-[#1a3d2b] gold-underline"
								>
									{link.name}
								</motion.a>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
