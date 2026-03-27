'use client'

import { MapPin, Phone, Mail, Globe, CircleFadingPlus } from 'lucide-react'
import { useMosqueInfo } from '@/services/hooks'

export function Footer() {
  const { data: mosqueInfo } = useMosqueInfo()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">M</span>
              </div>
              <span className="font-semibold text-xl">Masjid Baiturrahim</span>
            </div>
            <p className="text-muted-foreground">
              {mosqueInfo?.description || 'Pusat ibadah dan kegiatan keagamaan Muslim'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 dark:text-white">Hubungi Kami</h3>
            <div className="space-y-3">
              {mosqueInfo?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin size={20} className="text-primary shrink-0 mt-1" />
                  <span className="text-muted-foreground">{mosqueInfo.address}</span>
                </div>
              )}
              {mosqueInfo?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone size={20} className="text-primary" />
                  <span className="text-muted-foreground">{mosqueInfo.phone}</span>
                </div>
              )}
              {mosqueInfo?.email && (
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-primary" />
                  <span className="text-muted-foreground">{mosqueInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-lg mb-4 dark:text-white">Ikuti Kami</h3>
            <div className="flex space-x-4">
              {mosqueInfo?.facebook && (
                <a
                  href={mosqueInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary rounded-lg hover:bg-primary transition-colors"
                >
                  <CircleFadingPlus size={20} />
                </a>
              )}
              {mosqueInfo?.instagram && (
                <a
                  href={mosqueInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary rounded-lg hover:bg-primary transition-colors"
                >
                  <CircleFadingPlus size={20} />
                </a>
              )}
              {mosqueInfo?.youtube && (
                <a
                  href={mosqueInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary rounded-lg hover:bg-primary transition-colors"
                >
                  <CircleFadingPlus size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Masjid Baiturrahim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
