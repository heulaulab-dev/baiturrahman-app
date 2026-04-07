'use client';

import Image from 'next/image';
import { resolveBackendAssetUrl } from '@/lib/utils';
import { useTentangKami } from '@/services/hooks';

export function TentangKamiSection() {
  const { data, isLoading } = useTentangKami();

  if (isLoading) {
    return (
      <section id="tentang-kami" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto container">
          <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (!data || !data.is_active) {
    return null;
  }

  return (
    <section id="tentang-kami" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif-cormorant font-semibold text-sacred-green mb-4">
            Tentang Kami
          </h2>
          <div className="w-16 h-1 bg-sacred-gold mx-auto mb-6" />
        </div>

        <div className="max-w-4xl mx-auto">
          {data.title && (
            <h3 className="text-2xl font-serif-cormorant text-sacred-green mb-6 text-center">
              {data.title}
            </h3>
          )}

          {resolveBackendAssetUrl(data.image_url) && (
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96">
              <Image
                src={resolveBackendAssetUrl(data.image_url)!}
                alt={data.title || 'Tentang Kami'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {data.body && (
            <div className="prose prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: data.body }} />
            </div>
          )}

          {data.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden my-8">
              <iframe
                src={data.video_url}
                className="w-full h-full"
                allowFullScreen
                title="Video"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
