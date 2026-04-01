'use client';

import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReservasiPage() {
	return (
		<div className="space-y-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Reservasi Ruangan</CardTitle>
				</CardHeader>
				<CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
					<Info className="h-5 w-5 mt-0.5" />
					<div>
						<div className="text-foreground font-medium">Modul reservasi belum tersedia</div>
						<div>Belum ada endpoint API reservasi di backend, jadi UI ini sengaja dikosongkan agar tidak ada data hardcode.</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
