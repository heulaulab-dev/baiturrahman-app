'use client';

import { useState } from 'react';
import { Users, Plus, Edit, Trash2, GripVertical, Mail, Phone, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useAdminStrukturs,
  useCreateStruktur,
  useUpdateStruktur,
  useDeleteStruktur,
  useToggleStrukturStatus,
} from '@/services/adminHooks';
import type { Struktur } from '@/types';

const roleOptions = [
  { value: 'ketua', label: 'Ketua' },
  { value: 'sekretaris', label: 'Sekretaris' },
  { value: 'bendahara', label: 'Bendahara' },
  { value: 'humas', label: 'Humas' },
  { value: 'imam_syah', label: 'Imam Syah' },
  { value: 'muadzin', label: 'Muadzin' },
  { value: 'dai_amil', label: 'Dai Amil' },
  { value: 'marbot', label: 'Marbot' },
  { value: 'lainnya', label: 'Lainnya' },
];

interface StrukturFormData {
  name: string;
  role: 'ketua' | 'sekretaris' | 'bendahara' | 'humas' | 'imam_syah' | 'muadzin' | 'dai_amil' | 'marbot' | 'lainnya';
  photo_url?: string;
  email?: string;
  phone?: string;
  department?: string;
  bio?: string;
  social_media?: Record<string, string>;
  is_active?: boolean;
}

const getRoleLabel = (role: string) => {
  return roleOptions.find(r => r.value === role)?.label || role;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    ketua: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    sekretaris: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    bendahara: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    humas: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    imam_syah: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    muadzin: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    dai_amil: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    marbot: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    lainnya: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[role] || colors.lainnya;
};

export function StrukturManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStruktur, setEditingStruktur] = useState<Struktur | null>(null);
  const [formData, setFormData] = useState<StrukturFormData>({
    name: '',
    role: 'lainnya',
    photo_url: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
    social_media: {},
    is_active: true,
  });

  const { data, isLoading } = useAdminStrukturs();

  const createMutation = useCreateStruktur();
  const updateMutation = useUpdateStruktur();
  const deleteMutation = useDeleteStruktur();
  const toggleMutation = useToggleStrukturStatus();

  const strukturs = data?.data || [];

  // Sort by display order
  const sortedStrukturs = [...strukturs].sort((a, b) => a.display_order - b.display_order);

  const filteredStrukturs = sortedStrukturs.filter(struktur =>
    struktur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    struktur.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (struktur.department && struktur.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = () => {
    setEditingStruktur(null);
    setFormData({
      name: '',
      role: 'lainnya',
      photo_url: '',
      email: '',
      phone: '',
      department: '',
      bio: '',
      social_media: {},
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (struktur: Struktur) => {
    setEditingStruktur(struktur);
    setFormData({
      name: struktur.name,
      role: struktur.role,
      photo_url: struktur.photo_url || '',
      email: struktur.email || '',
      phone: struktur.phone || '',
      department: struktur.department || '',
      bio: struktur.bio || '',
      social_media: (struktur.social_media as unknown as Record<string, string>) || {},
      is_active: struktur.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStruktur) {
        await updateMutation.mutateAsync({
          id: editingStruktur.id,
          data: formData,
        });
        toast.success('Anggota struktur berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Anggota struktur berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Gagal menyimpan anggota struktur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota struktur ini?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Anggota struktur berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus anggota struktur');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
      toast.success('Status berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Struktur Kepengurusan</h2>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Anggota
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Cari anggota struktur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Strukturs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="h-24 w-full bg-muted/50 animate-pulse rounded-full mx-auto mb-4" />
              <div className="h-6 w-3/4 bg-muted/50 animate-pulse rounded mx-auto mb-2" />
              <div className="h-4 w-1/2 bg-muted/50 animate-pulse rounded mx-auto" />
            </div>
          ))}
        </div>
      ) : filteredStrukturs.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted/30" />
          <p>Tidak ada anggota struktur yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStrukturs.map((struktur) => (
            <div
              key={struktur.id}
              className={`border border-border bg-background rounded-lg p-4 transition-all ${!struktur.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <GripVertical className="w-4 h-4 text-muted cursor-move" />
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(struktur.role)}`}>
                    {getRoleLabel(struktur.role)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center mb-4">
                {struktur.photo_url ? (
                  <img
                    src={struktur.photo_url}
                    alt={struktur.name}
                    className="w-20 h-20 rounded-full object-cover mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Users className="w-10 h-10 text-muted/40" />
                  </div>
                )}
                <h3 className="font-semibold text-center">{struktur.name}</h3>
                {struktur.department && (
                  <p className="text-sm text-muted text-center">{struktur.department}</p>
                )}
              </div>

              <div className="space-y-1 text-xs text-muted mb-4">
                {struktur.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{struktur.email}</span>
                  </div>
                )}
                {struktur.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{struktur.phone}</span>
                  </div>
                )}
              </div>

              {struktur.bio && (
                <p className="text-xs text-muted line-clamp-2 mb-4">{struktur.bio}</p>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={struktur.is_active}
                  onCheckedChange={() => handleToggleStatus(struktur.id)}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(struktur)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(struktur.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStruktur ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Peran *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departemen</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Contoh: Bagian Dakwah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo_url">URL Foto</Label>
                  <Input
                    id="photo_url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@contoh.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografi Singkat</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Deskripsi singkat tentang anggota"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Media Sosial</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="facebook" className="text-xs">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.social_media?.facebook || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.social_media?.instagram || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: { ...formData.social_media, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingStruktur ? 'Perbarui' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
