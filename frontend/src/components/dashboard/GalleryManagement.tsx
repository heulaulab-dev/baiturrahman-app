'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import {
	ArrowDown,
	ArrowUp,
	ImageIcon,
	Pencil,
	Plus,
	Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { resolveBackendAssetUrl } from '@/lib/utils';
import { uploadAdminImage } from '@/services/adminUploadService';
import {
	useAdminGalleryItems,
	useCreateGalleryItem,
	useDeleteGalleryItem,
	useReorderGalleryItems,
	useToggleGalleryItemPublished,
	useUpdateGalleryItem,
} from '@/services/adminHooks';
import type { GalleryItem } from '@/types';

interface FormState {
	title: string;
	summary: string;
	image_url: string;
	link_url: string;
	is_published: boolean;
}

function emptyForm(): FormState {
	return {
		title: '',
		summary: '',
		image_url: '',
		link_url: '',
		is_published: false,
	};
}

function itemToForm(item: GalleryItem): FormState {
	return {
		title: item.title,
		summary: item.summary ?? '',
		image_url: item.image_url ?? '',
		link_url: item.link_url ?? '',
		is_published: item.is_published,
	};
}

export function GalleryManagement() {
	const fileRef = useRef<HTMLInputElement>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<GalleryItem | null>(null);
	const [form, setForm] = useState<FormState>(emptyForm);
	const [uploading, setUploading] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const { data: items = [], isLoading } = useAdminGalleryItems();
	const createMut = useCreateGalleryItem();
	const updateMut = useUpdateGalleryItem();
	const deleteMut = useDeleteGalleryItem();
	const reorderMut = useReorderGalleryItems();
	const toggleMut = useToggleGalleryItemPublished();

	const sorted = [...items].sort(
		(a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title),
	);

	const openCreate = () => {
		setEditing(null);
		setForm(emptyForm());
		setDialogOpen(true);
	};

	const openEdit = (item: GalleryItem) => {
		setEditing(item);
		setForm(itemToForm(item));
		setDialogOpen(true);
	};

	const persistOrder = async (next: GalleryItem[]) => {
		const payload = next.map((it, i) => ({ id: it.id, sort_order: i }));
		await reorderMut.mutateAsync(payload);
	};

	const move = async (index: number, dir: -1 | 1) => {
		const j = index + dir;
		if (j < 0 || j >= sorted.length) return;
		const next = [...sorted];
		[next[index], next[j]] = [next[j], next[index]];
		try {
			await persistOrder(next);
			toast.success('Urutan diperbarui');
		} catch {
			toast.error('Gagal mengubah urutan');
		}
	};

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		setUploading(true);
		try {
			const url = await uploadAdminImage(file, 'gallery');
			setForm((f) => ({ ...f, image_url: url }));
			toast.success('Gambar diunggah');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Gagal mengunggah');
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.title.trim() || !form.image_url.trim()) {
			toast.error('Judul dan gambar wajib diisi');
			return;
		}
		try {
			if (editing) {
				await updateMut.mutateAsync({
					id: editing.id,
					data: {
						title: form.title.trim(),
						summary: form.summary.trim(),
						image_url: form.image_url.trim(),
						link_url: form.link_url.trim(),
						is_published: form.is_published,
					},
				});
				toast.success('Item galeri diperbarui');
			} else {
				await createMut.mutateAsync({
					title: form.title.trim(),
					summary: form.summary.trim(),
					image_url: form.image_url.trim(),
					link_url: form.link_url.trim() || undefined,
					is_published: form.is_published,
				});
				toast.success('Item galeri ditambahkan');
			}
			setDialogOpen(false);
		} catch {
			toast.error('Gagal menyimpan');
		}
	};

	const handleDelete = async () => {
		if (!deleteId) return;
		try {
			await deleteMut.mutateAsync(deleteId);
			toast.success('Item dihapus');
			setDeleteId(null);
		} catch {
			toast.error('Gagal menghapus');
		}
	};

	const handleToggle = async (item: GalleryItem) => {
		try {
			await toggleMut.mutateAsync(item.id);
			toast.success('Status publikasi diperbarui');
		} catch {
			toast.error('Gagal mengubah status');
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm text-muted-foreground">
					Hanya item berstatus terbit yang tampil di beranda dan halaman{' '}
					<span className="font-medium text-foreground">/galeri</span>.
				</p>
				<Button type="button" onClick={openCreate}>
					<Plus className="mr-2 size-4" aria-hidden />
					Tambah foto
				</Button>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Memuat…</p>
			) : sorted.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Belum ada item. Unggah foto melalui tombol di atas.
				</p>
			) : (
				<ul className="divide-y rounded-lg border">
					{sorted.map((item, index) => {
						const thumb = resolveBackendAssetUrl(item.image_url);
						return (
							<li
								key={item.id}
								className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
							>
								<div className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-muted">
									{thumb ? (
										<Image
											src={thumb}
											alt=""
											width={80}
											height={80}
											className="size-full object-cover"
										/>
									) : (
										<ImageIcon className="m-auto size-8 text-muted-foreground/50" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium">{item.title}</p>
										<StatusBadge
											status={item.is_published ? 'success' : 'default'}
										>
											{item.is_published ? 'Terbit' : 'Draf'}
										</StatusBadge>
									</div>
									{item.summary ? (
										<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
											{item.summary}
										</p>
									) : null}
									{item.link_url ? (
										<p className="mt-1 truncate text-xs text-muted-foreground">
											Link: {item.link_url}
										</p>
									) : null}
								</div>
								<div className="flex shrink-0 flex-wrap items-center gap-1">
									<Button
										type="button"
										variant="outline"
										size="icon"
										className="size-8"
										disabled={index === 0 || reorderMut.isPending}
										onClick={() => move(index, -1)}
										aria-label="Naikkan"
									>
										<ArrowUp className="size-4" />
									</Button>
									<Button
										type="button"
										variant="outline"
										size="icon"
										className="size-8"
										disabled={
											index === sorted.length - 1 || reorderMut.isPending
										}
										onClick={() => move(index, 1)}
										aria-label="Turunkan"
									>
										<ArrowDown className="size-4" />
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleToggle(item)}
										disabled={toggleMut.isPending}
									>
										{item.is_published ? 'Sembunyikan' : 'Terbitkan'}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="icon"
										className="size-8"
										onClick={() => openEdit(item)}
									>
										<Pencil className="size-4" />
									</Button>
									<Button
										type="button"
										variant="outline"
										size="icon"
										className="size-8 text-destructive hover:text-destructive"
										onClick={() => setDeleteId(item.id)}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{editing ? 'Edit item galeri' : 'Item galeri baru'}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="g-title">Judul</Label>
							<Input
								id="g-title"
								value={form.title}
								onChange={(e) =>
									setForm((f) => ({ ...f, title: e.target.value }))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="g-summary">Ringkasan (opsional)</Label>
							<Textarea
								id="g-summary"
								rows={3}
								value={form.summary}
								onChange={(e) =>
									setForm((f) => ({ ...f, summary: e.target.value }))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Gambar</Label>
							<input
								ref={fileRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleFile}
							/>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => fileRef.current?.click()}
									disabled={uploading}
								>
									{uploading ? 'Mengunggah…' : 'Pilih berkas'}
								</Button>
								{form.image_url ? (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-muted-foreground"
										onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
									>
										Hapus gambar
									</Button>
								) : null}
							</div>
							{resolveBackendAssetUrl(form.image_url) ? (
								<div className="relative mt-2 h-40 w-full max-w-sm overflow-hidden rounded-md border bg-muted">
									<Image
										src={resolveBackendAssetUrl(form.image_url)!}
										alt=""
										fill
										sizes="(max-width: 384px) 100vw, 384px"
										className="object-cover"
									/>
								</div>
							) : (
								<p className="text-xs text-muted-foreground">
									Wajib mengunggah gambar (JPG/PNG/WebP, maks. 5MB).
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="g-link">Tautan saat diklik (opsional)</Label>
							<Input
								id="g-link"
								placeholder="/ atau https://…"
								value={form.link_url}
								onChange={(e) =>
									setForm((f) => ({ ...f, link_url: e.target.value }))
								}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								id="g-pub"
								checked={form.is_published}
								onCheckedChange={(v) =>
									setForm((f) => ({ ...f, is_published: v }))
								}
							/>
							<Label htmlFor="g-pub">Tampilkan di situs publik</Label>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
								Batal
							</Button>
							<Button
								type="submit"
								disabled={createMut.isPending || updateMut.isPending}
							>
								Simpan
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus item galeri?</AlertDialogTitle>
						<AlertDialogDescription>
							Tindakan ini tidak dapat dibatalkan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
