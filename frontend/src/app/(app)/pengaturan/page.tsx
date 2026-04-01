'use client';

import { UserPlus, LayoutDashboard } from 'lucide-react';
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
import { useAdminUsers } from '@/services/adminHooks';

type TabType = 'profil-masjid' | 'pengguna-role';

export default function PengaturanPage() {
	const { data: usersResponse, isLoading: usersLoading } = useAdminUsers();
	const users = usersResponse?.data ?? [];
	let usersContent: React.ReactNode;

	if (usersLoading) {
		usersContent = (
			<TableRow>
				<TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
					Memuat pengguna...
				</TableCell>
			</TableRow>
		);
	} else if (users.length === 0) {
		usersContent = (
			<TableRow>
				<TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
					Belum ada data pengguna
				</TableCell>
			</TableRow>
		);
	} else {
		usersContent = users.map((user) => (
			<TableRow key={user.id}>
				<TableCell className="font-medium">{user.full_name}</TableCell>
				<TableCell className="text-muted-foreground">{user.email}</TableCell>
				<TableCell className="uppercase tracking-wide text-muted-foreground">{user.role}</TableCell>
				<TableCell className="text-muted-foreground">
					{user.last_login_at ? new Date(user.last_login_at).toLocaleString('id-ID') : '-'}
				</TableCell>
			</TableRow>
		));
	}

	const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
		{ key: 'profil-masjid', label: 'Profil Masjid', icon: LayoutDashboard },
		{ key: 'pengguna-role', label: 'Pengguna & Role', icon: UserPlus },
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
								<TableBody>{usersContent}</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

			</Tabs>
		</div>
	);
}
