'use client';

import Image from 'next/image';
import { useState } from 'react';
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
import { AdminImageUploadField } from '@/components/dashboard/AdminImageUploadField';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { resolveBackendAssetUrl } from '@/lib/utils';
import {
	useAdminHeroSlides,
	useCreateHeroSlide,
	useDeleteHeroSlide,
	useReorderHeroSlides,
	useToggleHeroSlidePublished,
	useUpdateHeroSlide,
} from '@/services/adminHooks';
import type { HeroSlide } from '@/types';

const MAX_SLIDES = 10;

interface FormState {
	image_url: string;
	alt_text: string;
	is_published: boolean;
}

function emptyForm(): FormState {
	return {
		image_url: '',
		alt_text: '',
		is_published: false,
	};
}

function itemToForm(item: HeroSlide): FormState {
	return {
		image_url: item.image_url ?? '',
		alt_text: item.alt_text ?? '',
		is_published: item.is_published,
	};
}

export function HeroBannerManagement() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<HeroSlide | null>(null);
	const [form, setForm] = useState<FormState>(emptyForm);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const { data: items = [], isLoading } = useAdminHeroSlides();
	const createMut = useCreateHeroSlide();
	const updateMut = useUpdateHeroSlide();
	const deleteMut = useDeleteHeroSlide();
	const reorderMut = useReorderHeroSlides();
	const toggleMut = useToggleHeroSlidePublished();

	const sorted = [...items].sort(
		(a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id),
	);

	const openCreate = () => {
		if (sorted.length >= MAX_SLIDES) {
			toast.error(`Maksimal ${MAX_SLIDES} slide`);
			return;
		}
		setEditing(null);
		setForm(emptyForm());
		setDialogOpen(true);
	};

	const openEdit = (item: HeroSlide) => {
		setEditing(item);
		setForm(itemToForm(item));
		setDialogOpen(true);
	};

	const persistOrder = async (next: HeroSlide[]) => {
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.image_url.trim()) {
			toast.error('Gambar wajib diisi');
			return;
		}
		try {
			if (editing) {
				await updateMut.mutateAsync({
					id: editing.id,
					data: {
						image_url: form.image_url.trim(),
						alt_text: form.alt_text.trim(),
						is_published: form.is_published,
					},
				});
				toast.success('Slide diperbarui');
			} else {
				await createMut.mutateAsync({
					image_url: form.image_url.trim(),
					alt_text: form.alt_text.trim() || undefined,
					is_published: form.is_published,
				});
				toast.success('Slide ditambahkan');
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
			toast.success('Slide dihapus');
			setDeleteId(null);
		} catch {
			toast.error('Gagal menghapus');
		}
	};

	const handleToggle = async (item: HeroSlide) => {
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
					Gambar latar hero beranda (karusel). Maksimal {MAX_SLIDES} slide. Hanya yang terbit
					tampil di publik.
				</p>
				<Button
					type="button"
					onClick={openCreate}
					disabled={sorted.length >= MAX_SLIDES}
				>
					<Plus className="mr-2 size-4" aria-hidden />
					Tambah slide
				</Button>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Memuat…</p>
			) : sorted.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Belum ada slide. Unggah gambar melalui tombol di atas.
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
										<p className="font-medium">
											{item.alt_text?.trim() || 'Slide tanpa teks alternatif'}
										</p>
										<StatusBadge
											status={item.is_published ? 'success' : 'default'}
										>
											{item.is_published ? 'Terbit' : 'Draf'}
										</StatusBadge>
									</div>
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
						<DialogTitle>{editing ? 'Edit slide hero' : 'Slide hero baru'}</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<AdminImageUploadField
							id="hero-image"
							label="Gambar"
							value={form.image_url}
							onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
							module="hero"
							description="Latar hero beranda (JPG/PNG/GIF/WebP, maks. 5MB)."
						/>
						<div className="space-y-2">
							<Label htmlFor="hero-alt">Teks alternatif (aksesibilitas)</Label>
							<Input
								id="hero-alt"
								placeholder="Contoh: Masjid saat maghrib"
								value={form.alt_text}
								onChange={(e) =>
									setForm((f) => ({ ...f, alt_text: e.target.value }))
								}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								id="hero-pub"
								checked={form.is_published}
								onCheckedChange={(v) =>
									setForm((f) => ({ ...f, is_published: v }))
								}
							/>
							<Label htmlFor="hero-pub">Tampilkan di situs publik</Label>
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
						<AlertDialogTitle>Hapus slide hero?</AlertDialogTitle>
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
