'use client';

import { useState } from 'react';
import { FileText, Save, Eye, EyeOff, Image, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
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

  // Update form data when data is loaded
  if (data && formData.body === '' && !previewMode) {
    setFormData({
      title: data.title || 'Tentang Kami',
      subtitle: data.subtitle || '',
      body: data.body || '',
      image_url: data.image_url || '',
      video_url: data.video_url || '',
      is_active: data.is_active || false,
    });
  }

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
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Tentang Kami</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="border border-border rounded-lg p-6 space-y-6">
          {formData.image_url && (
            <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
              <img
                src={formData.image_url}
                alt="Tentang Kami"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="text-center">
            {formData.title && <h1 className="text-4xl font-bold mb-2">{formData.title}</h1>}
            {formData.subtitle && <p className="text-xl text-muted">{formData.subtitle}</p>}
          </div>
          <div className="prose dark:prose-invert max-w-none">
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
            <div className="text-center text-sm text-muted py-4 border-t border-border">
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
            <p className="text-xs text-muted">
              Anda dapat menggunakan HTML untuk formatting (misalnya: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">URL Gambar Utama</Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">URL Video (YouTube, dll)</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
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

          <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
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
