'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  type AsetTetap,
  type BarangTidakTetap,
  createAsetTetap,
  createBarangTidakTetap,
  deleteAsetTetap,
  deleteBarangTidakTetap,
  getAsetTetap,
  getBarangTidakTetap,
  updateAsetTetap,
  updateBarangTidakTetap,
} from '@/services/inventaris'

const kategoriOptions = [
  'Sound System',
  'Perlengkapan Sholat',
  'Perlengkapan TPA/Mengaji',
  'Perlengkapan Kebersihan',
  'Perlengkapan Lain-Lain',
] as const

const asetSchema = z.object({
  nama_aset: z.enum(['Tanah', 'Bangunan']),
  luas: z.string().optional(),
})

const barangSchema = z.object({
  kategori: z.enum(kategoriOptions),
  nama_barang: z.string().min(1, 'Nama barang wajib diisi'),
  jumlah: z.number().int().nonnegative().optional(),
  satuan: z.string().optional(),
  kondisi_baik: z.enum(['baik', 'rusak']),
  keterangan: z.string().optional(),
})

type AsetFormValues = z.infer<typeof asetSchema>
type BarangFormValues = z.infer<typeof barangSchema>

export default function InventarisPage() {
  const [asetTetap, setAsetTetap] = useState<AsetTetap[]>([])
  const [barangTidakTetap, setBarangTidakTetap] = useState<BarangTidakTetap[]>([])
  const [loading, setLoading] = useState(true)
  const [openAsetDialog, setOpenAsetDialog] = useState(false)
  const [openBarangDialog, setOpenBarangDialog] = useState(false)
  const [editingAset, setEditingAset] = useState<AsetTetap | null>(null)
  const [editingBarang, setEditingBarang] = useState<BarangTidakTetap | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'aset' | 'barang'; id: string } | null>(null)

  const asetForm = useForm<AsetFormValues>({
    resolver: zodResolver(asetSchema),
    defaultValues: { nama_aset: 'Tanah', luas: '' },
  })

  const barangForm = useForm<BarangFormValues>({
    resolver: zodResolver(barangSchema),
    defaultValues: {
      kategori: 'Sound System',
      nama_barang: '',
      jumlah: undefined,
      satuan: '',
      kondisi_baik: 'baik',
      keterangan: '',
    },
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [asetData, barangData] = await Promise.all([getAsetTetap(), getBarangTidakTetap()])
      setAsetTetap(asetData)
      setBarangTidakTetap(barangData)
    } catch {
      toast.error('Gagal memuat data inventaris')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const barangBaikCount = useMemo(
    () => barangTidakTetap.filter((item) => item.kondisi_baik).length,
    [barangTidakTetap]
  )
  const barangRusakCount = barangTidakTetap.length - barangBaikCount
  const barangBaikPercent = barangTidakTetap.length
    ? Math.round((barangBaikCount / barangTidakTetap.length) * 100)
    : 0
  const barangRusakPercent = barangTidakTetap.length
    ? Math.round((barangRusakCount / barangTidakTetap.length) * 100)
    : 0
  const asetSkeletonIds = ['aset-1', 'aset-2', 'aset-3', 'aset-4']
  const barangSkeletonIds = ['barang-1', 'barang-2', 'barang-3', 'barang-4', 'barang-5', 'barang-6']

  const groupedBarang = useMemo(() => {
    const groups = new Map<string, BarangTidakTetap[]>()
    kategoriOptions.forEach((k) => groups.set(k, []))
    barangTidakTetap.forEach((item) => {
      const existing = groups.get(item.kategori) ?? []
      existing.push(item)
      groups.set(item.kategori, existing)
    })
    return groups
  }, [barangTidakTetap])

  const onSubmitAset = async (values: AsetFormValues) => {
    try {
      if (editingAset) {
        await updateAsetTetap(editingAset.id, values)
        toast.success('Aset tetap berhasil diperbarui')
      } else {
        await createAsetTetap(values)
        toast.success('Aset tetap berhasil ditambahkan')
      }
      setOpenAsetDialog(false)
      setEditingAset(null)
      asetForm.reset({ nama_aset: 'Tanah', luas: '' })
      await fetchData()
    } catch {
      toast.error('Gagal menyimpan data aset tetap')
    }
  }

  const onSubmitBarang = async (values: BarangFormValues) => {
    try {
      const payload = {
        ...values,
        kondisi_baik: values.kondisi_baik === 'baik',
      }
      if (editingBarang) {
        await updateBarangTidakTetap(editingBarang.id, payload)
        toast.success('Barang berhasil diperbarui')
      } else {
        await createBarangTidakTetap(payload)
        toast.success('Barang berhasil ditambahkan')
      }
      setOpenBarangDialog(false)
      setEditingBarang(null)
      barangForm.reset({
        kategori: 'Sound System',
        nama_barang: '',
        jumlah: undefined,
        satuan: '',
        kondisi_baik: 'baik',
        keterangan: '',
      })
      await fetchData()
    } catch {
      toast.error('Gagal menyimpan data barang')
    }
  }

  const openCreateAset = () => {
    setEditingAset(null)
    asetForm.reset({ nama_aset: 'Tanah', luas: '' })
    setOpenAsetDialog(true)
  }

  const openEditAset = (item: AsetTetap) => {
    setEditingAset(item)
    asetForm.reset({ nama_aset: item.nama_aset, luas: item.luas ?? '' })
    setOpenAsetDialog(true)
  }

  const openCreateBarang = () => {
    setEditingBarang(null)
    barangForm.reset({
      kategori: 'Sound System',
      nama_barang: '',
      jumlah: undefined,
      satuan: '',
      kondisi_baik: 'baik',
      keterangan: '',
    })
    setOpenBarangDialog(true)
  }

  const openEditBarang = (item: BarangTidakTetap) => {
    setEditingBarang(item)
    barangForm.reset({
      kategori: item.kategori,
      nama_barang: item.nama_barang,
      jumlah: item.jumlah,
      satuan: item.satuan ?? '',
      kondisi_baik: item.kondisi_baik ? 'baik' : 'rusak',
      keterangan: item.keterangan ?? '',
    })
    setOpenBarangDialog(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'aset') {
        await deleteAsetTetap(deleteTarget.id)
        toast.success('Aset tetap berhasil dihapus')
      } else {
        await deleteBarangTidakTetap(deleteTarget.id)
        toast.success('Barang berhasil dihapus')
      }
      setDeleteTarget(null)
      await fetchData()
    } catch {
      toast.error('Gagal menghapus data')
    }
  }

  const asetRows = (() => {
    if (loading) {
      return asetSkeletonIds.map((id) => (
        <TableRow key={id}>
          <TableCell colSpan={4}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </TableRow>
      ))
    }

    if (asetTetap.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            Belum ada data aset tetap
          </TableCell>
        </TableRow>
      )
    }

    return asetTetap.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{item.nama_aset}</TableCell>
        <TableCell>{item.luas || '-'}</TableCell>
        <TableCell className="space-x-2 text-right">
          <Button size="sm" variant="outline" onClick={() => openEditAset(item)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteTarget({ type: 'aset', id: item.id })}
          >
            Hapus
          </Button>
        </TableCell>
      </TableRow>
    ))
  })()

  const barangRows = loading
    ? barangSkeletonIds.map((id) => (
        <TableRow key={id}>
          <TableCell colSpan={7}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </TableRow>
      ))
    : kategoriOptions.map((kategori) => {
        const items = groupedBarang.get(kategori) ?? []
        const itemRows =
          items.length === 0
            ? [
                <TableRow key={`empty-${kategori}`}>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    Tidak ada data pada kategori ini
                  </TableCell>
                </TableRow>,
              ]
            : items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.nama_barang}</TableCell>
                  <TableCell>{item.jumlah ?? '-'}</TableCell>
                  <TableCell>{item.satuan ?? '-'}</TableCell>
                  <TableCell>{item.kondisi_baik ? 'Baik' : 'Rusak'}</TableCell>
                  <TableCell>{item.keterangan ?? '-'}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => openEditBarang(item)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget({ type: 'barang', id: item.id })}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))

        return (
          <Fragment key={kategori}>
            <TableRow key={`separator-${kategori}`} className="bg-muted/30">
              <TableCell colSpan={7} className="font-medium">
                {kategori}
              </TableCell>
            </TableRow>
            {itemRows}
          </Fragment>
        )
      })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-foreground">Inventaris</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Aset Tetap</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{asetTetap.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Barang</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{barangTidakTetap.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Kondisi Baik</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{barangBaikPercent}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Kondisi Rusak</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{barangRusakPercent}%</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Aset Tetap</CardTitle>
          <Button onClick={openCreateAset}>Tambah Aset</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Luas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asetRows}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Barang Tidak Tetap</CardTitle>
          <Button onClick={openCreateBarang}>Tambah Barang</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barangRows}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openAsetDialog} onOpenChange={setOpenAsetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAset ? 'Edit Aset Tetap' : 'Tambah Aset Tetap'}</DialogTitle>
            <DialogDescription>Isi data aset tetap di bawah ini.</DialogDescription>
          </DialogHeader>
          <Form {...asetForm}>
            <form onSubmit={asetForm.handleSubmit(onSubmitAset)} className="space-y-4">
              <FormField
                control={asetForm.control}
                name="nama_aset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Aset</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tanah">Tanah</SelectItem>
                        <SelectItem value="Bangunan">Bangunan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={asetForm.control}
                name="luas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Luas</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 200 m2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{editingAset ? 'Simpan Perubahan' : 'Simpan'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={openBarangDialog} onOpenChange={setOpenBarangDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBarang ? 'Edit Barang' : 'Tambah Barang'}</DialogTitle>
            <DialogDescription>Isi data barang tidak tetap di bawah ini.</DialogDescription>
          </DialogHeader>
          <Form {...barangForm}>
            <form onSubmit={barangForm.handleSubmit(onSubmitBarang)} className="space-y-4">
              <FormField
                control={barangForm.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kategoriOptions.map((kategori) => (
                          <SelectItem key={kategori} value={kategori}>
                            {kategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={barangForm.control}
                name="nama_barang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Barang</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={barangForm.control}
                  name="jumlah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={barangForm.control}
                  name="satuan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satuan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={barangForm.control}
                name="kondisi_baik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kondisi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baik">Baik</SelectItem>
                        <SelectItem value="rusak">Rusak</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={barangForm.control}
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{editingBarang ? 'Simpan Perubahan' : 'Simpan'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Data yang dihapus tidak dapat dikembalikan. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
