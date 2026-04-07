'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { resolveBackendAssetUrl } from '@/lib/utils';
import { uploadAdminPdf, type AdminUploadModule } from '@/services/adminUploadService';

export type { AdminUploadModule } from '@/services/adminUploadService';

export interface AdminPdfUploadFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (url: string) => void;
	module?: AdminUploadModule;
	disabled?: boolean;
	description?: string;
}

export function AdminPdfUploadField({
	id,
	label,
	value,
	onChange,
	module = 'khutbah',
	disabled,
	description = 'Unggah PDF (maks. 15MB).',
}: AdminPdfUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	const href = resolveBackendAssetUrl(value);

	const pick = async (file: File) => {
		setUploading(true);
		try {
			const url = await uploadAdminPdf(file, module);
			onChange(url);
			toast.success('PDF berhasil diunggah');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Gagal mengunggah PDF');
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
				accept="application/pdf,.pdf"
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
							<FileText className="mr-2 h-4 w-4" />
							Pilih PDF
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
						Hapus lampiran
					</Button>
				) : null}
				{href ? (
					<Button type="button" variant="link" size="sm" className="h-auto p-0" asChild>
						<a href={href} target="_blank" rel="noopener noreferrer">
							Buka PDF
						</a>
					</Button>
				) : null}
			</div>
			{!href ? <p className="text-xs text-muted-foreground">{description}</p> : null}
		</div>
	);
}
