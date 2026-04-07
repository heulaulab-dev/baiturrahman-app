'use client';

import GalleryHoverCarousel from '@/components/ui/gallery-hover-carousel';
import { resolveBackendAssetUrl } from '@/lib/utils';
import { useGalleryItems } from '@/services/hooks';

export function GallerySection() {
	const { data, isLoading } = useGalleryItems();

	if (isLoading || !data?.length) {
		return null;
	}

	const items = data
		.map((g) => {
			const image = resolveBackendAssetUrl(g.image_url) ?? '';
			return {
				id: g.id,
				title: g.title,
				summary: g.summary ?? '',
				url: (g.link_url ?? '').trim() || '#',
				image,
			};
		})
		.filter((it) => it.image.length > 0);

	if (items.length === 0) {
		return null;
	}

	return (
		<GalleryHoverCarousel
			heading="Galeri"
			subheading="Dokumentasi kegiatan dan suasana masjid yang dipublikasikan untuk jamaah."
			viewAllHref="/galeri"
			items={items}
		/>
	);
}
