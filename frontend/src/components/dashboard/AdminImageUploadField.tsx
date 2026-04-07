'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { resolveBackendAssetUrl } from '@/lib/utils';
import { uploadAdminImage, type AdminUploadModule } from '@/services/adminUploadService';

export type { AdminUploadModule } from '@/services/adminUploadService';

const IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';

const allowedImageMime = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function validateImageFile(file: File): boolean {
	if (!allowedImageMime.has(file.type)) {
		toast.error('Gunakan gambar JPG, PNG, GIF, atau WebP.');
		return false;
	}
	return true;
}

export interface AdminImageUploadFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (url: string) => void;
	module: AdminUploadModule;
	disabled?: boolean;
	/** Shown when there is no preview */
	description?: string;
	previewClassName?: string;
}

export function AdminImageUploadField({
	id,
	label,
	value,
	onChange,
	module,
	disabled,
	description = 'Unggah JPG/PNG/GIF/WebP (maks. 5MB).',
	previewClassName = 'max-h-40 max-w-full rounded-md border border-border object-contain',
}: AdminImageUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	const preview = resolveBackendAssetUrl(value);

	const pick = async (file: File) => {
		if (!validateImageFile(file)) return;
		setUploading(true);
		try {
			const url = await uploadAdminImage(file, module);
			onChange(url);
			toast.success('Gambar diunggah');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Gagal mengunggah gambar');
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = '';
		}
	};

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<input
				ref={inputRef}
				id={id}
				type="file"
				accept={IMAGE_ACCEPT}
				className="sr-only"
				disabled={disabled || uploading}
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) void pick(f);
				}}
			/>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={disabled || uploading}
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
							Pilih berkas
						</>
					)}
				</Button>
				{value ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-muted-foreground"
						disabled={disabled || uploading}
						onClick={() => onChange('')}
					>
						Hapus gambar
					</Button>
				) : null}
			</div>
			{preview ? (
				// eslint-disable-next-line @next/next/no-img-element -- admin storage URL
				<img src={preview} alt="" className={previewClassName} />
			) : (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
		</div>
	);
}
