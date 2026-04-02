'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useMosqueInfo } from '@/services/hooks';
import { useUpdateMosqueInfo, useDonationStats, useAdminUsers, useAdminEvents } from '@/services/adminHooks';

export function MosqueProfile() {
  const { data: mosqueInfo, isLoading } = useMosqueInfo();
  const updateMutation = useUpdateMosqueInfo();
  const { data: donationStats } = useDonationStats();
  const { data: usersResponse } = useAdminUsers();
  const { data: eventsResponse } = useAdminEvents(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    banner_url: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    maps_embed_url: '',
    social_media: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: '',
    },
    established_year: undefined as number | undefined,
    vision: '',
    mission: '',
  });

  const [previewMode, setPreviewMode] = useState(false);
  const hasHydratedFromServer = useRef(false);

  useEffect(() => {
    if (!mosqueInfo || hasHydratedFromServer.current) return;
    hasHydratedFromServer.current = true;
    setFormData({
      name: mosqueInfo.name || '',
      description: mosqueInfo.description || '',
      address: mosqueInfo.address || '',
      city: mosqueInfo.city || '',
      province: mosqueInfo.province || '',
      postal_code: mosqueInfo.postal_code || '',
      phone: mosqueInfo.phone || '',
      email: mosqueInfo.email || '',
      website: mosqueInfo.website || '',
      logo_url: mosqueInfo.logo_url || '',
      banner_url: mosqueInfo.banner_url || '',
      latitude: mosqueInfo.latitude,
      longitude: mosqueInfo.longitude,
      maps_embed_url: mosqueInfo.maps_embed_url || '',
      social_media: (mosqueInfo.social_media as any) || {
        facebook: '',
        instagram: '',
        youtube: '',
        twitter: '',
      },
      established_year: mosqueInfo.established_year,
      vision: mosqueInfo.vision || '',
      mission: mosqueInfo.mission || '',
    });
  }, [mosqueInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
      toast.success('Profil masjid berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui profil masjid');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Mosque Profile Form */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Informasi Masjid</h3>
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <Card>
            <CardContent className="p-6 space-y-6">
              {formData.banner_url && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start gap-4">
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="w-20 h-20 rounded-lg object-cover" />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{formData.name}</h1>
                  <p className="text-muted-foreground mt-1">{formData.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.vision && (
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2">Visi</h3>
                    <p className="text-sm">{formData.vision}</p>
                  </div>
                )}
                {formData.mission && (
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2">Misi</h3>
                    <p className="text-sm">{formData.mission}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Alamat:</strong> {formData.address}, {formData.city}, {formData.province}</p>
                <p><strong>Telepon:</strong> {formData.phone}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                {formData.website && <p><strong>Website:</strong> {formData.website}</p>}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Edit Mode */
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Informasi Dasar</h4>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Masjid *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Informasi Kontak</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Kota *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">Provinsi *</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Kode Pos</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="established_year">Tahun Berdiri</Label>
                      <Input
                        id="established_year"
                        type="number"
                        value={formData.established_year || ''}
                        onChange={(e) => setFormData({ ...formData, established_year: e.target.value ? Number.parseInt(e.target.value, 10) : undefined })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telepon *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Gambar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">URL Logo</Label>
                      <Input
                        id="logo_url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner_url">URL Banner</Label>
                      <Input
                        id="banner_url"
                        value={formData.banner_url}
                        onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Vision & Mission */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Visi & Misi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vision">Visi</Label>
                      <Textarea
                        id="vision"
                        value={formData.vision}
                        onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                        rows={4}
                        placeholder="Visi masjid..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mission">Misi</Label>
                      <Textarea
                        id="mission"
                        value={formData.mission}
                        onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                        rows={4}
                        placeholder="Misi masjid..."
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Media Sosial</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.social_media.facebook}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: { ...formData.social_media, facebook: e.target.value }
                        })}
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.social_media.instagram}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: { ...formData.social_media, instagram: e.target.value }
                        })}
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={formData.social_media.youtube}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: { ...formData.social_media, youtube: e.target.value }
                        })}
                        placeholder="https://youtube.com/channel/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter / X</Label>
                      <Input
                        id="twitter"
                        value={formData.social_media.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: { ...formData.social_media, twitter: e.target.value }
                        })}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Sistem</CardTitle>
          <CardDescription>Ringkasan data dari API dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border bg-background rounded-md">
            <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Donasi</div>
            <div className="text-2xl font-mono text-foreground mb-1">{(donationStats?.total_count ?? 0).toLocaleString('id-ID')}</div>
            <div className="text-sm text-muted-foreground">transaksi</div>
          </div>
          <div className="p-4 border border-border bg-background rounded-md">
            <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Pengguna Admin</div>
            <div className="text-2xl font-mono text-foreground mb-1">{(usersResponse?.total ?? 0).toLocaleString('id-ID')}</div>
            <div className="text-sm text-muted-foreground">akun</div>
          </div>
          <div className="p-4 border border-border bg-background rounded-md">
            <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Event</div>
            <div className="text-2xl font-mono text-foreground mb-1">{(eventsResponse?.total ?? 0).toLocaleString('id-ID')}</div>
            <div className="text-sm text-muted-foreground">total</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
