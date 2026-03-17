'use client';

import { useState } from 'react';
import { Menu, X, Search, Bell, User, LogOut, ChevronDown, ChevronRight, Settings, HelpCircle, LayoutDashboard } from 'lucide-react';

const navGroups = [
	{
		title: 'Overview',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		title: 'Keuangan',
		items: [
			{ title: 'Donasi', href: '/dashboard/donasi', icon: null },
			{ title: 'Wakaf', href: '/dashboard/wakaf', icon: null },
			{ title: 'Zakat', href: '/dashboard/zakat', icon: null },
			{ title: 'Laporan', href: '/dashboard/laporan', icon: null },
		],
	},
	{
		title: 'Jamaah',
		items: [
			{ title: 'Daftar Anggota', href: '/dashboard/jamaah', icon: null },
			{ title: 'Muallaf', href: '/dashboard/muallaf', icon: null },
		],
	},
	{
		title: 'Jadwal',
		items: [
			{ title: 'Imam Rawatib', href: '/dashboard/imam-rawatib', icon: null },
			{ title: 'Muadzin', href: '/dashboard/muadzin', icon: null },
			{ title: 'Kajian Harian', href: '/dashboard/kajian-harian', icon: null },
			{ title: 'Petugas Jumat', href: '/dashboard/petugas-jumat', icon: null },
		],
	},
	{
		title: 'Konten',
		items: [
			{ title: 'Berita', href: '/dashboard/berita', icon: null },
			{ title: 'Artikel', href: '/dashboard/artikel', icon: null },
			{ title: 'Mimbar Jumat', href: '/dashboard/mimbar-jumat', icon: null },
			{ title: 'Galeri', href: '/dashboard/galeri', icon: null },
			{ title: 'Banner', href: '/dashboard/banner', icon: null },
		],
	},
	{
		title: 'Operasional',
		items: [
			{ title: 'Reservasi Ruangan', href: '/dashboard/reservasi', icon: null },
			{ title: 'Kunjungan', href: '/dashboard/kunjungan', icon: null },
			{ title: 'Fasilitas', href: '/dashboard/fasilitas', icon: null },
		],
	},
	{
		title: 'Pengaturan',
		items: [
			{ title: 'Profil Masjid', href: '/dashboard/profil-masjid', icon: null },
			{ title: 'Pengguna & Role', href: '/dashboard/pengguna', icon: null },
			{ title: 'Jadwal Sholat', href: '/dashboard/jadwal-sholat', icon: null },
			{ title: 'Notifikasi', href: '/dashboard/notifikasi', icon: null },
			{ title: 'API', href: '/dashboard/api', icon: null },
		],
	},
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<div className="flex h-screen bg-background text-foreground">
			{/* Sidebar */}
			<div
				className={`
					flex-shrink-0 transition-all duration-300
					${isCollapsed ? 'w-16' : 'w-60'}
					md:w-60
					h-full border-r border-border bg-muted/50
				`}
			>
				{/* Logo */}
				<div className="p-6 border-b border-border">
					<a href="/" className="flex items-center gap-3">
						<LayoutDashboard className="w-8 h-8 text-foreground" />
						{!isCollapsed && <span className="font-semibold text-lg">Baiturrahman</span>}
					</a>
				</div>

				{/* Navigation Groups */}
				<nav className="flex-1 overflow-y-auto">
					{navGroups.map((group, groupIndex) => (
						<div key={group.title || group.title} className="mb-6">
							{/* Group Header */}
							{!isCollapsed && (
								<div className="px-6 py-3 text-xs font-medium tracking-wider text-muted">
									{group.title}
								</div>
							)}

							{/* Group Items */}
							{group.items ? (
								group.items.map((item) => (
									<a
										key={item.title}
										href={item.href}
										className={`
											flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-200
											${isCollapsed ? 'justify-center' : ''}
											hover:bg-muted/30
										`}
									>
										{item.icon && <item.icon className="w-4 h-4 text-muted" />}
										{isCollapsed && item.icon === null && (
											<div className="w-2 h-2 rounded-full bg-foreground/10" />
										)}
										{!isCollapsed && <span className="text-sm">{item.title}</span>}
									</a>
								))
							) : (
								<a
									key={group.title}
									href={group.href}
									className={`
										flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-200
										${isCollapsed ? 'justify-center' : ''}
										hover:bg-muted/30
									`}
								>
									<group.icon className="w-4 h-4 text-muted" />
									{!isCollapsed && <span className="text-sm">{group.title}</span>}
									{isCollapsed && group.icon === null && (
										<div className="w-2 h-2 rounded-full bg-foreground/10" />
									)}
								</a>
							)}
						</div>
					))}
				</nav>

				{/* Collapse Toggle */}
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 rounded-md bg-muted/20 hover:bg-muted/30 md:hidden"
					aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					{isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
				</button>

				{/* Bottom Section */}
				<div className="absolute bottom-6 left-0 right-0 p-4 border-t border-border bg-muted/30">
					{!isCollapsed && (
						<>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted">
									<span className="text-xs">AD</span>
								</div>
								<div>
									<p className="text-sm font-medium">Ketua Pengurus</p>
									<p className="text-xs text-muted">H. Ahmad Fauzi</p>
								</div>
							</div>
							<button className="p-2 text-muted hover:text-foreground">
								<LogOut className="w-5 h-5" />
							</button>
						</>
					)}
					{isCollapsed && (
						<div className="flex justify-center">
							<LayoutDashboard className="w-8 h-8 text-muted" />
						</div>
					)}
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Topbar */}
				<header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
					<div className="flex items-center gap-4">
						<span className="text-xs font-medium tracking-wider text-muted">Dashboard</span>
						<button className="p-2 text-muted hover:text-foreground md:hidden">
							<Menu className="w-5 h-5" />
						</button>
					</div>

					<div className="flex items-center gap-4">
						{/* Search */}
						<div className="relative">
							<Search className="w-4 h-4 text-muted" />
							<span className="absolute right-10 text-xs text-muted tracking-wider">
								CMD+K
							</span>
						</div>

						{/* Role Badge */}
						<span className="px-2 py-1 text-xs font-medium tracking-widest bg-muted/20 text-muted rounded">
							Super Admin
						</span>

						{/* Notification */}
						<button className="p-2 text-muted hover:text-foreground relative">
							<Bell className="w-5 h-5" />
							<span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[10px] flex items-center justify-center text-background">
								3
							</span>
						</button>

						{/* Avatar */}
						<div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
							<span className="text-sm font-medium text-muted">HA</span>
						</div>

						{/* Settings */}
						<button className="p-2 text-muted hover:text-foreground">
							<Settings className="w-5 h-5" />
						</button>
					</div>
				</header>

				{/* Breadcrumb */}
				<div className="px-6 py-3 border-b border-border bg-muted/30">
					<span className="text-sm text-muted">Dashboard</span>
				</div>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto">
					{children}
				</main>
			</div>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-50 md:hidden bg-background/95 backdrop-blur-sm">
					<div className="p-4 h-full overflow-y-auto">
						<button
							onClick={() => setIsMobileMenuOpen(false)}
							className="absolute top-4 right-4 p-2 text-muted"
						>
							<X className="w-6 h-6" />
						</button>
						<nav className="mt-8 space-y-2">
							{navGroups.map((group) => (
								<div key={group.title || group.title}>
									<h3 className="px-4 py-2 text-sm font-medium tracking-widest text-muted">
										{group.title}
									</h3>
									{group.items ? (
										group.items.map((item) => (
											<a
												key={item.title}
												href={item.href}
												className="block px-4 py-3 text-foreground hover:bg-muted/30 rounded-md"
											>
												{item.title}
											</a>
										))
									) : (
										<a
											key={group.title}
											href={group.href}
											className="block px-4 py-3 text-foreground hover:bg-muted/30 rounded-md"
										>
											{group.title}
										</a>
									)}
								</div>
							))}
						</nav>
					</div>
				</div>
			</div>
		);
}
