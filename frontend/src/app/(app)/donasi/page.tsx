import { Button } from '@/components/ui/button';
import DonasiPaymentMethodsTab from './_components/donasi-payment-methods-tab';
import DonasiDonationsTab from './_components/donasi-donations-tab';

export default function DonasiPage() {
	return (
		<div className="space-y-6 p-6">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-3xl font-semibold text-foreground">Manajemen Donasi</h2>
				<Button variant="secondary">Export CSV</Button>
			</div>

			<DonasiPaymentMethodsTab />

			<DonasiDonationsTab selectionResetKey={0} />
		</div>
	);
}
