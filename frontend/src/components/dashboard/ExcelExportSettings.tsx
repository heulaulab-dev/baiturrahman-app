'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAdminSettings, useUpdateAdminSetting } from '@/services/adminHooks'

export function ExcelExportSettings() {
  const { data, isLoading } = useAdminSettings()
  const update = useUpdateAdminSetting()

  const [bankLine, setBankLine] = useState('')
  const [leftSigner, setLeftSigner] = useState('')
  const [rightSigner, setRightSigner] = useState('')
  const [headerImageURL, setHeaderImageURL] = useState('')

  useEffect(() => {
    if (!data) return
    setBankLine(data['excel.bank_line'] ?? '')
    setLeftSigner(data['excel.signer_left_name'] ?? '')
    setRightSigner(data['excel.signer_right_name'] ?? '')
    setHeaderImageURL(data['excel.header_image_url'] ?? '')
  }, [data])

  const save = async () => {
    try {
      await update.mutateAsync({
        key: 'excel.bank_line',
        value: bankLine,
        description: 'Baris rekening bank pada header export Excel',
      })
      await update.mutateAsync({
        key: 'excel.signer_left_name',
        value: leftSigner,
        description: 'Nama penanda tangan kiri (MENGETAHUI)',
      })
      await update.mutateAsync({
        key: 'excel.signer_right_name',
        value: rightSigner,
        description: 'Nama penanda tangan kanan (DIBUAT OLEH)',
      })
      await update.mutateAsync({
        key: 'excel.header_image_url',
        value: headerImageURL,
        description: 'URL gambar header/logo untuk export Excel',
      })
      toast.success('Pengaturan export Excel berhasil disimpan')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan pengaturan')
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Konfigurasi Export Excel</CardTitle>
        <CardDescription>
          Sesuaikan teks header, tanda tangan, dan gambar header untuk seluruh export Excel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excel-bank-line">Baris rekening/bank</Label>
          <Input
            id="excel-bank-line"
            value={bankLine}
            onChange={(e) => setBankLine(e.target.value)}
            placeholder="Rekening Bank: 0070697179"
            disabled={isLoading || update.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excel-header-image">URL gambar header/logo</Label>
          <Input
            id="excel-header-image"
            value={headerImageURL}
            onChange={(e) => setHeaderImageURL(e.target.value)}
            placeholder="https://.../logo.png"
            disabled={isLoading || update.isPending}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="excel-left-signer">Nama penanda tangan kiri</Label>
            <Input
              id="excel-left-signer"
              value={leftSigner}
              onChange={(e) => setLeftSigner(e.target.value)}
              placeholder="H. MUHAMMAD YAHYA ZUBIR"
              disabled={isLoading || update.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excel-right-signer">Nama penanda tangan kanan</Label>
            <Input
              id="excel-right-signer"
              value={rightSigner}
              onChange={(e) => setRightSigner(e.target.value)}
              placeholder="MOHAMAD DJOKO SANTOSO"
              disabled={isLoading || update.isPending}
            />
          </div>
        </div>
        <Button type="button" onClick={() => void save()} disabled={isLoading || update.isPending}>
          Simpan konfigurasi export
        </Button>
      </CardContent>
    </Card>
  )
}

