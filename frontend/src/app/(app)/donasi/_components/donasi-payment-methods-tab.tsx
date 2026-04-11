'use client';

import { useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	useAdminPaymentMethods,
	useCreatePaymentMethod,
	useUpdatePaymentMethod,
	useDeletePaymentMethod,
} from '@/services/adminHooks';
import { uploadAdminImage } from '@/services/adminUploadService';
import { resolveBackendAssetUrl } from '@/lib/utils';
import type { PaymentMethodType } from '@/types';

const QR_ACCEPT = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';

const allowedImageMime = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function validateQrFile(file: File): boolean {
	if (!allowedImageMime.has(file.type)) {
		toast.error('Gunakan gambar JPG, PNG, GIF, atau WebP.');
		return false;
	}
	return true;
}

export default function DonasiPaymentMethodsTab() {
	const newQrInputRef = useRef<HTMLInputElement>(null);
	const editQrInputRef = useRef<HTMLInputElement>(null);

	const [newMethodName, setNewMethodName] = useState('');
	const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('bank_transfer');
	const [newMethodAccountNumber, setNewMethodAccountNumber] = useState('');
	const [newMethodAccountName, setNewMethodAccountName] = useState('');
	const [newMethodQrStorageUrl, setNewMethodQrStorageUrl] = useState('');
	const [newQrUploading, setNewQrUploading] = useState(false);

	const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
	const [editMethodName, setEditMethodName] = useState('');
	const [editMethodType, setEditMethodType] = useState<PaymentMethodType>('bank_transfer');
	const [editMethodAccountNumber, setEditMethodAccountNumber] = useState('');
	const [editMethodAccountName, setEditMethodAccountName] = useState('');
	const [editMethodQrStorageUrl, setEditMethodQrStorageUrl] = useState('');
	const [editQrUploading, setEditQrUploading] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

	const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useAdminPaymentMethods();
	const createPaymentMethod = useCreatePaymentMethod();
	const updatePaymentMethod = useUpdatePaymentMethod();
	const deletePaymentMethod = useDeletePaymentMethod();

	const uploadNewQr = async (file: File) => {
		if (!validateQrFile(file)) return;
		setNewQrUploading(true);
		try {
			const url = await uploadAdminImage(file, 'donate');
			setNewMethodQrStorageUrl(url);
			toast.success('Gambar QR berhasil diunggah');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Gagal mengunggah gambar';
			toast.error(msg);
		} finally {
			setNewQrUploading(false);
			if (newQrInputRef.current) newQrInputRef.current.value = '';
		}
	};

	const uploadEditQr = async (file: File) => {
		if (!validateQrFile(file)) return;
		setEditQrUploading(true);
		try {
			const url = await uploadAdminImage(file, 'donate');
			setEditMethodQrStorageUrl(url);
			toast.success('Gambar QR berhasil diunggah');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Gagal mengunggah gambar';
			toast.error(msg);
		} finally {
			setEditQrUploading(false);
			if (editQrInputRef.current) editQrInputRef.current.value = '';
		}
	};

	const handleCreatePaymentMethod = async () => {
		if (!newMethodName.trim()) return;
		await createPaymentMethod.mutateAsync({
			name: newMethodName.trim(),
			type: newMethodType,
			account_number: newMethodType === 'qris' ? undefined : newMethodAccountNumber || undefined,
			account_name: newMethodType === 'qris' ? undefined : newMethodAccountName || undefined,
			qr_code_url: newMethodType === 'qris' ? newMethodQrStorageUrl || undefined : undefined,
			is_active: true,
			display_order: paymentMethods.length + 1,
		});
		setNewMethodName('');
		setNewMethodType('bank_transfer');
		setNewMethodAccountNumber('');
		setNewMethodAccountName('');
		setNewMethodQrStorageUrl('');
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
		setEditMethodQrStorageUrl(method.qr_code_url || '');
	};

	const handleCancelEditPaymentMethod = () => {
		setEditingMethodId(null);
		setEditMethodName('');
		setEditMethodType('bank_transfer');
		setEditMethodAccountNumber('');
		setEditMethodAccountName('');
		setEditMethodQrStorageUrl('');
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
				qr_code_url: editMethodType === 'qris' ? editMethodQrStorageUrl.trim() || null : null,
			},
		});
		handleCancelEditPaymentMethod();
	};

	const handleDeletePaymentMethod = async (id: string) => {
		await deletePaymentMethod.mutateAsync(id);
		if (editingMethodId === id) {
			handleCancelEditPaymentMethod();
		}
		setPendingDeleteId(null);
	};

	const renderQrUploadControls = (
		storageUrl: string,
		setUrl: (v: string) => void,
		uploading: boolean,
		inputRef: React.RefObject<HTMLInputElement | null>,
		onPick: (file: File) => void,
		idPrefix: string
	) => {
		const preview = resolveBackendAssetUrl(storageUrl);
		return (
			<div className="space-y-2">
				<Label htmlFor={`${idPrefix}-qr-file`}>Gambar kode QR</Label>
				<input
					ref={inputRef}
					id={`${idPrefix}-qr-file`}
					type="file"
					accept={QR_ACCEPT}
					className="sr-only"
					onChange={(e) => {
						const f = e.target.files?.[0];
						if (f) onPick(f);
					}}
				/>
				<div className="flex flex-wrap items-center gap-3">
					<Button
						type="button"
						variant="outline"
						disabled={uploading}
						onClick={() => inputRef.current?.click()}
					>
						{uploading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Mengunggah…
							</>
						) : (
							<>
								<ImagePlus className="mr-2 h-4 w-4" />
								Pilih gambar QR
							</>
						)}
					</Button>
					{storageUrl ? (
						<Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setUrl('')}>
							Hapus gambar
						</Button>
					) : null}
				</div>
				{preview ? (
					// eslint-disable-next-line @next/next/no-img-element -- admin preview for arbitrary upload URLs
					<img src={preview} alt="Pratinjau QR" className="h-36 w-36 rounded-md border border-border object-contain" />
				) : (
					<p className="text-xs text-muted-foreground">Belum ada gambar. Unggah JPG/PNG/GIF/WebP (maks. 5MB).</p>
				)}
			</div>
		);
	};

	let paymentMethodContent: ReactNode;
	if (paymentMethodsLoading) {
		paymentMethodContent = <p className="text-sm text-muted-foreground">Memuat metode pembayaran...</p>;
	} else if (paymentMethods.length === 0) {
		paymentMethodContent = <p className="text-sm text-muted-foreground">Belum ada metode pembayaran.</p>;
	} else {
		paymentMethodContent = paymentMethods.map((method) => {
			const isEditing = editingMethodId === method.id;
			const listQrPreview = method.type === 'qris' ? resolveBackendAssetUrl(method.qr_code_url) : undefined;
			return (
				<div key={method.id} className="space-y-3 rounded-md border border-border px-3 py-2">
					{isEditing ? (
						<div className="space-y-3">
							<div className="grid grid-cols-1 gap-2 md:grid-cols-3">
								<Input value={editMethodName} onChange={(e) => setEditMethodName(e.target.value)} className="md:col-span-2" />
								<Select
									value={editMethodType}
									onValueChange={(v) => {
										const t = v as PaymentMethodType;
										setEditMethodType(t);
										if (t === 'qris') {
											setEditMethodAccountNumber('');
											setEditMethodAccountName('');
										} else {
											setEditMethodQrStorageUrl('');
										}
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
										<SelectItem value="ewallet">E-Wallet</SelectItem>
										<SelectItem value="qris">QRIS</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{editMethodType === 'qris' ? (
								renderQrUploadControls(
									editMethodQrStorageUrl,
									setEditMethodQrStorageUrl,
									editQrUploading,
									editQrInputRef,
									uploadEditQr,
									`edit-${method.id}`
								)
							) : (
								<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
									<Input
										value={editMethodAccountNumber}
										onChange={(e) => setEditMethodAccountNumber(e.target.value)}
										placeholder="No. rekening / akun"
									/>
									<Input
										value={editMethodAccountName}
										onChange={(e) => setEditMethodAccountName(e.target.value)}
										placeholder="Nama pemilik"
									/>
								</div>
							)}
						</div>
					) : (
						<div className="flex flex-wrap items-start gap-3">
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-foreground">{method.name}</p>
								<p className="text-xs text-muted-foreground">
									{method.type}
									{method.account_number ? ` · ${method.account_number}` : ''}
								</p>
							</div>
							{listQrPreview ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={listQrPreview} alt="" className="h-14 w-14 shrink-0 rounded border border-border object-cover" />
							) : null}
						</div>
					)}
					<div className="flex flex-wrap items-center justify-end gap-2">
						<Button
							type="button"
							variant={method.is_active ? 'outline' : 'default'}
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
							onClick={() => setPendingDeleteId(method.id)}
							disabled={deletePaymentMethod.isPending || updatePaymentMethod.isPending}
							className="gap-1.5"
						>
							<Trash2 className="size-3.5 shrink-0" aria-hidden />
							Hapus
						</Button>
					</div>
				</div>
			);
		});
	}

	const canSubmitNew =
		Boolean(newMethodName.trim()) &&
		!(newMethodType === 'qris' && !newMethodQrStorageUrl) &&
		!createPaymentMethod.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Metode pembayaran landing</CardTitle>
				<CardDescription>Metode yang aktif ditampilkan di halaman donasi publik.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						<Input
							value={newMethodName}
							onChange={(e) => setNewMethodName(e.target.value)}
							placeholder="Nama metode"
							className="md:col-span-2"
						/>
						<Select
							value={newMethodType}
							onValueChange={(v) => {
								const t = v as PaymentMethodType;
								setNewMethodType(t);
								if (t === 'qris') {
									setNewMethodAccountNumber('');
									setNewMethodAccountName('');
								} else {
									setNewMethodQrStorageUrl('');
								}
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Tipe metode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
								<SelectItem value="ewallet">E-Wallet</SelectItem>
								<SelectItem value="qris">QRIS</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{newMethodType === 'qris' ? (
						renderQrUploadControls(
							newMethodQrStorageUrl,
							setNewMethodQrStorageUrl,
							newQrUploading,
							newQrInputRef,
							uploadNewQr,
							'new'
						)
					) : (
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
						</div>
					)}
				</div>
				<div className="flex justify-end">
					<Button type="button" onClick={handleCreatePaymentMethod} disabled={!canSubmitNew}>
						{createPaymentMethod.isPending ? 'Menyimpan...' : 'Tambah Metode'}
					</Button>
				</div>
				<div className="space-y-2">{paymentMethodContent}</div>
			</CardContent>
			<AlertDialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus metode pembayaran?</AlertDialogTitle>
						<AlertDialogDescription>
							Tindakan ini tidak dapat dibatalkan. Metode pembayaran akan dihapus permanen.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletePaymentMethod.isPending}>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => pendingDeleteId && handleDeletePaymentMethod(pendingDeleteId)}
							disabled={deletePaymentMethod.isPending}
						>
							{deletePaymentMethod.isPending ? 'Menghapus...' : 'Hapus'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
