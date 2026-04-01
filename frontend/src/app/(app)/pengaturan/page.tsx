'use client';

import { UserPlus, Bell, LayoutDashboard, Calendar, Key } from 'lucide-react';
import { MosqueProfile } from '@/components/dashboard/MosqueProfile';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

const usersData = [
	{ id: '1', nama: 'Ketua Pengurus', email: 'ketua@baiturrahman.or.id', role: 'super-admin', lastLogin: '2026-03-17 14:30', status: 'aktif' },
	{ id: '2', nama: 'Bendahara', email: 'bendahara@baiturrahman.or.id', role: 'admin', lastLogin: '2026-03-17 11:45', status: 'aktif' },
	{ id: '3', nama: 'Ust. Yusuf Al-Amin', email: 'ustadz@baiturrahman.or.id', role: 'admin', lastLogin: '2026-03-17 09:20', status: 'aktif' },
	{ id: '4', nama: 'Sekretaris', email: 'sekretaris@baiturrahman.or.id', role: 'content-editor', lastLogin: '2026-03-17 08:15', status: 'aktif' },
];

type TabType = 'profil-masjid' | 'pengguna-role' | 'jadwal-sholat' | 'notifikasi' | 'api';

export default function PengaturanPage() {
	const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
		{ key: 'profil-masjid', label: 'Profil Masjid', icon: LayoutDashboard },
		{ key: 'pengguna-role', label: 'Pengguna & Role', icon: UserPlus },
		{ key: 'jadwal-sholat', label: 'Jadwal Sholat', icon: Calendar },
		{ key: 'notifikasi', label: 'Notifikasi', icon: Bell },
		{ key: 'api', label: 'API', icon: Key },
	];

	return (
		<div className="space-y-6 p-6">
			<Tabs defaultValue="profil-masjid" className="space-y-6">
				<TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-lg bg-muted/30 p-2">
					{tabs.map((tab) => (
						<TabsTrigger key={tab.key} value={tab.key} className="gap-2 px-4 py-2">
							<tab.icon className="h-4 w-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="profil-masjid">
					<MosqueProfile />
				</TabsContent>

				<TabsContent value="pengguna-role">
					<Card>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-muted/30">
									<TableRow>
										<TableHead>Nama</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Login Terakhir</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{usersData.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="font-medium">{user.nama}</TableCell>
											<TableCell className="text-muted-foreground">{user.email}</TableCell>
											<TableCell className="uppercase tracking-wide text-muted-foreground">{user.role}</TableCell>
											<TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="jadwal-sholat">
					<Card className="py-20">
						<CardContent className="text-center text-sm text-muted-foreground">
							Halaman ini belum tersedia
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="notifikasi">
					<Card className="py-20">
						<CardContent className="text-center text-sm text-muted-foreground">
							Halaman ini belum tersedia
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="api">
					<Card className="py-20">
						<CardContent className="text-center text-sm text-muted-foreground">
							Halaman ini belum tersedia
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
