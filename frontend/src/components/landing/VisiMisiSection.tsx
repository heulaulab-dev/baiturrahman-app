'use client';

import { Eye, Target } from 'lucide-react';
import { useMosqueInfo } from '@/services/hooks';

export function VisiMisiSection() {
  const { data: mosqueInfo, isLoading } = useMosqueInfo();

  if (isLoading) {
    return (
      <section id="visi-misi" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto container">
          <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (!mosqueInfo || (!mosqueInfo.vision && !mosqueInfo.mission)) {
    return null;
  }

  return (
    <section id="visi-misi" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif-cormorant font-semibold text-sacred-green mb-4">
            Visi & Misi
          </h2>
          <div className="w-16 h-1 bg-sacred-gold mx-auto" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision Card */}
            {mosqueInfo.vision && (
              <div className="bg-gradient-to-br from-sacred-green/5 to-sacred-green/10 p-8 rounded-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-sacred-gold rounded-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif-cormorant font-semibold text-white mb-2">
                      Visi
                    </h3>
                  </div>
                </div>

                <p className="text-sacred-text/90 prose prose-invert max-w-none leading-relaxed">
                  {mosqueInfo.vision}
                </p>
              </div>
            )}

            {/* Mission Card */}
            {mosqueInfo.mission && (
              <div className="bg-gradient-to-br from-sacred-gold/5 to-sacred-gold/10 p-8 rounded-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Target className="w-6 h-6 text-sacred-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif-cormorant font-semibold text-sacred-green mb-2">
                      Misi
                    </h3>
                  </div>
                </div>

                <p className="text-sacred-text/90 prose prose-invert max-w-none leading-relaxed">
                  {mosqueInfo.mission}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
