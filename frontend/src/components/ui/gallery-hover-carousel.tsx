"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface GalleryHoverCarouselItem {
	id: string;
	title: string;
	summary: string;
	/** Internal path or absolute URL; empty or `#` = card is not a link. */
	url: string;
	image: string;
}

function isNavigableUrl(url: string): boolean {
	const u = url.trim();
	return u.length > 0 && u !== "#";
}

export default function GalleryHoverCarousel({
	heading,
	subheading,
	viewAllHref,
	items,
}: Readonly<{
	heading: string;
	subheading: string;
	/** When set, shows "Lihat semua" next to the heading. */
	viewAllHref?: string;
	items: GalleryHoverCarouselItem[];
}>) {
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	useEffect(() => {
		if (!carouselApi) return;
		const update = () => {
			setCanScrollPrev(carouselApi.canScrollPrev());
			setCanScrollNext(carouselApi.canScrollNext());
		};
		update();
		carouselApi.on("select", update);
		carouselApi.on("reInit", update);
		return () => {
			carouselApi.off("select", update);
			carouselApi.off("reInit", update);
		};
	}, [carouselApi]);

	if (items.length === 0) {
		return null;
	}

	const showViewAll = Boolean(viewAllHref?.trim());

	return (
		<section className="bg-background py-32">
			<div className="container mx-auto px-6">
				<div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end lg:mb-16">
					<div className="max-w-2xl">
						<div className="flex flex-wrap items-end gap-4">
							<h3 className="text-lg leading-relaxed font-medium text-gray-900 sm:text-xl lg:text-3xl dark:text-white">
								{heading}
							</h3>
							{showViewAll ? (
								<Link
									href={viewAllHref!}
									className="text-primary text-sm font-medium hover:underline lg:text-base"
								>
									Lihat semua
								</Link>
							) : null}
						</div>
						<p className="mt-2 text-sm text-gray-500 sm:text-base lg:text-lg dark:text-gray-400">
							{subheading}
						</p>
					</div>
					<div className="mt-4 flex gap-2 md:mt-0">
						<Button
							variant="outline"
							size="icon"
							type="button"
							onClick={() => carouselApi?.scrollPrev()}
							disabled={!canScrollPrev}
							className="h-10 w-10 rounded-full"
						>
							<ChevronLeft className="h-4 w-4" />
							<span className="sr-only">Slide sebelumnya</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							type="button"
							onClick={() => carouselApi?.scrollNext()}
							disabled={!canScrollNext}
							className="h-10 w-10 rounded-full"
						>
							<ChevronRight className="h-4 w-4" />
							<span className="sr-only">Slide berikutnya</span>
						</Button>
					</div>
				</div>

				<div className="w-full max-w-full">
					<Carousel
						setApi={setCarouselApi}
						opts={{
							breakpoints: {
								"(max-width: 768px)": { dragFree: true },
							},
						}}
						className="relative w-full max-w-full"
					>
						<CarouselContent className="hide-scrollbar w-full max-w-full md:-mr-4 md:ml-4">
							{items.map((item) => {
								const cardClass =
									"group relative block h-[300px] w-full md:h-[350px]";
								const cardInner = (
									<Card className="h-full w-full overflow-hidden rounded-3xl">
										<div className="relative h-full w-full transition-all duration-500 group-hover:h-1/2">
											<Image
												width={400}
												height={300}
												src={item.image}
												alt={item.title}
												sizes="(max-width: 768px) 85vw, 350px"
												className="h-full w-full object-cover object-center"
											/>
											<div className="absolute bottom-0 left-0 h-20 w-full bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
										</div>

										<div className="bg-background/95 absolute bottom-0 left-0 flex w-full flex-col justify-center px-4 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:h-1/2 group-hover:opacity-100">
											<h3 className="text-lg font-medium md:text-xl">
												{item.title}
											</h3>
											<p className="text-muted-foreground line-clamp-2 text-sm md:text-base">
												{item.summary}
											</p>
											<span
												className={cn(
													"border-input bg-background text-primary hover:text-primary/80 absolute right-2 bottom-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-500 group-hover:-rotate-45",
												)}
												aria-hidden
											>
												<ArrowRight className="size-4" />
											</span>
										</div>
									</Card>
								);
								return (
									<CarouselItem
										key={item.id}
										className="ml-6 md:max-w-[350px]"
									>
										{isNavigableUrl(item.url) ? (
											<Link href={item.url} className={cardClass}>
												{cardInner}
											</Link>
										) : (
											<div className={cardClass}>{cardInner}</div>
										)}
									</CarouselItem>
								);
							})}
						</CarouselContent>
					</Carousel>
				</div>
			</div>
		</section>
	);
}
