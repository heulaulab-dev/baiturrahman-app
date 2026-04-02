'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DonasiPaymentMethodsTab from './_components/donasi-payment-methods-tab';
import DonasiDonationsTab from './_components/donasi-donations-tab';

export default function DonasiPage() {
	const [tab, setTab] = useState('donasi');
	const [selectionResetKey, setSelectionResetKey] = useState(0);

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
					variant="outline"
					title="Segera hadir"
					onClick={() => console.log('Export CSV — segera hadir')}
				>
					Export CSV
				</Button>
			</div>

			<Tabs value={tab} onValueChange={onTabChange} className="w-full space-y-6">
				<TabsList>
					<TabsTrigger value="donasi">Donasi</TabsTrigger>
					<TabsTrigger value="payment">Metode pembayaran</TabsTrigger>
				</TabsList>

				<TabsContent value="donasi" className="mt-0">
					<DonasiDonationsTab selectionResetKey={selectionResetKey} />
				</TabsContent>

				<TabsContent value="payment" className="mt-0">
					<DonasiPaymentMethodsTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
