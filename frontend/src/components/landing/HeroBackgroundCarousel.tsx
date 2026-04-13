'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface HeroSlideImageInput {
	id: string;
	src: string;
	alt: string;
}

const AUTOPLAY_MS = 7000;

interface HeroBackgroundCarouselProps {
	slides: HeroSlideImageInput[];
}

export function HeroBackgroundCarousel({ slides }: HeroBackgroundCarouselProps) {
	const [reducedMotion, setReducedMotion] = useState(false);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: slides.length > 1,
		align: 'start',
	});
	const [selected, setSelected] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		setReducedMotion(mq.matches);
		const fn = () => setReducedMotion(mq.matches);
		mq.addEventListener('change', fn);
		return () => mq.removeEventListener('change', fn);
	}, []);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelected(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on('select', onSelect);
		emblaApi.on('reInit', onSelect);
		return () => {
			emblaApi.off('select', onSelect);
			emblaApi.off('reInit', onSelect);
		};
	}, [emblaApi, onSelect]);

	useEffect(() => {
		if (!emblaApi || slides.length <= 1 || reducedMotion) return;
		if (paused) return;
		const id = window.setInterval(() => {
			if (document.hidden) return;
			emblaApi.scrollNext();
		}, AUTOPLAY_MS);
		return () => window.clearInterval(id);
	}, [emblaApi, slides.length, reducedMotion, paused]);

	if (slides.length === 0) return null;

	return (
		<div
			className="absolute inset-0 z-0 min-h-screen"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<div className="h-full min-h-screen overflow-hidden" ref={emblaRef}>
				<div className="flex h-full min-h-screen">
					{slides.map((slide, i) => (
						<div
							key={slide.id}
							className="relative min-h-screen min-w-0 shrink-0 grow-0 basis-full"
						>
							<Image
								src={slide.src}
								alt={slide.alt}
								fill
								className="object-cover"
								sizes="100vw"
								priority={i === 0}
							/>
						</div>
					))}
				</div>
			</div>
			<div
				className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/60"
				aria-hidden
			/>
			{slides.length > 1 ? (
				<div className="pointer-events-auto absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-3 px-4">
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="secondary"
							size="icon"
							className="size-9 rounded-full bg-white/90 text-foreground shadow-md hover:bg-white"
							aria-label="Slide sebelumnya"
							onClick={() => emblaApi?.scrollPrev()}
						>
							<ChevronLeft className="size-5" aria-hidden />
						</Button>
						<div className="flex gap-1.5">
							{slides.map((s, index) => (
								<button
									key={s.id}
									type="button"
									aria-label={`Tampilkan slide ${index + 1}`}
									aria-current={index === selected ? 'true' : undefined}
									className={cn(
										'size-2 rounded-full transition-colors',
										index === selected ? 'bg-white' : 'bg-white/40 hover:bg-white/70',
									)}
									onClick={() => emblaApi?.scrollTo(index)}
								/>
							))}
						</div>
						<Button
							type="button"
							variant="secondary"
							size="icon"
							className="size-9 rounded-full bg-white/90 text-foreground shadow-md hover:bg-white"
							aria-label="Slide berikutnya"
							onClick={() => emblaApi?.scrollNext()}
						>
							<ChevronRight className="size-5" aria-hidden />
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
