'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	useAdminPaymentMethods,
	useCreatePaymentMethod,
	useUpdatePaymentMethod,
	useDeletePaymentMethod,
} from '@/services/adminHooks';
import type { PaymentMethodType } from '@/types';

export default function DonasiPaymentMethodsTab() {
	const [newMethodName, setNewMethodName] = useState('');
	const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('bank_transfer');
	const [newMethodAccountNumber, setNewMethodAccountNumber] = useState('');
	const [newMethodAccountName, setNewMethodAccountName] = useState('');
	const [newMethodQrUrl, setNewMethodQrUrl] = useState('');
	const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
	const [editMethodName, setEditMethodName] = useState('');
	const [editMethodType, setEditMethodType] = useState<PaymentMethodType>('bank_transfer');
	const [editMethodAccountNumber, setEditMethodAccountNumber] = useState('');
	const [editMethodAccountName, setEditMethodAccountName] = useState('');
	const [editMethodQrUrl, setEditMethodQrUrl] = useState('');

	const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useAdminPaymentMethods();
	const createPaymentMethod = useCreatePaymentMethod();
	const updatePaymentMethod = useUpdatePaymentMethod();
	const deletePaymentMethod = useDeletePaymentMethod();

	const handleCreatePaymentMethod = async () => {
		if (!newMethodName.trim()) return;
		await createPaymentMethod.mutateAsync({
			name: newMethodName.trim(),
			type: newMethodType,
			account_number: newMethodType === 'qris' ? undefined : newMethodAccountNumber || undefined,
			account_name: newMethodType === 'qris' ? undefined : newMethodAccountName || undefined,
			qr_code_url: newMethodType === 'qris' ? newMethodQrUrl || undefined : undefined,
			is_active: true,
			display_order: paymentMethods.length + 1,
		});
		setNewMethodName('');
		setNewMethodType('bank_transfer');
		setNewMethodAccountNumber('');
		setNewMethodAccountName('');
		setNewMethodQrUrl('');
	};

	const handleTogglePaymentMethod = async (id: string, isActive: boolean) => {
		await updatePaymentMethod.mutateAsync({
			id,
			data: { is_active: !isActive },
		});
	};

	const handleStartEditPaymentMethod = (method: (typeof paymentMethods)[number]) => {
		setEditingMethodId(method.id);
		setEditMethodName(method.name);
		setEditMethodType(method.type);
		setEditMethodAccountNumber(method.account_number || '');
		setEditMethodAccountName(method.account_name || '');
		setEditMethodQrUrl(method.qr_code_url || '');
	};

	const handleCancelEditPaymentMethod = () => {
		setEditingMethodId(null);
		setEditMethodName('');
		setEditMethodType('bank_transfer');
		setEditMethodAccountNumber('');
		setEditMethodAccountName('');
		setEditMethodQrUrl('');
	};

	const handleSaveEditPaymentMethod = async (id: string) => {
		if (!editMethodName.trim()) return;
		await updatePaymentMethod.mutateAsync({
			id,
			data: {
				name: editMethodName.trim(),
				type: editMethodType,
				account_number: editMethodType === 'qris' ? undefined : editMethodAccountNumber || undefined,
				account_name: editMethodType === 'qris' ? undefined : editMethodAccountName || undefined,
				qr_code_url: editMethodType === 'qris' ? editMethodQrUrl || undefined : undefined,
			},
		});
		handleCancelEditPaymentMethod();
	};

	const handleDeletePaymentMethod = async (id: string) => {
		const confirmDelete = globalThis.confirm('Hapus metode pembayaran ini?');
		if (!confirmDelete) return;
		await deletePaymentMethod.mutateAsync(id);
		if (editingMethodId === id) {
			handleCancelEditPaymentMethod();
		}
	};

	let paymentMethodContent: ReactNode;
	if (paymentMethodsLoading) {
		paymentMethodContent = <p className="text-sm text-muted-foreground">Memuat metode pembayaran...</p>;
	} else if (paymentMethods.length === 0) {
		paymentMethodContent = <p className="text-sm text-muted-foreground">Belum ada metode pembayaran.</p>;
	} else {
		paymentMethodContent = paymentMethods.map((method) => {
			const isEditing = editingMethodId === method.id;
			return (
				<div key={method.id} className="space-y-3 rounded-md border border-border px-3 py-2">
					{isEditing ? (
						<div className="grid grid-cols-1 gap-2 md:grid-cols-5">
							<Input value={editMethodName} onChange={(e) => setEditMethodName(e.target.value)} className="md:col-span-2" />
							<Select value={editMethodType} onValueChange={(v) => setEditMethodType(v as PaymentMethodType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
									<SelectItem value="ewallet">E-Wallet</SelectItem>
									<SelectItem value="qris">QRIS</SelectItem>
								</SelectContent>
							</Select>
							{editMethodType === 'qris' ? (
								<Input value={editMethodQrUrl} onChange={(e) => setEditMethodQrUrl(e.target.value)} className="md:col-span-2" />
							) : (
								<>
									<Input value={editMethodAccountNumber} onChange={(e) => setEditMethodAccountNumber(e.target.value)} />
									<Input value={editMethodAccountName} onChange={(e) => setEditMethodAccountName(e.target.value)} />
								</>
							)}
						</div>
					) : (
						<div>
							<p className="text-sm font-medium text-foreground">{method.name}</p>
							<p className="text-xs text-muted-foreground">
								{method.type}
								{method.account_number ? ` · ${method.account_number}` : ''}
							</p>
						</div>
					)}
					<div className="flex flex-wrap items-center gap-2 justify-end">
						<Button
							type="button"
							variant={method.is_active ? 'secondary' : 'default'}
							size="sm"
							onClick={() => handleTogglePaymentMethod(method.id, method.is_active)}
							disabled={updatePaymentMethod.isPending || deletePaymentMethod.isPending}
						>
							{method.is_active ? 'Nonaktifkan' : 'Aktifkan'}
						</Button>
						{isEditing ? (
							<>
								<Button
									type="button"
									size="sm"
									onClick={() => handleSaveEditPaymentMethod(method.id)}
									disabled={updatePaymentMethod.isPending || !editMethodName.trim()}
								>
									Simpan
								</Button>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={handleCancelEditPaymentMethod}
									disabled={updatePaymentMethod.isPending}
								>
									Batal
								</Button>
							</>
						) : (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleStartEditPaymentMethod(method)}
								disabled={deletePaymentMethod.isPending}
							>
								Edit
							</Button>
						)}
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={() => handleDeletePaymentMethod(method.id)}
							disabled={deletePaymentMethod.isPending || updatePaymentMethod.isPending}
						>
							Hapus
						</Button>
					</div>
				</div>
			);
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Metode pembayaran landing</CardTitle>
				<CardDescription>Metode yang aktif ditampilkan di halaman donasi publik.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 gap-3 md:grid-cols-5">
					<Input
						value={newMethodName}
						onChange={(e) => setNewMethodName(e.target.value)}
						placeholder="Nama metode"
						className="md:col-span-2"
					/>
					<Select value={newMethodType} onValueChange={(v) => setNewMethodType(v as PaymentMethodType)}>
						<SelectTrigger>
							<SelectValue placeholder="Tipe metode" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
							<SelectItem value="ewallet">E-Wallet</SelectItem>
							<SelectItem value="qris">QRIS</SelectItem>
						</SelectContent>
					</Select>
					{newMethodType === 'qris' ? (
						<Input
							value={newMethodQrUrl}
							onChange={(e) => setNewMethodQrUrl(e.target.value)}
							placeholder="URL QR code"
							className="md:col-span-2"
						/>
					) : (
						<>
							<Input
								value={newMethodAccountNumber}
								onChange={(e) => setNewMethodAccountNumber(e.target.value)}
								placeholder="No. rekening / akun"
							/>
							<Input
								value={newMethodAccountName}
								onChange={(e) => setNewMethodAccountName(e.target.value)}
								placeholder="Nama pemilik"
							/>
						</>
					)}
				</div>
				<div className="flex justify-end">
					<Button
						type="button"
						onClick={handleCreatePaymentMethod}
						disabled={createPaymentMethod.isPending || !newMethodName.trim()}
					>
						{createPaymentMethod.isPending ? 'Menyimpan...' : 'Tambah Metode'}
					</Button>
				</div>
				<div className="space-y-2">{paymentMethodContent}</div>
			</CardContent>
		</Card>
	);
}
