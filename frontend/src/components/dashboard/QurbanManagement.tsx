'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCreateQurbanAnimal,
  useCreateQurbanParticipant,
  useDeleteQurbanAnimal,
  useDeleteQurbanParticipant,
  useMoveQurbanParticipant,
  useQurbanAnimals,
  useQurbanParticipants,
  useQurbanSettings,
  useUpdateQurbanAnimal,
  useUpdateQurbanParticipant,
  useUpdateQurbanSettings,
} from '@/services/adminHooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { QurbanAnimal } from '@/types'

export function QurbanManagement() {
  const { data: settings } = useQurbanSettings()
  const { data: animals = [], isLoading: animalsLoading } = useQurbanAnimals()
  const updateSettings = useUpdateQurbanSettings()
  const createAnimal = useCreateQurbanAnimal()
  const updateAnimal = useUpdateQurbanAnimal()
  const deleteAnimal = useDeleteQurbanAnimal()
  const createParticipant = useCreateQurbanParticipant()
  const updateParticipant = useUpdateQurbanParticipant()
  const moveParticipant = useMoveQurbanParticipant()
  const deleteParticipant = useDeleteQurbanParticipant()

  const [defaultSapi, setDefaultSapi] = useState(7)
  const [defaultKambing, setDefaultKambing] = useState(1)
  const [animalLabel, setAnimalLabel] = useState('')
  const [animalType, setAnimalType] = useState<'sapi' | 'kambing'>('sapi')
  const [selectedAnimalId, setSelectedAnimalId] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [participantPhone, setParticipantPhone] = useState('')
  const [participantNotes, setParticipantNotes] = useState('')
  const [participantSearch, setParticipantSearch] = useState('')
  const [moveTargetId, setMoveTargetId] = useState('')
  const [overrideDrafts, setOverrideDrafts] = useState<Record<string, string>>({})
  const [editParticipantId, setEditParticipantId] = useState('')
  const [editParticipantName, setEditParticipantName] = useState('')
  const [editParticipantPhone, setEditParticipantPhone] = useState('')
  const [editParticipantNotes, setEditParticipantNotes] = useState('')

  useEffect(() => {
    if (!settings) return
    setDefaultSapi(settings.default_max_participants_sapi)
    setDefaultKambing(settings.default_max_participants_kambing)
  }, [settings])

  const selectedAnimal = useMemo(
    () => animals.find((animal) => animal.id === selectedAnimalId) ?? null,
    [animals, selectedAnimalId]
  )

  const { data: participants = [], isLoading: participantsLoading } = useQurbanParticipants(selectedAnimalId)

  const handleSaveDefaults = () => {
    if (defaultSapi <= 0 || defaultKambing <= 0) {
      toast.error('Kapasitas default harus lebih besar dari 0')
      return
    }
    updateSettings.mutate(
      {
        default_max_participants_sapi: defaultSapi,
        default_max_participants_kambing: defaultKambing,
      },
      {
        onSuccess: () => toast.success('Pengaturan qurban disimpan'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan'),
      }
    )
  }

  const handleCreateAnimal = () => {
    if (!animalLabel.trim()) {
      toast.error('Label hewan wajib diisi')
      return
    }
    createAnimal.mutate(
      {
        label: animalLabel.trim(),
        animal_type: animalType,
      },
      {
        onSuccess: () => {
          toast.success('Hewan qurban ditambahkan')
          setAnimalLabel('')
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menambahkan hewan'),
      }
    )
  }

  const handleCreateParticipant = () => {
    if (!selectedAnimalId) {
      toast.error('Pilih hewan terlebih dahulu')
      return
    }
    if (!participantName.trim()) {
      toast.error('Nama peserta wajib diisi')
      return
    }

    createParticipant.mutate(
      {
        animalId: selectedAnimalId,
        data: {
          name: participantName.trim(),
          phone: participantPhone.trim(),
          notes: participantNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Peserta berhasil ditambahkan')
          setParticipantName('')
          setParticipantPhone('')
          setParticipantNotes('')
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menambah peserta'),
      }
    )
  }

  const handleMoveParticipant = (participantId: string) => {
    if (!moveTargetId) {
      toast.error('Pilih hewan tujuan terlebih dahulu')
      return
    }
    moveParticipant.mutate(
      { id: participantId, targetAnimalId: moveTargetId },
      {
        onSuccess: () => toast.success('Peserta berhasil dipindahkan'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal memindahkan peserta'),
      }
    )
  }

  const handleSaveOverride = (animal: QurbanAnimal) => {
    const raw = (overrideDrafts[animal.id] ?? '').trim()
    const parsed = raw === '' ? null : Number(raw)
    if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
      toast.error('Override harus angka lebih besar dari 0')
      return
    }
    updateAnimal.mutate(
      { id: animal.id, data: { max_participants_override: parsed } },
      {
        onSuccess: () => toast.success(`Override ${animal.label} diperbarui`),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal memperbarui override'),
      }
    )
  }

  const startEditParticipant = (id: string, name: string, phone?: string, notes?: string) => {
    setEditParticipantId(id)
    setEditParticipantName(name)
    setEditParticipantPhone(phone ?? '')
    setEditParticipantNotes(notes ?? '')
  }

  const cancelEditParticipant = () => {
    setEditParticipantId('')
    setEditParticipantName('')
    setEditParticipantPhone('')
    setEditParticipantNotes('')
  }

  const submitEditParticipant = () => {
    if (!editParticipantId) return
    if (!editParticipantName.trim()) {
      toast.error('Nama peserta wajib diisi')
      return
    }
    updateParticipant.mutate(
      {
        id: editParticipantId,
        data: {
          name: editParticipantName.trim(),
          phone: editParticipantPhone.trim(),
          notes: editParticipantNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Peserta berhasil diperbarui')
          cancelEditParticipant()
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal memperbarui peserta'),
      }
    )
  }

  const filteredParticipants = useMemo(() => {
    const keyword = participantSearch.trim().toLowerCase()
    if (!keyword) return participants
    return participants.filter((participant) => {
      return (
        participant.name.toLowerCase().includes(keyword) ||
        (participant.phone ?? '').toLowerCase().includes(keyword) ||
        (participant.notes ?? '').toLowerCase().includes(keyword)
      )
    })
  }, [participants, participantSearch])

  const exportParticipantsCsv = () => {
    if (!selectedAnimal) return
    const rows = [
      ['Nama', 'No HP', 'Catatan'],
      ...filteredParticipants.map((participant) => [participant.name, participant.phone ?? '', participant.notes ?? '']),
    ]
    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeLabel = selectedAnimal.label.toLowerCase().replaceAll(' ', '-')
    link.href = url
    link.download = `qurban-${safeLabel}-peserta.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const renderAnimalRows = () => {
    if (animalsLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6}>Memuat data hewan qurban...</TableCell>
        </TableRow>
      )
    }
    if (animals.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6}>Belum ada data hewan qurban.</TableCell>
        </TableRow>
      )
    }
    return animals.map((animal) => {
      const full = animal.participant_count >= animal.effective_max_participants
      return (
        <TableRow key={animal.id}>
          <TableCell>{animal.label}</TableCell>
          <TableCell className="capitalize">{animal.animal_type}</TableCell>
          <TableCell>
            {animal.participant_count}/{animal.effective_max_participants}
          </TableCell>
          <TableCell>
            <Badge variant={full ? 'destructive' : 'secondary'}>{full ? 'Full' : 'Open'}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                className="h-8 w-24"
                placeholder={String(animal.effective_max_participants)}
                value={overrideDrafts[animal.id] ?? ''}
                onChange={(event) =>
                  setOverrideDrafts((prev) => ({ ...prev, [animal.id]: event.target.value }))
                }
              />
              <Button variant="outline" size="sm" onClick={() => handleSaveOverride(animal)}>
                Simpan
              </Button>
            </div>
          </TableCell>
          <TableCell className="space-x-2 text-right">
            <Button variant="outline" size="sm" onClick={() => setSelectedAnimalId(animal.id)}>
              Kelola Peserta
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                deleteAnimal.mutate(animal.id, {
                  onSuccess: () => toast.success('Hewan qurban dihapus'),
                  onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menghapus hewan'),
                })
              }
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </TableCell>
        </TableRow>
      )
    })
  }

  const renderParticipantRows = (selected: QurbanAnimal) => {
    if (participantsLoading) {
      return (
        <TableRow>
          <TableCell colSpan={4}>Memuat peserta...</TableCell>
        </TableRow>
      )
    }
    if (filteredParticipants.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4}>Belum ada peserta.</TableCell>
        </TableRow>
      )
    }
    return filteredParticipants.map((participant) => (
      <TableRow key={participant.id}>
        <TableCell>
          {editParticipantId === participant.id ? (
            <Input value={editParticipantName} onChange={(event) => setEditParticipantName(event.target.value)} />
          ) : (
            participant.name
          )}
        </TableCell>
        <TableCell>
          {editParticipantId === participant.id ? (
            <Input value={editParticipantPhone} onChange={(event) => setEditParticipantPhone(event.target.value)} />
          ) : (
            participant.phone || '-'
          )}
        </TableCell>
        <TableCell className="max-w-52">
          {editParticipantId === participant.id ? (
            <Input value={editParticipantNotes} onChange={(event) => setEditParticipantNotes(event.target.value)} />
          ) : (
            participant.notes || '-'
          )}
        </TableCell>
        <TableCell className="space-x-2 text-right">
          {editParticipantId === participant.id ? (
            <>
              <Button variant="outline" size="sm" onClick={submitEditParticipant}>
                Simpan Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelEditParticipant}>
                Batal
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => handleMoveParticipant(participant.id)}>
                Pindah
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEditParticipant(participant.id, participant.name, participant.phone, participant.notes)}
              >
                Edit
              </Button>
            </>
          )}
          <Select value={moveTargetId} onValueChange={setMoveTargetId}>
            <SelectTrigger className="inline-flex h-8 w-36">
              <SelectValue placeholder="Pilih hewan" />
            </SelectTrigger>
            <SelectContent>
              {animals
                .filter((animal) => animal.id !== selected.id)
                .map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              deleteParticipant.mutate(participant.id, {
                onSuccess: () => toast.success('Peserta dihapus'),
                onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menghapus peserta'),
              })
            }
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Kapasitas Qurban</CardTitle>
          <CardDescription>Default kapasitas berlaku untuk hewan baru. Hewan existing tidak berubah otomatis.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="default-sapi">Default slot sapi</Label>
            <Input
              id="default-sapi"
              type="number"
              min={1}
              value={defaultSapi}
              onChange={(event) => setDefaultSapi(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-kambing">Default slot kambing</Label>
            <Input
              id="default-kambing"
              type="number"
              min={1}
              value={defaultKambing}
              onChange={(event) => setDefaultKambing(Number(event.target.value))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSaveDefaults} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Simpan Pengaturan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Hewan Qurban</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="animal-label">Label hewan</Label>
            <Input
              id="animal-label"
              placeholder="Contoh: Sapi 1"
              value={animalLabel}
              onChange={(event) => setAnimalLabel(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="animal-type">Jenis hewan</Label>
            <Select value={animalType} onValueChange={(value: 'sapi' | 'kambing') => setAnimalType(value)}>
              <SelectTrigger id="animal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sapi">Sapi</SelectItem>
                <SelectItem value="kambing">Kambing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreateAnimal} disabled={createAnimal.isPending}>
              <Plus className="mr-2 size-4" />
              Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kantong Qurban</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Override Slot</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderAnimalRows()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedAnimal ? (
        <Card>
          <CardHeader>
            <CardTitle>Peserta {selectedAnimal.label}</CardTitle>
            <CardDescription>
              Slot terisi {selectedAnimal.participant_count}/{selectedAnimal.effective_max_participants}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Input
                placeholder="Nama peserta"
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
              />
              <Input
                placeholder="No. HP (opsional)"
                value={participantPhone}
                onChange={(event) => setParticipantPhone(event.target.value)}
              />
              <Input
                placeholder="Catatan (opsional)"
                value={participantNotes}
                onChange={(event) => setParticipantNotes(event.target.value)}
              />
              <Button onClick={handleCreateParticipant} disabled={createParticipant.isPending}>
                Tambah Peserta
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                className="sm:max-w-xs"
                placeholder="Cari nama / no HP / catatan"
                value={participantSearch}
                onChange={(event) => setParticipantSearch(event.target.value)}
              />
              <Button variant="outline" onClick={exportParticipantsCsv}>
                <Download className="mr-2 size-4" />
                Export CSV
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>No. HP</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderParticipantRows(selectedAnimal)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
