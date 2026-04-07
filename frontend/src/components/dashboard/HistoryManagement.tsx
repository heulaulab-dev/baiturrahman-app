'use client';

import { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, MoreHorizontal, Filter, Search } from 'lucide-react';
import { AdminImageUploadField } from '@/components/dashboard/AdminImageUploadField';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useAdminHistoryEntries,
  useCreateHistoryEntry,
  useUpdateHistoryEntry,
  useDeleteHistoryEntry,
  useToggleHistoryEntryStatus,
} from '@/services/adminHooks';
import type { HistoryEntry } from '@/types';

const categoryOptions = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'event', label: 'Event' },
];

const statusOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

interface HistoryFormData {
  title: string;
  content: string;
  entry_date: string;
  category: 'milestone' | 'achievement' | 'event';
  image_url?: string;
  is_published?: boolean;
}

export function HistoryManagement() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);
  const [formData, setFormData] = useState<HistoryFormData>({
    title: '',
    content: '',
    entry_date: new Date().toISOString().split('T')[0],
    category: 'event',
    image_url: '',
    is_published: false,
  });

  const { data, isLoading } = useAdminHistoryEntries({
    status: filterStatus === 'all' ? undefined : filterStatus,
    category: filterCategory === 'all' ? undefined : filterCategory,
  });

  const createMutation = useCreateHistoryEntry();
  const updateMutation = useUpdateHistoryEntry();
  const deleteMutation = useDeleteHistoryEntry();
  const toggleMutation = useToggleHistoryEntryStatus();

  const entries = data?.data || [];

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      content: '',
      entry_date: new Date().toISOString().split('T')[0],
      category: 'event',
      image_url: '',
      is_published: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: HistoryEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      entry_date: entry.entry_date.split('T')[0],
      category: entry.category,
      image_url: entry.image_url || '',
      is_published: entry.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEntry) {
        await updateMutation.mutateAsync({
          id: editingEntry.id,
          data: formData,
        });
        toast.success('Sejarah berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Sejarah berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Gagal menyimpan sejarah');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus entri sejarah ini?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Sejarah berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus sejarah');
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
        <h2 className="text-2xl font-semibold">Sejarah</h2>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Sejarah
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari sejarah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categoryOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* History Entries List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="h-6 w-64 bg-muted/50 animate-pulse rounded mb-2" />
              <div className="h-4 w-full bg-muted/50 animate-pulse rounded mb-2" />
              <div className="h-4 w-3/4 bg-muted/50 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-primary/25" />
          <p>Tidak ada sejarah yang ditemukan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/25 hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                      {categoryOptions.find(c => c.value === entry.category)?.label || entry.category}
                    </span>
                    <StatusBadge status={entry.is_published ? 'success' : 'default'}>
                      {entry.is_published ? 'Terbit' : 'Draf'}
                    </StatusBadge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{entry.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{entry.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 text-primary/75" />
                    <span>{new Date(entry.entry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={entry.is_published}
                    onCheckedChange={() => handleToggleStatus(entry.id)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Sejarah' : 'Tambah Sejarah Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul sejarah"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Konten *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Masukkan konten sejarah"
                  rows={6}
                  required
                />
              </div>

              <AdminImageUploadField
                id="history-image"
                label="Gambar (opsional)"
                value={formData.image_url ?? ''}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                module="content"
              />

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Terbitkan sekarang</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingEntry ? 'Perbarui' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
