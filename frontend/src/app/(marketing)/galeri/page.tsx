'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useGalleryItems } from '@/services/hooks';
import { resolveBackendAssetUrl } from '@/lib/utils';

function isNavigableLink(url: string): boolean {
	const u = url.trim();
	return u.length > 0 && u !== '#';
}

export default function GaleriPage() {
	const { data, isLoading, isError } = useGalleryItems();

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-24">
				<p className="text-center text-muted-foreground">Memuat galeri…</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container mx-auto px-4 py-24">
				<p className="text-center text-destructive">Gagal memuat galeri.</p>
			</div>
		);
	}

	const items = (data ?? [])
		.map((g) => ({
			...g,
			resolved: resolveBackendAssetUrl(g.image_url),
		}))
		.filter((g) => g.resolved);

	if (items.length === 0) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-24 text-center">
				<h1 className="font-serif text-3xl text-sacred-green md:text-4xl">Galeri</h1>
				<p className="mt-4 text-muted-foreground">
					Belum ada foto yang dipublikasikan. Admin dapat menambahkannya dari menu
					Konten → Galeri.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white">
			<div className="container mx-auto px-4 py-16 md:py-24">
				<h1 className="text-center font-serif text-3xl text-sacred-green md:text-4xl">
					Galeri
				</h1>
				<p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
					Kumpulan dokumentasi kegiatan dan suasana masjid.
				</p>
				<ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((g) => {
						const inner = (
							<>
								<div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
									<Image
										src={g.resolved!}
										alt={g.title}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									/>
								</div>
								<div className="p-4">
									<h2 className="font-medium text-sacred-green">{g.title}</h2>
									{g.summary ? (
										<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
											{g.summary}
										</p>
									) : null}
								</div>
							</>
						);
						const cardClass =
							'group block overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md';
						return (
							<li key={g.id}>
								{isNavigableLink(g.link_url) ? (
									<Link href={g.link_url.trim()} className={cardClass}>
										{inner}
									</Link>
								) : (
									<div className={cardClass}>{inner}</div>
								)}
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
