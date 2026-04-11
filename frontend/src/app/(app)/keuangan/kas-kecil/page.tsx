'use client'

import { useFinanceBalance, useFinanceTransactions } from '@/services/financeHooks'

export default function KasKecilPage() {
  const { data: balance } = useFinanceBalance('kas_kecil')
  const { data, isLoading } = useFinanceTransactions({ fund_type: 'kas_kecil', page: 1, limit: 20 })

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Kas Kecil</h2>
        <p className="text-sm text-muted-foreground">Saldo saat ini: Rp {Math.round(balance?.balance ?? 0).toLocaleString('id-ID')}</p>
      </div>
      <div className="rounded-md border p-4 text-sm">
        {isLoading ? 'Memuat transaksi...' : `Total transaksi: ${(data?.total ?? 0).toLocaleString('id-ID')}`}
      </div>
    </div>
  )
}

