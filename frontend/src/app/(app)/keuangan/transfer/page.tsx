'use client'

import { useFinanceTransactions } from '@/services/financeHooks'

export default function TransferKasPage() {
  const { data, isLoading } = useFinanceTransactions({ tx_type: 'transfer_out', page: 1, limit: 20 })

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Transfer Kas</h2>
        <p className="text-sm text-muted-foreground">Daftar transfer dari kas besar ke kas kecil.</p>
      </div>
      <div className="rounded-md border p-4 text-sm">
        {isLoading ? 'Memuat transfer...' : `Total transfer: ${(data?.total ?? 0).toLocaleString('id-ID')}`}
      </div>
    </div>
  )
}

