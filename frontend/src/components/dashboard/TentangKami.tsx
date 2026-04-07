'use client';

import { useEffect, useRef, useState } from 'react';
import { Save, Eye, EyeOff, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AdminImageUploadField } from '@/components/dashboard/AdminImageUploadField';
import { resolveBackendAssetUrl } from '@/lib/utils';
import { useTentangKami, useUpdateTentangKami } from '@/services/adminHooks';

export function TentangKami() {
  const { data, isLoading } = useTentangKami();
  const updateMutation = useUpdateTentangKami();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    body: '',
    image_url: '',
    video_url: '',
    is_active: false,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const hasHydratedFromServer = useRef(false);

  useEffect(() => {
    if (!data || hasHydratedFromServer.current) return;
    hasHydratedFromServer.current = true;
    setFormData({
      title: data.title || 'Tentang Kami',
      subtitle: data.subtitle || '',
      body: data.body || '',
      image_url: data.image_url || '',
      video_url: data.video_url || '',
      is_active: data.is_active || false,
    });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
      toast.success('Tentang Kami berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui Tentang Kami');
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
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Tentang kami</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          {resolveBackendAssetUrl(formData.image_url) && (
            <div className="h-64 w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={resolveBackendAssetUrl(formData.image_url)!}
                alt="Tentang Kami"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="text-center">
            {formData.title && <h1 className="mb-2 text-4xl font-bold text-foreground">{formData.title}</h1>}
            {formData.subtitle && <p className="text-xl text-muted-foreground">{formData.subtitle}</p>}
          </div>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            {formData.body && <div dangerouslySetInnerHTML={{ __html: formData.body }} />}
          </div>
          {formData.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={formData.video_url}
                className="w-full h-full"
                allowFullScreen
                title="Video"
              />
            </div>
          )}
          {!formData.is_active && (
            <div className="border-t border-border py-4 text-center text-sm text-amber-700 dark:text-amber-500/90">
              Konten ini sedang tidak aktif / disembunyikan
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Tentang Kami"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Sub Judul</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Sub judul opsional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Konten *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Tulis konten tentang masjid..."
              rows={12}
              required
            />
            <p className="text-xs text-muted-foreground">
              Anda dapat menggunakan HTML untuk formatting (misalnya: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminImageUploadField
              id="tentang-image"
              label="Gambar utama"
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              module="mosque"
              description="Gambar untuk bagian Tentang Kami di situs publik."
            />

            <div className="space-y-2">
              <Label htmlFor="video_url">URL Video (YouTube, dll)</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/embed/..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-lg border border-border bg-muted/20 p-4">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active" className="flex-1">
              Tampilkan di halaman publik
            </Label>
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
      )}
    </>
  );
}
