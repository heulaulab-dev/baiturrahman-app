'use client';

import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import DonasiPaymentMethodsTab from './_components/donasi-payment-methods-tab';
import DonasiDonationsTab, { type DonasiDonationsTabHandle } from './_components/donasi-donations-tab';

export default function DonasiPage() {
	const { hasPermission } = useAuth();
	const [tab, setTab] = useState('donasi');
	const [selectionResetKey, setSelectionResetKey] = useState(0);
	const [exporting, setExporting] = useState(false);
	const donationsRef = useRef<DonasiDonationsTabHandle>(null);

	if (!hasPermission('view_donation_reports')) {
		return (
			<div className="space-y-2 p-6">
				<h2 className="text-2xl font-semibold text-foreground">Akses ditolak</h2>
				<p className="text-sm text-muted-foreground">
					Anda tidak memiliki izin untuk mengakses modul donasi.
				</p>
			</div>
		);
	}

	const onTabChange = (value: string) => {
		setTab(value);
		if (value !== 'donasi') {
			setSelectionResetKey((k) => k + 1);
		}
	};

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold text-foreground">Manajemen Donasi</h2>
				<Button
					type="button"
					variant="outline"
					disabled={tab !== 'donasi' || exporting}
					onClick={async () => {
						setExporting(true);
						try {
							await donationsRef.current?.exportXlsx();
						} catch {
							// toast from tab / adminApiService
						} finally {
							setExporting(false);
						}
					}}
				>
					{exporting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
							Mengekspor…
						</>
					) : (
						'Export Excel'
					)}
				</Button>
			</div>

			<Tabs value={tab} onValueChange={onTabChange} className="w-full space-y-6">
				<TabsList>
					<TabsTrigger value="donasi">Donasi</TabsTrigger>
					<TabsTrigger value="payment">Metode pembayaran</TabsTrigger>
				</TabsList>

				<TabsContent value="donasi" className="mt-0">
					<DonasiDonationsTab ref={donationsRef} selectionResetKey={selectionResetKey} />
				</TabsContent>

				<TabsContent value="payment" className="mt-0">
					<DonasiPaymentMethodsTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
